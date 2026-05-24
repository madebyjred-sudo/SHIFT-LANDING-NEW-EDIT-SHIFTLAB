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

      {/* ── OVERLAYS sobre el video ───────────────────────────── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-8 lg:gap-16">
          {/* IZQUIERDA — Logo Shift Lab grande */}
          <div className="flex justify-start">
            <div
              role="img"
              aria-label="Shift Lab"
              className="block aspect-[476/124] w-[260px] md:w-[420px] lg:w-[520px]"
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

          {/* DERECHA — Headline + sub-text */}
          <div className="md:justify-self-end md:text-left">
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
