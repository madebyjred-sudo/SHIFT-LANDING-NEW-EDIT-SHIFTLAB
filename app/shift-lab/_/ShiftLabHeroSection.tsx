/**
 * Shift LAB hero — banner cinematográfico full-width.
 *
 * Video full-width (75vh) con autoplay loop muteado. Overlays encima:
 * logo Shift Lab a la izquierda, headline + sub a la derecha. Dark tint
 * sutil para legibilidad del texto sobre el video.
 *
 * Decisión: hubo un intento previo de scroll-driven scrubbing (sync de
 * currentTime con scrollYProgress + shrink de altura). No convenció —
 * el runway era muy corto para reproducir el video y la sensación se
 * perdía en mobile/lento. Volvimos al banner simple con autoplay loop,
 * que es lo que el cliente aprobó visualmente.
 *
 * Sin "use client": este componente no usa hooks ni event handlers, así
 * que puede renderizarse como Server Component (bundle más liviano).
 */

const VIDEO_SRC = "/assets/videos/shift-lab/hero-scroll.mp4";

export default function ShiftLabHeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden bg-black"
      style={{ height: "75vh" }}
    >
      {/* Video full-bleed autoplay loop muteado */}
      <video
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />

      {/* Dark tint para legibilidad de overlays */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-black/15"
      />

      {/* ── OVERLAYS sobre el video ───────────────────────────────
          Asimetría intencional: left padding chico (logo bien pegado al
          borde izquierdo) + right padding generoso (headline respira
          del borde derecho). En mobile cae a 1 columna así que el
          padding también aplica a la headline — pl-4 deja el bloque
          legible sin pegarlo al borde. */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center pl-4 pr-6 md:pl-6 md:pr-12 lg:pl-10 lg:pr-20">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-8 lg:gap-16">
          {/* IZQUIERDA — Logo Shift Lab grande.
              En mobile (1-col) queda pegado al borde izquierdo del
              viewport. En desktop/tablet (md+, 2-col) se centra en
              su columna → punto medio entre "pegado a la izquierda"
              y "pegado al centro del viewport". */}
          <div className="flex justify-start md:justify-center">
            <div
              role="img"
              aria-label="Shift Lab"
              className="block aspect-[476/124] w-[200px] md:w-[320px] lg:w-[400px] md:-translate-x-4 lg:-translate-x-8"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #FFFFFF 0%, #FFFFFF 73%, #F540FF 73%, #F540FF 100%)",
                maskImage: "url(/assets/images/shift-lab/shift-lab.svg)",
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "left center",
                WebkitMaskImage:
                  "url(/assets/images/shift-lab/shift-lab.svg)",
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "left center",
              }}
            />
          </div>

          {/* DERECHA — Headline + sub-text.
              Nudge vertical sutil en md+ para que el bloque caiga un
              tris abajo del eje del logo — la headline queda
              ligeramente desplazada respecto al wordmark, lo que
              ayuda al ritmo visual diagonal del hero. */}
          <div className="md:justify-self-end md:text-left md:translate-y-3 lg:translate-y-6">
            <h2 className="max-w-xl text-[22px] md:text-[30px] lg:text-[38px] font-semibold leading-[1.08] tracking-tight text-white [font-family:var(--font-figtree)]">
              Innovación e Inteligencia Artificial{" "}
              <span className="text-[#F540FF]">
                aplicada a comunicación.
              </span>
            </h2>
            <p
              className="mt-5 max-w-md text-[12px] md:text-[13px] leading-[1.7] text-white/80"
              style={{
                fontFamily:
                  "var(--font-fira-mono), ui-monospace, monospace",
              }}
            >
              Diseñamos sistemas donde la inteligencia humana y la
              artificial trabajan en flujo continuo. La tecnología
              trabaja al servicio de la estrategia y del criterio del
              equipo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
