import type { Metadata } from "next";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";
import { LabDotGrid } from "@/components/ui/lab-primitives";
import EscuchaGratis from "@/components/escucha/EscuchaGratis";

/* Página para pauta: escucha digital y de IA gratis, al estilo del AI Search
 * Grader de HubSpot (herramienta gratis arriba, sin cuenta; explicación y
 * preguntas abajo; la demo completa como siguiente paso). */

const TITULO = "Escucha gratis lo que dicen de tu marca la IA, las redes y los medios";
const DESCRIPCION =
  "Herramienta gratis de Shift LAB: pregunta a seis inteligencias artificiales por tu marca y escucha 30 días de redes sociales y medios de tu país. Sin cuenta y en dos minutos.";

export const metadata: Metadata = createPageMetadata({
  pathname: "/shift-lab/escucha-gratis",
  title: "Escucha gratis de IA, redes y medios · Shift LAB",
  description: DESCRIPCION,
  keywords: ["escucha social gratis", "social listening gratis", "visibilidad en IA", "qué dice ChatGPT de mi marca", "monitoreo de medios", "shift lab"],
});

const QUE_VES = [
  {
    t: "Si la IA te conoce",
    d: "Le preguntamos por tu marca a ChatGPT, Claude, Gemini, Perplexity, DeepSeek y Grok, con búsqueda web, y te mostramos qué responde cada una.",
  },
  {
    t: "Cuánto se habla de ti",
    d: "Las menciones públicas de tu marca en tu país durante los últimos 30 días: Facebook, Instagram, X, YouTube, Reddit, medios, blogs y foros.",
  },
  {
    t: "En qué tono y dónde",
    d: "Qué parte de la conversación es positiva, neutral o negativa, y qué medios y blogs te mencionan más.",
  },
];

const PREGUNTAS = [
  {
    p: "¿De verdad es gratis?",
    r: "Sí. Una escucha por marca, sin cuenta y sin tarjeta. Si quieres seguir la conversación todas las semanas, la demo completa te muestra cómo se ve el monitoreo.",
  },
  {
    p: "¿De dónde salen los datos?",
    r: "La parte de IA sale de Eco, nuestra plataforma de medición en inteligencia artificial. La de redes y medios sale de la misma escucha que usamos con clientes de Shift en la región.",
  },
  {
    p: "¿Por qué la muestra no es igual al monitoreo completo?",
    r: "Porque la escucha gratis hace una sola pregunta a cada IA y lee una muestra de la conversación. El monitoreo completo mide cientos de preguntas de tu categoría, compara con tus competidores y verifica lo que la IA dice de ti contra fuentes reales.",
  },
  {
    p: "¿Por qué TikTok y LinkedIn dicen «monitoreo completo»?",
    r: "Porque esas redes no entran en la escucha rápida. En el monitoreo completo las sumamos con otra fuente.",
  },
  {
    p: "¿Qué hacen con mi correo?",
    r: "Solo lo usamos si pides la demo completa: le llega al equipo de Shift en tu país, que te escribe una vez. No entra a ninguna lista de correo.",
  },
];

export default function EscuchaGratisPage() {
  const schema = createWebPageSchema({ pathname: "/shift-lab/escucha-gratis", title: TITULO, description: DESCRIPCION });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="overflow-x-clip bg-[#0A0E27] text-white">
        <section className="relative isolate overflow-hidden pt-36 pb-16 md:pt-44">
          <LabDotGrid opacity={0.25} />
          <div className="relative z-10 mx-auto w-full max-w-[1180px] px-6 md:px-10">
            <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#5BE9FF] [font-family:var(--font-figtree)]">Shift LAB · herramienta gratis</p>
            <h1 className="mt-4 max-w-4xl text-[38px] font-bold leading-[1.05] md:text-[60px] [font-family:var(--font-zilla-slab)]">
              Escucha gratis lo que dicen de tu marca <span className="text-[#F540FF]">la IA</span>, las redes y los medios.
            </h1>
            <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-white/75">
              Seis inteligencias artificiales y 30 días de conversación pública en tu país, en una sola escucha. Sin cuenta, en unos dos minutos.
            </p>
            <div className="mt-10">
              <EscuchaGratis variante="pagina" />
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-20">
          <div className="mx-auto w-full max-w-[1180px] px-6 md:px-10">
            <h2 className="max-w-3xl text-[32px] font-bold leading-tight md:text-[44px] [font-family:var(--font-zilla-slab)]">Qué vas a ver de tu marca</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">
              {QUE_VES.map((x) => (
                <div key={x.t} className="border-t-2 border-[#1534DC] pt-5">
                  <h3 className="text-[20px] font-bold [font-family:var(--font-figtree)]">{x.t}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/70">{x.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-white/10 py-20">
          <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-6 md:px-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <h2 className="text-[32px] font-bold leading-tight md:text-[44px] [font-family:var(--font-zilla-slab)]">Por qué escuchar a la IA</h2>
              <p className="mt-5 text-[16px] leading-relaxed text-white/70">
                Cada vez más personas le preguntan a una IA qué marca elegir y se quedan con la respuesta, sin entrar a ningún sitio. Si la IA no te conoce, o te describe mal, esa venta se pierde sin que te enteres.
              </p>
              <p className="mt-4 text-[16px] leading-relaxed text-white/70">
                La escucha social te dice qué piensa la gente. La escucha de IA te dice qué le va a responder la máquina a la próxima persona que pregunte. Las dos juntas son tu reputación de hoy.
              </p>
            </div>
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
