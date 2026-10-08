import Link from "next/link";

/**
 * PurposeCTASection — cierre de la página Propósito. Convierte el discurso
 * de propósito en una invitación a la acción: banda premium con CTA a
 * /contact. "El propósito sin acción es decoración."
 */
export default function PurposeCTASection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 20% 0%, rgba(21,52,220,0.45) 0%, transparent 58%), radial-gradient(ellipse at 90% 100%, rgba(245,64,255,0.22) 0%, transparent 55%), #00235E",
      }}
    >
      <div className="mx-auto w-full max-w-[1000px] px-6 py-24 text-center sm:px-10 md:py-32">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 [font-family:var(--font-figtree)]">
          Propósito en acción
        </span>

        <h2 className="mx-auto mt-8 max-w-[18ch] text-4xl leading-[1.05] text-white sm:text-5xl lg:text-[56px] [font-family:Glitz] font-normal [font-style:normal]">
          Démosle a tu marca un propósito que se sienta.
        </h2>

        <p className="mx-auto mt-6 max-w-[560px] text-[18px] leading-relaxed text-white/70 [font-family:var(--font-fira-sans)]">
          El propósito sin acción es decoración. Si querés que el tuyo mueva
          cultura, reputación y negocio, empecemos la conversación hoy.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-[#1534DC] transition-transform duration-200 hover:scale-[1.03] [font-family:var(--font-figtree)]"
          >
            Hablemos
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <Link
            href="/shifting-culture"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 text-[15px] font-semibold text-white/90 transition-colors duration-200 hover:bg-white/10 [font-family:var(--font-figtree)]"
          >
            Conocer Shifting Culture®
          </Link>
        </div>
      </div>
    </section>
  );
}
