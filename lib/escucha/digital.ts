import { spawn } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { REDES } from "./redes";

/* Escucha digital gratis = un Quick Search de Talkwalker por marca y país.
 *
 * Corre el motor que ya existe en el VPS (/opt/sentinel-ingest/tw-qs-mcp.js):
 * QSTopic efímero, no gasta cupo de topics ni créditos. Comparte la sesión de
 * Talkwalker con la ingesta de Sentinel, así que:
 *   · una sola consulta a la vez (cola en proceso);
 *   · tope diario global (ESCUCHA_DIGITAL_TOPE_DIA, 40 por defecto);
 *   · caché de 24 h por marca+país: la misma marca no vuelve a pegarle a Talkwalker.
 * Al navegador solo salen agregados: conteos por red, tono, medios y titulares
 * de medios. Nunca nombres ni textos de personas.
 *
 * Modos (ESCUCHA_DIGITAL_MODO): "local" corre el script en esta máquina (prod,
 * mismo VPS); "ssh" lo corre por ssh (vista previa desde la Mac); "off" = 503. */

const MODO = process.env.ESCUCHA_DIGITAL_MODO ?? "off";
const SSH_DESTINO = process.env.ESCUCHA_DIGITAL_SSH ?? "root@2.25.128.2";
const SCRIPT_DIR = "/opt/sentinel-ingest";
const TOPE_DIA = Number(process.env.ESCUCHA_DIGITAL_TOPE_DIA ?? 40);
const CACHE_MS = 24 * 3600e3;
const DIAS = 30;
const TECHO_LLAMADAS = 8; // ~2 min por consulta, medido el 20-oct con Dos Pinos (109 s)

export type Resumen = {
  marca: string;
  cc: string;
  desde: string;
  hasta: string;
  total: number; // total exacto de Talkwalker en la ventana
  muestra: number; // menciones leídas para el desglose
  porRed: Record<string, number>; // sobre la muestra
  tono: { positivo: number; neutral: number; negativo: number };
  medios: { nombre: string; n: number }[];
  titulares: { medio: string; titulo: string; url: string; fecha: string }[];
  porDia: { dia: string; n: number }[];
  alcance: number;
  interacciones: number;
};

type Trabajo = {
  id: string;
  clave: string;
  estado: "en_cola" | "corriendo" | "listo" | "error";
  creado: number;
  resumen?: Resumen;
  error?: string;
};

const g = globalThis as unknown as {
  __escuchaTrabajos?: Map<string, Trabajo>;
  __escuchaCache?: Map<string, { t: number; resumen: Resumen }>;
  __escuchaCola?: string[];
  __escuchaCorriendo?: boolean;
  __escuchaDia?: { dia: string; n: number };
};
const trabajos = (g.__escuchaTrabajos ??= new Map());
const cache = (g.__escuchaCache ??= new Map());
const cola = (g.__escuchaCola ??= []);
g.__escuchaDia ??= { dia: "", n: 0 };

