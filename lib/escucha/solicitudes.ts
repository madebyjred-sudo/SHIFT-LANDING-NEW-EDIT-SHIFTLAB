import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { busquedaGoogle, terminosIA, type Calientes } from "./calientes";
import { consultar, iniciar, type Resumen } from "./digital";
import { escucharIA, type Crudo, type ResIAServidor } from "./ia";
import { paisPorCc } from "./paises";

/* Reportes por correo (como el AEO Report de Profound): la landing nunca
 * cambia. Se pide con marca, país y correo de trabajo; el análisis corre en
 * segundo plano y al terminar llega un enlace a /shift-lab/reporte/<id>.
 * Cada reporte se guarda como JSON en disco (sobrevive a reinicios). */

export type Tipo = "ia" | "digital" | "integral";
export type Reporte = {
  id: string;
  tipo: Tipo;
  marca: string;
  cc: string;
  pais: string;
  correo: string;
  creado: number;
  estado: "en_proceso" | "listo" | "error";
  terminado?: number;
  ia?: { resultados: ResIAServidor[]; crudo: Crudo } | { error: string };
  digital?: { resumen: Resumen } | { error: string };
  calientes?: Calientes;
  correoEnviado?: boolean;
};

const DIR = process.env.ESCUCHA_DATA_DIR ?? path.join(process.cwd(), ".data", "escuchas");
const ruta = (id: string) => path.join(DIR, `${id.replace(/[^a-f0-9-]/g, "")}.json`);

/** Reporte vigente (30 días) o null. */
export async function leerVigente(id: string): Promise<Reporte | null> {
  const r = await leer(id);
  return r && Date.now() - r.creado <= 30 * 86400e3 ? r : null;
}

export async function leer(id: string): Promise<Reporte | null> {
  if (!/^[a-f0-9-]{36}$/.test(id)) return null;
  try {
    return JSON.parse(await readFile(ruta(id), "utf8")) as Reporte;
  } catch {
    return null;
  }
}
async function guardar(r: Reporte) {
  await mkdir(DIR, { recursive: true });
  await writeFile(ruta(r.id), JSON.stringify(r));
}

/** Un reporte listo de las últimas 24 h para el mismo correo, marca, país y tipo: se reenvía en vez de correr otro. */
async function reciente(correo: string, marca: string, cc: string, tipo: Tipo): Promise<Reporte | null> {
  try {
    const archivos = await readdir(DIR);
    const corte = Date.now() - 24 * 3600e3;
    for (const f of archivos.slice(-400)) {
      const r = JSON.parse(await readFile(path.join(DIR, f), "utf8")) as Reporte;
      if (r.creado > corte && r.correo === correo && r.cc === cc && r.tipo === tipo && r.marca.toLowerCase() === marca.toLowerCase() && r.estado !== "error") return r;
    }
  } catch {
    /* sin carpeta todavía */
  }
  return null;
}

export async function crearSolicitud(o: { tipo: Tipo; marca: string; cc: string; correo: string; ip: string }): Promise<{ id: string; repetido: boolean }> {
  const previo = await reciente(o.correo, o.marca, o.cc, o.tipo);
  if (previo) {
    if (previo.estado === "listo") void enviarEnlace(previo);
    return { id: previo.id, repetido: true };
  }
  const r: Reporte = { id: randomUUID(), tipo: o.tipo, marca: o.marca, cc: o.cc, pais: paisPorCc(o.cc).nombre, correo: o.correo, creado: Date.now(), estado: "en_proceso" };
  await guardar(r);
  void correr(r, o.ip);
  return { id: r.id, repetido: false };
}

async function digitalCompleto(marca: string, cc: string): Promise<{ resumen: Resumen } | { error: string }> {
  const ini = iniciar(marca, cc);
  if (!ini.ok) return { error: ini.error };
  for (let i = 0; i < 120; i++) {
    const s = consultar(ini.id);
    if (!s) return { error: "perdido" };
    if (s.estado === "listo" && s.resumen) return { resumen: s.resumen };
    if (s.estado === "error") return { error: s.error ?? "error" };
    await new Promise((res) => setTimeout(res, 4000));
  }
  return { error: "tiempo" };
}

