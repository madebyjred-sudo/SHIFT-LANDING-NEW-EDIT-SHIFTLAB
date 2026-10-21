/* Palabras calientes de una marca, de tres fuentes reales:
 *  1. Búsqueda: el autocompletado de Google en el país (lo que la gente
 *     escribe sobre la marca y su categoría). Orden = lo que Google sugiere
 *     primero; no hay volumen exacto y no se inventa.
 *  2. IA: los términos que más repiten las respuestas de las IA al hablar
 *     de la marca (frecuencia en las respuestas, cuántas IA lo dicen).
 *  3. Conversación: los términos que suben en redes y medios, comparando
 *     la primera y la segunda mitad de los 30 días. */

const PARADAS = new Set(
  `a al algo algunas algunos ante antes aquí así aun aunque bajo bien cada casi como con contra cual cuales cuando de del desde donde dos durante e el ella ellas ellos en entre era es esa esas ese eso esos esta estas este esto estos fue fueron ha han hasta hay la las le les lo los mas más me mi muy no nos o otra otras otro otros para pero poco por porque que quien se sea ser si sí sin sobre son su sus también tan te tiene tienen todo todos tu tus un una unas uno unos y ya the and for with of to in is on at from by this that
  puede pueden ser está están sido tener hacer según cómo qué cuál donde dónde además así mismo misma mismos también muy gran grandes mejor mejores alta alto bajo nuevo nueva nuevos nuevas forma parte tipo tipos manera ejemplo general generalmente principales principal varios varias diferentes ofrece ofrecen cuenta incluye incluyen través respecto opción opciones alternativa alternativas recomendada recomendado recomendable marca marcas empresa empresas compañía productos producto servicios servicio información país costa rica panamá méxico colombia ecuador guatemala honduras salvador nicaragua venezuela dominicana república año años día días vez veces hoy ahora sin embargo linea línea estacion estación recibio recibió oficial acuerdo segun según nacionales nacional dijo dice indicó indico afirmó afirmo semana mes meses tras cerca nota video fotos foto aqui aquí gracias mañana noche tarde`.split(/\s+/),
);

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export type Busqueda = { t: string; orden: number };
export type TerminoIA = { t: string; n: number; ias: number };
export type TerminoConv = { t: string; n: number; cambio: number };
export type Calientes = { busqueda: Busqueda[]; ia: TerminoIA[]; conversacion: TerminoConv[] };

/** Autocompletado de Google para la marca en el país (marca sola + marca con letras y preguntas frecuentes). */
export async function busquedaGoogle(marca: string, cc: string): Promise<Busqueda[]> {
  const semillas = [marca, `${marca} a`, `${marca} c`, `${marca} p`, `${marca} es`, `${marca} vs`, `qué es ${marca}`];
  const vistos = new Map<string, number>();
  await Promise.all(
    semillas.map(async (q, si) => {
      try {
        const r = await fetch(`https://suggestqueries.google.com/complete/search?client=firefox&hl=es&gl=${cc}&q=${encodeURIComponent(q)}`, {
          signal: AbortSignal.timeout(6000),
          headers: { "User-Agent": "Mozilla/5.0" },
        });
        const j = (await r.json()) as [string, string[]];
        (j[1] ?? []).forEach((s, i) => {
          const k = s.trim().toLowerCase();
          if (!k || k === marca.toLowerCase()) return;
          const orden = si * 10 + i;
          if (!vistos.has(k) || vistos.get(k)! > orden) vistos.set(k, orden);
        });
      } catch {
        /* una semilla que falla no tumba las demás */
      }
    }),
  );
  return [...vistos.entries()].sort((a, b) => a[1] - b[1]).slice(0, 16).map(([t], i) => ({ t, orden: i + 1 }));
}

function tokens(texto: string, marca: string): string[] {
  const m = new Set(norm(marca).split(/\s+/));
  return norm(texto)
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-zñ0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !PARADAS.has(w) && !m.has(w) && !/^\d+$/.test(w));
}

/** Términos (palabras y pares) que más repiten las IA; cuenta en cuántas respuestas aparece cada uno. */
export function terminosIA(respuestas: { key: string; answer: string; error?: boolean }[], marca: string): TerminoIA[] {
  const n = new Map<string, number>();
  const ias = new Map<string, Set<string>>();
  for (const r of respuestas) {
    if (r.error || !r.answer) continue;
    const tk = tokens(r.answer, marca);
    const enEsta = new Set<string>();
    tk.forEach((w, i) => {
      enEsta.add(w);
      if (i < tk.length - 1) enEsta.add(`${w} ${tk[i + 1]}`);
    });
    for (const t of tk) n.set(t, (n.get(t) ?? 0) + 1);
    for (const t of enEsta) {
      if (!ias.has(t)) ias.set(t, new Set());
      ias.get(t)!.add(r.key);
      if (t.includes(" ")) n.set(t, (n.get(t) ?? 0) + 1);
    }
  }
  return [...ias.entries()]
    .filter(([t, s]) => s.size >= 2 || (t.includes(" ") && (n.get(t) ?? 0) >= 2))
    .map(([t, s]) => ({ t, n: n.get(t) ?? 0, ias: s.size }))
    .sort((a, b) => b.ias - a.ias || b.n - a.n)
    .filter((x, _i, arr) => !(x.t.includes(" ") === false && arr.some((y) => y.t.includes(" ") && y.t.split(" ").includes(x.t) && y.ias >= x.ias)))
    .slice(0, 14);
}

/** Términos que suben en la conversación: segunda mitad de la ventana contra la primera. */
export function terminosConversacion(articulos: { fecha: string; titulo: string | null; texto?: string | null }[], marca: string): TerminoConv[] {
  const fechas = articulos.map((a) => a.fecha).filter(Boolean).sort();
  if (fechas.length < 10) return [];
  const corte = fechas[Math.floor(fechas.length / 2)];
  const antes = new Map<string, number>();
  const despues = new Map<string, number>();
  for (const a of articulos) {
    const set = new Set(tokens(`${a.titulo ?? ""} ${a.texto ?? ""}`, marca));
    const destino = a.fecha >= corte ? despues : antes;
    for (const t of set) destino.set(t, (destino.get(t) ?? 0) + 1);
  }
  return [...despues.entries()]
    .filter(([, n]) => n >= 3)
    .map(([t, n]) => ({ t, n: n + (antes.get(t) ?? 0), cambio: Math.round(((n - (antes.get(t) ?? 0)) / Math.max(1, antes.get(t) ?? 0)) * 100) }))
    .sort((a, b) => b.cambio - a.cambio || b.n - a.n)
    .slice(0, 12);
}
