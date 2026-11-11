import { lookup } from "node:dns/promises";

/* Del sitio web al nombre de la marca: og:site_name, application-name o el
 * <title> (la parte de la marca), y si nada sirve, el dominio. */

export function normalizarSitio(bruto: string): { url: string; dominio: string } | null {
  const s = bruto.trim().replace(/\s+/g, "");
  if (!s) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(u.hostname)) return null;
    return { url: `https://${u.hostname}${u.pathname === "/" ? "" : u.pathname}`, dominio: u.hostname.replace(/^www\./, "").toLowerCase() };
  } catch {
    return null;
  }
}

const meta = (html: string, prop: string) =>
  html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']{2,80})["']`, "i"))?.[1] ??
  html.match(new RegExp(`<meta[^>]+content=["']([^"']{2,80})["'][^>]*(?:property|name)=["']${prop}["']`, "i"))?.[1];

const NOMBRADAS: Record<string, string> = { amp: "&", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", lt: "<", gt: ">", laquo: "«", raquo: "»", middot: "·", bull: "•", hellip: "…" };
// WordPress escribe «EquySer &#8211; Equipos y Servicios»: numéricas y nombradas.
const entidades = (s: string) =>
  s
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] !== "#") return NOMBRADAS[e.toLowerCase()] ?? m;
      const n = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
    })
    .trim();

/* De «Marca – Bajada» o «Inicio | Marca», la parte que se parece al dominio. */
const plano = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const partesDe = (texto: string) => entidades(texto).split(/\s[|·•\-–—:]\s|:\s/).map((p) => p.trim()).filter(Boolean);
function parecidaAlDominio(partes: string[], dominio: string): string | undefined {
  const dom = plano(desdeDominio(dominio));
  return partes.find((p) => plano(p).length >= 2 && (plano(p).includes(dom) || dom.includes(plano(p))));
}

// Títulos de muros anti-bots o errores: no son la marca.
const BASURA = /(error|request could not|access denied|restrict access|forbidden|attention required|just a moment|radware|captcha|cloudflare|not found|404|403|página no encontrada|bienvenido|welcome|home|inicio)$/i;
const esBasura = (t: string) => BASURA.test(t.trim()) || /error|request could not|access denied|radware|just a moment|captcha/i.test(t);

/* «dospinos» → «Dos Pinos»: el autocompletado de Google sabe cómo se escribe la marca con espacios. */
async function espaciar(etiqueta: string, cc = "cr"): Promise<string | null> {
  try {
    const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=${cc}&q=${encodeURIComponent(etiqueta)}`, { signal: AbortSignal.timeout(5000), headers: { "User-Agent": "Mozilla/5.0" } });
    const sug = ((await r.json()) as [string, string[]])[1] ?? [];
    const plano = etiqueta.toLowerCase();
    for (const t of sug) {
      let i = 0, out = "";
      for (const ch of t) {
        if (i >= plano.length) break;
        if (ch === " ") { out += ch; continue; }
        if (ch.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase() !== plano[i]) { out = ""; break; }
        out += ch; i++;
      }
      if (i === plano.length && out.includes(" ")) return out.trim().replace(/\b\p{L}/gu, (c) => c.toUpperCase());
    }
  } catch {
    /* sin red */
  }
  return null;
}

/* Segundo nivel de país (.fi.cr de los bancos de Costa Rica, .com.co, .gob.mx): no es la marca. Solo se salta
 * cuando va justo antes del dominio de país, para no comerse una marca que se llame igual. */
const SEGUNDO_NIVEL = new Set(["com", "co", "net", "org", "gob", "gov", "edu", "fi", "ac", "ed", "go", "or", "sa", "nom", "web", "info", "mil", "int"]);
function desdeDominio(dominio: string): string {
  const partes = dominio.split(".").filter((p) => p !== "www");
  partes.pop();
  if (partes.length > 1 && SEGUNDO_NIVEL.has(partes[partes.length - 1])) partes.pop();
  const base = partes.pop() ?? dominio;
  return base.replace(/[-_]+/g, " ").replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

export async function marcaDesdeSitio(bruto: string): Promise<{ marca: string; dominio: string } | null> {
  const n = normalizarSitio(bruto);
  if (!n) return null;
  try {
    await lookup(n.dominio.includes(".") ? n.dominio : "");
  } catch {
    try { await lookup(`www.${n.dominio}`); } catch { return null; }
  }
  let html = "";
  try {
    const r = await fetch(n.url, { headers: { "User-Agent": "Mozilla/5.0 (ShiftLAB escucha)", Accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(7000) });
    html = (await r.text()).slice(0, 200_000);
  } catch {
    /* sitio caído o lento: queda el dominio */
  }
  const candidato = meta(html, "og:site_name") ?? meta(html, "application-name");
  if (candidato && !esBasura(candidato)) return { marca: (parecidaAlDominio(partesDe(candidato), n.dominio) ?? entidades(candidato)).slice(0, 60), dominio: n.dominio };
  const titulo = html.match(/<title[^>]*>([^<]{2,160})<\/title>/i)?.[1];
  if (titulo) {
    const partes = partesDe(titulo);
    // La parte que más se parece al dominio; si ninguna, la más corta.
    const elegida = parecidaAlDominio(partes, n.dominio) ?? partes.sort((a, b) => a.length - b.length)[0];
    // Igual al dominio («Dospinos») no aporta y se prueba con espacios; con mayúsculas propias («EquySer») sí.
    const mixta = /\p{Ll}/u.test(elegida ?? "") && /\p{Lu}/u.test((elegida ?? "").slice(1));
    if (elegida && elegida.length <= 60 && !esBasura(elegida) && (mixta || elegida.toLowerCase() !== desdeDominio(n.dominio).toLowerCase())) return { marca: elegida, dominio: n.dominio };
  }
  const base = desdeDominio(n.dominio);
  const conEspacios = base.includes(" ") ? null : await espaciar(base.toLowerCase());
  return { marca: conEspacios ?? base, dominio: n.dominio };
}