async function correr(r: Reporte, ip: string) {
  try {
    const [ia, digital, busqueda] = await Promise.all([
      r.tipo !== "digital" ? escucharIA(r.marca, r.cc, ip) : Promise.resolve(null),
      r.tipo !== "ia" ? digitalCompleto(r.marca, r.cc) : Promise.resolve(null),
      busquedaGoogle(r.marca, r.cc),
    ]);
    if (ia) r.ia = ia.ok ? { resultados: ia.resultados, crudo: ia.crudo } : { error: ia.error };
    if (digital) r.digital = digital;
    r.calientes = {
      busqueda,
      ia: ia?.ok ? terminosIA(ia.crudo, r.marca) : [],
      conversacion: digital && "resumen" in digital ? (digital.resumen.calientes ?? []) : [],
    };
    const iaOk = !ia || ia.ok;
    const digOk = !digital || "resumen" in digital;
    r.estado = iaOk || digOk ? "listo" : "error";
  } catch (e) {
    console.error("[escucha-reporte]", (e as Error).message);
    r.estado = "error";
  }
  r.terminado = Date.now();
  await guardar(r);
  if (r.estado === "listo") {
    r.correoEnviado = await enviarEnlace(r);
    await guardar(r);
  } else await enviarAviso(r);
}

/* ---------- Correo ---------- */

const BASE = () => (process.env.ESCUCHA_BASE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "https://shiftlatam.agency").replace(/\/$/, "");
const NOMBRE: Record<Tipo, string> = { ia: "Escucha en IA · Eco", digital: "Escucha digital · Sentinel", integral: "Escucha integral · Eco + Sentinel" };
const COLOR: Record<Tipo, string> = { ia: "#1534dc", digital: "#9244D8", integral: "#f540ff" };

async function mandar(para: string, asunto: string, html: string, texto: string): Promise<boolean> {
  const llave = process.env.RESEND_API_KEY;
  if (process.env.NODE_ENV !== "production") console.log(`[escucha] correo a ${para}: ${asunto} · ${texto.match(/https?:\/\/\S+/)?.[0] ?? ""}`);
  if (!llave) return process.env.NODE_ENV !== "production";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: ["Bearer", llave].join(" "), "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.ESCUCHA_CORREO_FROM ?? "Shift LAB <escucha@eco.shiftlabdev.space>", to: [para], subject: asunto, html, text: texto }),
      signal: AbortSignal.timeout(10000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export function enlace(r: Pick<Reporte, "id">) {
  return `${BASE()}/shift-lab/reporte/${r.id}`;
}

async function enviarEnlace(r: Reporte): Promise<boolean> {
  const url = enlace(r);
  const c = COLOR[r.tipo];
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f5fb;padding:32px 12px"><div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;padding:36px 32px;color:#0e1745">
  <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${c};font-weight:700;margin:0">Shift LAB · ${NOMBRE[r.tipo]}</p>
  <h1 style="font-size:24px;line-height:1.2;margin:14px 0 10px">Tu reporte de ${escapar(r.marca)} está listo</h1>
  <p style="font-size:15px;line-height:1.6;color:#4a5488;margin:0 0 24px">Lo que dicen de ${escapar(r.marca)} en ${escapar(r.pais)}${r.tipo === "digital" ? " las redes y los medios" : r.tipo === "ia" ? " las inteligencias artificiales" : " la IA, las redes y los medios"}, y las palabras calientes de tu marca. El enlace queda activo 30 días.</p>
  <a href="${url}" style="display:inline-block;background:${c};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 24px;border-radius:10px">Ver mi reporte</a>
  <p style="font-size:12px;color:#858eb4;margin:28px 0 0">Si el botón no abre, copia este enlace: ${url}</p></div></div>`;
  return mandar(r.correo, `Tu reporte de ${r.marca} está listo · Shift LAB`, html, `Tu reporte de ${r.marca} está listo: ${url}`);
}

async function enviarAviso(r: Reporte) {
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0e1745"><h1 style="font-size:20px">No pudimos terminar tu reporte de ${escapar(r.marca)}</h1><p style="font-size:15px;color:#4a5488">Las fuentes no respondieron a tiempo. Vuelve a pedirlo en unos minutos desde ${BASE()}/shift-lab.</p></div>`;
  await mandar(r.correo, `No pudimos terminar tu reporte de ${r.marca}`, html, `No pudimos terminar tu reporte de ${r.marca}. Vuelve a pedirlo en unos minutos.`);
}

const escapar = (s: string) => s.replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m]!);
