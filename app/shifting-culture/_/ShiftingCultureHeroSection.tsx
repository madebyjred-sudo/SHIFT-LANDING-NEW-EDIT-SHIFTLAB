import Section from "@/components/common/Section";
import AutoplayLoopVideo from "@/components/common/AutoplayLoopVideo";

/**
 * Hero del módulo Shifting Culture®.
 *
 * Background: video de la Tierra rotando con city lights, comprimido y
 * tratado MUY sutil (opacity 0.22 + mix-blend-screen) detrás del título.
 * El azul `#1534DC` queda como base; el globo aporta movimiento
 * tipográfico sin restarle peso al titular.
 */
export default function ShiftingCultureHeroSection() {
  return (
    <Section
      className={[
        // Reset del max-width del Section base para que el hero ocupe el
        // ancho completo, conserve overflow-hidden, y se sienta full-bleed.
        "max-w-none! mx-0 flex w-full flex-col items-center justify-center",
        "overflow-hidden!",
        "py-24 md:py-32 min-h-[min(60vh,52rem)] md:min-h-[min(92vh,56rem)]",
        "bg-[#1534DC]",
      ].join(" ")}
    >
      {/* Background video — sutil, decorativo. mix-blend-screen mezcla
          las luces de las ciudades con el azul base para sentirse de la
          misma paleta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ mixBlendMode: "screen", opacity: 0.22 }}
      >
        <AutoplayLoopVideo
          src="/assets/videos/shifting-culture/earth-rotation.mp4"
          priority
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* Vignette muy ligera para asegurar contraste del título sobre el
          video, sin tapar el movimiento de fondo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(21,52,220,0.45) 80%)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-4 text-center">
        <h1 className="text-5xl font-glitz text-[#FFFFFF] md:text-6xl lg:text-[128px]">
          Shifting
          <br className="sm:hidden" />
          <span className="inline-block pl-1 bg-black sm:hidden"></span>
          {" "}Culture
          <span className="inline-block align-top text-sm leading-none md:text-md lg:text-[48px]">
            ®
          </span>
        </h1>
        <p className="mt-2 mx-auto max-w-[280px] sm:max-w-3xl text-center text-lg md:text-[35px] font-semibold not-italic leading-[100%] tracking-[0] text-[#F540FF] [leading-trim:none] [font-family:var(--font-figtree)]">
          Comunicación Estratégica Basada en Cultura
        </p>
      </div>
    </Section>
  );
}
