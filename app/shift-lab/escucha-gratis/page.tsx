import type { Metadata } from "next";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";
import { LabDotGrid } from "@/components/ui/lab-primitives";
import EscuchaGratis from "@/components/escucha/EscuchaGratis";
import TarjetaSentinel from "@/components/escucha/TarjetaSentinel";
import FondoGlobo from "@/components/escucha/FondoGlobo";
import ShiftLabEcoCard from "@/app/shift-lab/_/ShiftLabEcoCard";
import { ECO_REAL, FECHA_DATOS, SENTINEL_REAL } from "@/lib/escucha/datos-reales";

/* Landing integral (para pauta): Eco + Sentinel en una sola escucha gratis.
 * El reporte se centra en lo que solo aparece con las dos herramientas activas
 * a la vez. Las dos tarjetas de producto llevan a la landing de cada una:
 * /shift-lab/escucha-ia (Eco) y /shift-lab/escucha-digital (Sentinel). */

const TITULO = "Escucha gratis lo que dicen de tu marca la IA, las redes y los medios";
const DESCRIPCION =
  "Herramienta gratis de Shift LAB: pregunta a siete inteligencias artificiales por tu marca y escucha 30 días de redes sociales y medios de tu país, con una lectura que cruza las dos. Sin cuenta y en dos minutos.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/shift-lab/escucha-gratis",
  title: "Escucha gratis de IA, redes y medios · Shift LAB",
  description: DESCRIPCION,
  keywords: ["escucha social gratis", "social listening gratis", "visibilidad en IA", "qué dice ChatGPT de mi marca", "monitoreo de medios", "shift lab"],
});

const nf = new Intl.NumberFormat("es");
const p1 = (a: number, b: number) => `${((a / b) * 100).toFixed(1).replace(".", ",")}%`;

const POR_QUE = [
  {
    cifra: p1(ECO_REAL.conBusqueda.nombrada, ECO_REAL.conBusqueda.total),
    contra: p1(ECO_REAL.deMemoria.nombrada, ECO_REAL.deMemoria.total),
    titulo: "La IA que busca lee tu conversación",
    texto:
      "Cuando la IA busca en internet antes de responder, nombra a la marca más seguido que cuando responde de memoria. Lo que se publica hoy sobre ti entra en la respuesta de mañana: escuchar las dos cosas por separado es mirar la mitad.",
    fuente: `Respuestas con búsqueda contra respuestas de memoria · Eco, ${nf.format(ECO_REAL.respuestas)} respuestas, ${FECHA_DATOS}`,
  },
  {
    cifra: p1(ECO_REAL.noNombradaConCompetidor, ECO_REAL.noNombrada),
    titulo: "Cuando la IA no te nombra, nombra a otro",
    texto:
      "En casi un tercio de las respuestas donde la marca no aparece, la IA recomienda a un competidor. Con la escucha digital ves si ese competidor también te está ganando la conversación o si la IA se quedó con una foto vieja.",
    fuente: `Respuestas sin la marca que nombran a un competidor · Eco, ${FECHA_DATOS}`,
  },
  {
    cifra: nf.format(SENTINEL_REAL.alertasEnviadas),
    titulo: "La IA no te avisa. Sentinel sí",
    texto:
      "Un pico en redes, un titular o una mención en radio llegan como alerta el mismo día. Con las dos escuchas activas ves qué se está diciendo de ti antes de que pase a ser lo que la IA lee, y tienes tiempo de responder.",
    fuente: `Alertas enviadas por Sentinel desde ${SENTINEL_REAL.desde}`,
  },
];

const PREGUNTAS = [
  { p: "¿De verdad es gratis?", r: "Sí. Una escucha por marca, sin cuenta y sin tarjeta. Si quieres seguir la conversación y las respuestas de la IA todas las semanas, la demo completa te muestra cómo se ve el monitoreo." },
  { p: "¿De dónde salen los datos?", r: "La parte de IA sale de Eco, nuestra plataforma de medición en inteligencia artificial. La de redes y medios sale de Sentinel, la misma escucha que usamos con marcas de la región." },
  { p: "¿Por qué la muestra no es igual al monitoreo completo?", r: "La escucha gratis hace una sola pregunta a cada IA y lee una muestra de la conversación. El monitoreo completo mide cientos de preguntas de tu categoría, compara con tus competidores, verifica lo que la IA dice de ti contra fuentes reales y suma radio, televisión y tus propios canales." },
  { p: "¿Por qué TikTok y LinkedIn dicen «monitoreo completo»?", r: "Porque esas redes no entran en la escucha rápida. En el monitoreo completo las sumamos con otra fuente." },
  { p: "¿Qué hacen con mi correo?", r: "Solo lo usamos si pides la demo completa: le llega al equipo de Shift en tu país, que te escribe una vez. No entra a ninguna lista de correo." },
];