export function limpiarMarca(s: string): string {
  return s
    .normalize("NFC")
    .replace(/["'()\[\]{}:*?\\^~]/g, " ")
    .replace(/\b(AND|OR|NOT)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}

function claveDe(marca: string, cc: string) {
  return createHash("sha1").update(marca.toLowerCase() + "|" + cc).digest("hex").slice(0, 16);
}

export function iniciar(marca: string, cc: string): { ok: true; id: string; enCola: number } | { ok: false; error: string } {
  if (MODO === "off") return { ok: false, error: "apagado" };
  const clave = claveDe(marca, cc);
  const hit = cache.get(clave);
  const id = randomUUID();
  if (hit && Date.now() - hit.t < CACHE_MS) {
    trabajos.set(id, { id, clave, estado: "listo", creado: Date.now(), resumen: hit.resumen });
    return { ok: true, id, enCola: 0 };
  }
  // ¿Ya hay un trabajo vivo para la misma marca? Se comparte.
  for (const t of trabajos.values()) {
    if (t.clave === clave && (t.estado === "en_cola" || t.estado === "corriendo")) return { ok: true, id: t.id, enCola: cola.indexOf(t.id) + 1 };
  }
  const hoy = new Date().toISOString().slice(0, 10);
  if (g.__escuchaDia!.dia !== hoy) g.__escuchaDia = { dia: hoy, n: 0 };
  if (g.__escuchaDia!.n >= TOPE_DIA) return { ok: false, error: "tope_dia" };
  if (cola.length >= 6) return { ok: false, error: "cola_llena" };
  g.__escuchaDia!.n += 1;
  trabajos.set(id, { id, clave, estado: "en_cola", creado: Date.now() });
  (trabajos.get(id) as Trabajo & { marca?: string; cc?: string }).marca = marca;
  (trabajos.get(id) as Trabajo & { marca?: string; cc?: string }).cc = cc;
  cola.push(id);
  void bombear();
  return { ok: true, id, enCola: cola.length };
}

export function consultar(id: string): (Pick<Trabajo, "estado" | "resumen" | "error"> & { enCola: number }) | null {
  const t = trabajos.get(id);
  if (!t) return null;
  return { estado: t.estado, resumen: t.resumen, error: t.error, enCola: cola.indexOf(id) + 1 };
}

async function bombear() {
  if (g.__escuchaCorriendo) return;
  g.__escuchaCorriendo = true;
  try {
    while (cola.length) {
      const id = cola[0];
      const t = trabajos.get(id) as Trabajo & { marca: string; cc: string };
      t.estado = "corriendo";
      try {
        const crudo = await correrQuickSearch(t.marca, t.cc);
        const resumen = resumir(crudo, t.marca, t.cc);
        t.resumen = resumen;
        t.estado = "listo";
        cache.set(t.clave, { t: Date.now(), resumen });
      } catch (e) {
        t.estado = "error";
        t.error = (e as Error).message.slice(0, 200);
        console.error("[escucha-digital]", t.error);
      }
      cola.shift();
    }
  } finally {
    g.__escuchaCorriendo = false;
  }
  // Limpieza: trabajos de más de 2 h.
  const corte = Date.now() - 2 * 3600e3;
  for (const [k, v] of trabajos) if (v.creado < corte) trabajos.delete(k);
}

type Articulo = {
  fecha: string;
  tipo: string;
  medio: string;
  pais: string | null;
  titulo: string | null;
  texto?: string | null;
  url: string;
  sentimiento: string;
  engagement?: number;
  alcance?: number;
};
type Crudo = { ok: boolean; desde: string; hasta: string; total_talkwalker: number; traidos: number; articulos: Articulo[] };

function correrQuickSearch(marca: string, cc: string): Promise<Crudo> {
  const consulta = `"${marca}" AND (sourcecountry:${cc} OR authorcountry:${cc})`;
  const arg = JSON.stringify({ consulta, dias: DIAS, techo: TECHO_LLAMADAS });
  const b64 = Buffer.from(arg).toString("base64");
  const [cmd, args] =
    MODO === "ssh"
      ? ["ssh", ["-o", "ConnectTimeout=15", SSH_DESTINO, `cd ${SCRIPT_DIR} && node tw-qs-mcp.js "$(echo ${b64} | base64 -d)"`]]
      : ["node", [`${SCRIPT_DIR}/tw-qs-mcp.js`, arg]];
  return new Promise((resolve, reject) => {
    const p = spawn(cmd as string, args as string[], { cwd: MODO === "ssh" ? undefined : SCRIPT_DIR });
    let out = "";
    let err = "";
    const reloj = setTimeout(() => p.kill("SIGTERM"), 7 * 60e3);
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) => {
      clearTimeout(reloj);
      try {
        const j = JSON.parse(out) as Crudo;
        if (!j.ok) return reject(new Error("quicksearch_no_ok"));
        resolve(j);
      } catch {
        reject(new Error(`quicksearch_salida_invalida code=${code} ${err.slice(-160)}`));
      }
    });
  });
}

const norm = (x: string) => x.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
const ES_MEDIO = new Set(["onlinenews", "news", "print", "tv", "radio", "blog"]);

function resumir(c: Crudo, marca: string, cc: string): Resumen {
  const porRed: Record<string, number> = {};
  for (const r of REDES) porRed[r.key] = 0;
  const tono = { positivo: 0, neutral: 0, negativo: 0 };
  const medios = new Map<string, number>();
  const dias = new Map<string, number>();
  let alcance = 0;
  let interacciones = 0;
  const titulares: Resumen["titulares"] = [];
  const vistos = new Set<string>();
  for (const a of c.articulos ?? []) {
    const red = REDES.find((r) => r.tipos.includes(a.tipo));
    if (red) porRed[red.key] += 1;
    if (a.sentimiento === "positive") tono.positivo += 1;
    else if (a.sentimiento === "negative") tono.negativo += 1;
    else tono.neutral += 1;
    const dia = (a.fecha ?? "").slice(0, 10);
    if (dia) dias.set(dia, (dias.get(dia) ?? 0) + 1);
    alcance += Number(a.alcance) || 0;
    interacciones += Number(a.engagement) || 0;
    // Solo medios y blogs con nombre: nunca cuentas de personas.
    if (ES_MEDIO.has(a.tipo) && a.medio) {
      const m = a.medio.replace(/^www\./, "");
      medios.set(m, (medios.get(m) ?? 0) + 1);
      // Titular solo si la nota nombra a la marca (Talkwalker trae notas que la citan de pasada o por homónimo).
      const nombra = norm((a.titulo ?? "") + " " + (a.texto ?? "")).includes(norm(marca));
      if (a.titulo && nombra && a.tipo === "onlinenews" && !vistos.has(a.titulo) && titulares.length < 4) {
        vistos.add(a.titulo);
        titulares.push({ medio: m, titulo: a.titulo.slice(0, 160), url: a.url, fecha: dia });
      }
    }
  }
  return {
    marca,
    cc,
    desde: c.desde,
    hasta: c.hasta,
    total: c.total_talkwalker ?? 0,
    muestra: c.traidos ?? (c.articulos ?? []).length,
    porRed,
    tono,
    medios: [...medios.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([nombre, n]) => ({ nombre, n })),
    titulares,
    porDia: [...dias.entries()].sort().map(([dia, n]) => ({ dia, n })),
    alcance,
    interacciones,
  };
}
