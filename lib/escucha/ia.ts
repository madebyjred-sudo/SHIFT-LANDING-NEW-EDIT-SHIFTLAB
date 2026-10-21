import { PAISES } from "@/lib/escucha/paises";

/* Escucha en IA gratis = el "dossier shot" de Eco (POST /api/dossier/shot):
 * una pregunta fija a seis IA con búsqueda web. Eco ya trae sus candados
 * (flag maestro, una prueba por IP, tope diario global); acá solo se le pasa
 * la IP real del visitante para que el límite sea por persona y no por la
 * landing entera. */
const ECO = process.env.ECO_BASE_URL ?? "https://eco.shiftlabdev.space";

/* Misma regla que el dossier de Eco: no te conoce solo si la respuesta ARRANCA
 * diciendo que no tiene información o que la marca no existe. */
function noLaConoce(answer: string): boolean {
  const a = (answer || "").trim();
  if (!a || a === "Sin respuesta.") return true;
  const head = a.slice(0, 95).toLowerCase();
  if (
    /^(lamentablemente\s+)?(no\s+(tengo|encuentro|dispongo|cuento con|hallo|conozco|reconozco|puedo (confirmar|encontrar|verificar|darte)|hay|existe|figura|me consta)|desconozco)/.test(head)
  )
    return true;
  return /no existe\s+(una|ninguna)?\s*(marca|empresa|compañía|compania|organización|organizacion)/i.test(a);
}

/* Caché de 24 h por marca+país: las tres landings comparten la misma consulta
 * y el visitante que pasa de una a otra no gasta otra prueba. */
const g = globalThis as unknown as { __escuchaIA?: Map<string, { t: number; crudo: Crudo }> };
const cacheIA = (g.__escuchaIA ??= new Map());
export type Crudo = { key: string; answer: string; error?: boolean }[];

/* Solo vista previa local: el shot de Eco en prod todavía no trae a Meta
 * (va en la rama eco/dossier-desde-landing). Con ESCUCHA_IA_COMPLETAR=1 la
 * landing pide a Cerebro las casas que falten, con el mismo modelo y prompt. */
const COMPLETAR: Record<string, string> = { meta: "meta-llama/llama-4-maverick:online", gemini: "google/gemini-3.8-flash:online" };
async function completarLocal(crudo: Crudo, marca: string, pais: string): Promise<Crudo> {
  const base = process.env.CEREBRO_BASE_URL;
  if (process.env.ESCUCHA_IA_COMPLETAR !== "1" || !base) return crudo;
  const faltan = Object.entries(COMPLETAR).filter(([k]) => !crudo.some((r) => r.key === k && !r.error));
  const extra = await Promise.all(
    faltan.map(async ([key, model]) => {
      try {
        const r = await fetch(`${base}/v1/llm/invoke`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Tenant": "eco" },
          body: JSON.stringify({
            model,
            system: "Respondé en español, en 3-4 frases, como le hablarías a una persona que pregunta por una marca. Sé honesto: si no conocés la marca, decilo.",
            prompt: `Contame sobre ${marca} en ${pais}: qué ofrece, qué tan recomendada es y qué alternativas existen.`,
            max_tokens: 800,
            temperature: 0.4,
            trace_label: "eco.dossier.shot",
          }),
          signal: AbortSignal.timeout(45_000),
        });
        const j = (await r.json()) as { text?: string; output?: string };
        const answer = String(j.text ?? j.output ?? "").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[\d+\]/g, "").trim();
        return { key, answer: answer || "Sin respuesta." };
      } catch {
        return { key, answer: "", error: true };
      }
    }),
  );
  return [...crudo.filter((r) => !extra.some((e) => e.key === r.key)), ...extra];
}

const sinAcentos = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();


export type ResIAServidor = { key: string; answer: string; error: boolean; conoce: boolean; nombra: boolean };

/** Corre (o lee de caché) la escucha en IA de una marca. ip = la del visitante, para el tope por persona de Eco. */
// Dos pedidos de la misma marca a la vez (p. ej. reporte de IA + integral) comparten una sola consulta a Eco.
const enVuelo = ((globalThis as unknown as { __escuchaIAVuelo?: Map<string, Promise<unknown>> }).__escuchaIAVuelo ??= new Map());
export function escucharIA(marca: string, cc: string, ip = ""): Promise<Awaited<ReturnType<typeof escucharIAUna>>> {
  const k = `${marca.toLowerCase()}|${cc}`;
  const vivo = enVuelo.get(k) as ReturnType<typeof escucharIAUna> | undefined;
  if (vivo) return vivo;
  const p = escucharIAUna(marca, cc, ip).finally(() => enVuelo.delete(k));
  enVuelo.set(k, p);
  return p;
}

async function escucharIAUna(marca: string, cc: string, ip = ""): Promise<{ ok: true; crudo: Crudo; resultados: ResIAServidor[]; pais: string } | { ok: false; error: "datos" | "eco" | "apagado" | "usado" }> {
  const pais = PAISES.find((p) => p.cc === cc);
  if (marca.length < 2 || !pais) return { ok: false, error: "datos" };
  const clave = `${marca.toLowerCase()}|${pais.cc}`;
  let crudo: Crudo | null = null;
  const hit = cacheIA.get(clave);
  if (hit && Date.now() - hit.t < 24 * 3600e3) {
    crudo = hit.crudo.some((r: Crudo[number]) => r.error) ? await completarLocal(hit.crudo, marca, pais.nombre) : hit.crudo;
    cacheIA.set(clave, { t: hit.t, crudo });
  }
  if (!crudo) {
    let res: Response;
    try {
      res = await fetch(`${ECO}/api/dossier/shot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(ip ? { "X-Forwarded-For": ip } : {}) },
        body: JSON.stringify({ company: marca, country: pais.nombre }),
        signal: AbortSignal.timeout(85_000),
      });
    } catch {
      return { ok: false, error: "eco" };
    }
    if (res.status === 503) return { ok: false, error: "apagado" };
    if (res.status === 429) return { ok: false, error: "usado" };
    const data = (await res.json().catch(() => null)) as { ok?: boolean; results?: Crudo } | null;
    if (!data?.ok || !Array.isArray(data.results)) return { ok: false, error: "eco" };
    crudo = await completarLocal(data.results, marca, pais.nombre);
    cacheIA.set(clave, { t: Date.now(), crudo });
  }
  const m = sinAcentos(marca);
  const resultados = crudo.map((r) => {
    const conoce = !r.error && !noLaConoce(r.answer);
    return { key: r.key, answer: r.answer, error: Boolean(r.error), conoce, nombra: conoce && sinAcentos(r.answer).includes(m) };
  });
  return { ok: true, crudo, resultados, pais: pais.nombre };
}
