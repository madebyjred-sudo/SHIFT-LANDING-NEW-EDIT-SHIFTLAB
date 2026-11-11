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

/* De «Marca – Bajada» o «Inicio | Marca», la parte que se parece al dominio. Sin tildes ni conectores, para que
 * «Banco de Chile» se parezca a bancochile.cl y «Telefonía» no pierda la «i». */
const plano = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\b(de|del|la|las|el|los|y)\b/g, "").replace(/[^a-z0-9]/g, "");
const partesDe = (texto: string) => entidades(texto).split(/\s[|·•\-–—:]\s|:\s/).map((p) => p.trim()).filter(Boolean);
function parecidaAlDominio(partes: string[], dominio: string): string | undefined {
  const dom = plano(desdeDominio(dominio));
  return partes.find((p) => plano(p).length >= 2 && (plano(p).includes(dom) || dom.includes(plano(p))));
}

// Títulos de muros anti-bots o errores: no son la marca.
const BASURA = /(error|request could not|access denied|restrict access|forbidden|attention required|just a moment|radware|captcha|cloudflare|not found|404|403|página no encontrada|bienvenido|welcome|home|inicio)$/i;
const esBasura = (t: string) => BASURA.test(t.trim()) || /error|request could not|access denied|radware|just a moment|captcha|ingreso concedido|acceso denegado/i.test(t);
// og:site_name que es una sección del sitio y no la marca (entel.cl y bancochile.cl dicen «Personas»).
const SECCION = /^(personas|empresas|particulares|negocios|pymes|hogar|home|inicio|portada)$/i;
// «falabella.com», «Unimarc.cl», «Nike.com»: el nombre del sitio con su dominio de primer nivel; la marca va sin él.
const sinTld = (s: string) => {
  const t = s.trim();
  return /^[\p{L}\d][\p{L}\d-]*(\.[a-z]{2,})+$/iu.test(t) ? t.replace(/(\.[a-z]{2,})+$/i, "") : t;
};

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
  const titulo = html.match(/<title[^>]*>([^<]{2,160})<\/title>/i)?.[1];
  if (candidato && !esBasura(candidato) && !SECCION.test(candidato.trim())) {
    const parecida = parecidaAlDominio(partesDe(candidato), n.dominio);
    /* og:site_name a veces es una sección y no la marca (entel.cl dice «Personas»): vale si se parece al dominio,
     * si el título lo repite o si el título no nombra el dominio. Si no, manda el título. */
    const enTitulo = titulo ? plano(entidades(titulo)).includes(plano(entidades(candidato))) : false;
    if (parecida || enTitulo || !titulo || !parecidaAlDominio(partesDe(titulo), n.dominio)) {
      const m0 = (parecida ?? entidades(candidato)).trim();
      const m = sinTld(m0);
      // «falabella.com» → «falabella»: igual al dominio pelado, la marca se escribe desde el dominio.
      if (m !== m0 && m.toLowerCase() === desdeDominio(n.dominio).toLowerCase()) return { marca: await desdeElDominio(n.dominio), dominio: n.dominio };
      return { marca: m.slice(0, 60), dominio: n.dominio };
    }
  }
  if (titulo) {
    const partes = partesDe(titulo);
    // La parte que más se parece al dominio; si ninguna, la más corta.
    const elegida = sinTld(parecidaAlDominio(partes, n.dominio) ?? partes.sort((a, b) => a.length - b.length)[0] ?? "");
    // Igual al dominio («Dospinos») no aporta y se prueba con espacios; con mayúsculas propias («EquySer») sí.
    const mixta = /\p{Ll}/u.test(elegida ?? "") && /\p{Lu}/u.test((elegida ?? "").slice(1));
    if (elegida && elegida.length <= 60 && !esBasura(elegida) && (mixta || elegida.toLowerCase() !== desdeDominio(n.dominio).toLowerCase())) return { marca: elegida, dominio: n.dominio };
  }
  return { marca: await desdeElDominio(n.dominio), dominio: n.dominio };
}

/* La marca escrita desde el dominio: «dospinos» → «Dos Pinos» si el autocompletado de Google la separa. */
async function desdeElDominio(dominio: string): Promise<string> {
  const base = desdeDominio(dominio);
  const conEspacios = base.includes(" ") ? null : await espaciar(base.toLowerCase());
  return conEspacios ?? base;
}