export default function EscuchaGratisPage() {
  const schema = createWebPageSchema({ pathname: "/shift-lab/escucha-gratis", title: TITULO, description: DESCRIPCION });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="overflow-x-clip bg-[#0A0E27] text-white">
        <section className="relative isolate overflow-hidden pt-36 pb-20 md:pt-44">
          <LabDotGrid opacity={0.2} />
          <FondoGlobo />
          <div className="relative z-10 mx-auto w-full max-w-[1180px] px-6 md:px-10">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#5BE9FF] [font-family:var(--font-figtree)]">Shift LAB · Eco + Sentinel · gratis</p>
            <h1 className="mt-4 max-w-4xl text-[38px] font-bold leading-[1.04] md:text-[64px] [font-family:var(--font-zilla-slab)]">
              Lo que dice la gente y lo que <span className="text-[#F540FF]">repite la IA</span>, en una sola escucha.
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75">
              Siete inteligencias artificiales y 30 días de redes y medios de tu país, cruzados en una lectura que ninguna de las dos te da sola. Sin cuenta, en unos dos minutos.
            </p>
            <div className="mt-10">
              <EscuchaGratis variante="pagina" />
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-24">
          <div className="mx-auto w-full max-w-[1180px] px-6 md:px-10">
            <h2 className="max-w-3xl text-[32px] font-bold leading-tight md:text-[48px] [font-family:var(--font-zilla-slab)]">Por qué escuchar las dos a la vez</h2>
            <div className="mt-14 space-y-16">
              {POR_QUE.map((x, i) => (
                <div key={x.titulo} className={`grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-end ${i % 2 ? "md:[direction:rtl]" : ""}`}>
                  <div className="[direction:ltr]">
                    <p className="text-[84px] font-bold leading-none tracking-tight text-white md:text-[120px] [font-family:var(--font-zilla-slab)]">{x.cifra}</p>
                    {x.contra && <p className="mt-2 text-[15px] text-white/55">contra {x.contra} de memoria</p>}
                  </div>
                  <div className="border-t border-white/15 pt-5 [direction:ltr]">
                    <h3 className="text-[24px] font-bold [font-family:var(--font-figtree)]">{x.titulo}</h3>
                    <p className="mt-3 text-[16px] leading-relaxed text-white/70">{x.texto}</p>
                    <p className="mt-4 text-[12px] text-white/40">{x.fuente}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-24">
          <div className="mx-auto w-full max-w-[1380px] px-4 md:px-6 lg:px-8">
            <div className="mx-auto max-w-[1180px] px-2 md:px-4">
              <h2 className="max-w-3xl text-[32px] font-bold leading-tight md:text-[48px] [font-family:var(--font-zilla-slab)]">Cada escucha, a fondo</h2>
              <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/70">Si te interesa una sola de las dos, cada herramienta tiene su escucha gratis con un reporte completo.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 items-stretch gap-6 lg:gap-8 xl:grid-cols-2">
              <ShiftLabEcoCard href="/shift-lab/escucha-ia" cta="Pruébalo gratis" />
              <TarjetaSentinel />
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-24">
          <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-6 md:px-10 lg:grid-cols-[1fr_1.3fr]">
            <h2 className="text-[32px] font-bold leading-tight md:text-[44px] [font-family:var(--font-zilla-slab)]">Preguntas frecuentes</h2>
            <div className="space-y-5">
              {PREGUNTAS.map((q) => (
                <details key={q.p} className="group border-b border-white/10 pb-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[18px] font-semibold [font-family:var(--font-figtree)]">
                    {q.p}
                    <span className="text-[#5BE9FF] transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-[15px] leading-relaxed text-white/70">{q.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
