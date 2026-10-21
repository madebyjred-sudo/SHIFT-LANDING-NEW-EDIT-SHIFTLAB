/* El gancho del cierre: el hallazgo más fuerte del reporte, en una frase.
 * Sale solo de lo que devolvieron las IA y la escucha (nada inventado).
 * Lo usan el cierre de la página del reporte y los correos (al usuario y a ventas). */
import type { ResIA, Resumen } from "./cliente";
import { alternativasNombradas, picoDeConversacion } from "./lectura";

type Base = { marca: string; pais: string; ia?: { resultados?: ResIA[] } | { error: string }; digital?: { resumen?: Resumen } | { error: string } };

const dia = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + "T12:00:00Z").toLocaleDateString("es-CR", { day: "numeric", month: "long", timeZone: "UTC" }) : d);
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

export function gancho(r: Base): { titulo: string; detalle: string } {
  const res = r.ia && "resultados" in r.ia ? (r.ia.resultados ?? []).filter((x) => !x.error) : [];
  const s = r.digital && "resumen" in r.digital ? r.digital.resumen : undefined;
  const partes: string[] = [];
  let titulo = "";

  if (res.length) {
    const nombran = res.filter((x) => x.nombra).length;
    const faltan = res.length - nombran;
    const alt = alternativasNombradas(res, r.marca)[0];
    if (faltan > 0) {
      titulo = `${faltan} de ${res.length} IA no nombran a ${r.marca}${alt ? `. Responden con ${alt.nombre}` : ""}.`;
    } else {
      titulo = `Las ${res.length} IA nombran a ${r.marca}. Falta saber si lo que dicen es correcto.`;
    }
    partes.push(`IA: la nombran ${nombran} de ${res.length}${alt ? ` · alternativa más repetida: ${alt.nombre} (${alt.ias} IA)` : ""}`);
  }

  if (s) {
    const tot = s.tono.positivo + s.tono.neutral + s.tono.negativo || 1;
    const neg = Math.round((s.tono.negativo / tot) * 100);
    const pico = picoDeConversacion(s);
    if (!titulo) {
      titulo = pico
        ? `${fmt(s.total)} menciones de ${r.marca} en 30 días, con un pico el ${dia(pico.dia)}.`
        : `${fmt(s.total)} menciones de ${r.marca} en 30 días en ${r.pais}.`;
    }
    partes.push(`Conversación: ${fmt(s.total)} menciones en 30 días · ${neg}% negativo${pico ? ` · pico el ${dia(pico.dia)}` : ""}`);
  }

  if (!titulo) titulo = `El reporte de ${r.marca} en ${r.pais} está listo.`;
  return { titulo, detalle: partes.join("\n") };
}
