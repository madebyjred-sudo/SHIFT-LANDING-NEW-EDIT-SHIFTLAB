import Link from "next/link";

/* Accesos a las escuchas gratis dentro de /shift-lab, justo bajo el hero:
 * las tres landings y el atajo a la escucha que vive más abajo en la página. */

const TESTS = [
  { href: "/shift-lab/escucha-gratis", t: "Escucha integral", d: "Lo que dice la gente y lo que repite la IA, cruzado.", tiempo: "2 min", icono: "/escucha/sentinel/iconos/redes.svg", acento: "#5BE9FF" },
  { href: "/shift-lab/escucha-ia", t: "Qué dice la IA de tu marca", d: "Siete IA responden por ti. Eco te dice cuántas te conocen.", tiempo: "1 min", icono: "/escucha/eco/iconos/verbatim.webp", acento: "#3450FF" },
  { href: "/shift-lab/escucha-digital", t: "Qué se dice en redes y medios", d: "Sentinel lee 30 días de conversación pública de tu país.", tiempo: "2 min", icono: "/escucha/sentinel/iconos/escucha.svg", acento: "#9244D8" },
];

export default function AccesoEscuchas() {
  return (
    <section aria-labelledby="pruebalo" className="relative border-b border-white/10 bg-[#0A0E27] py-14 md:py-16">
      <div className="mx-auto w-full max-w-[1180px] px-6 md:px-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#F540FF] [font-family:var(--font-figtree)]">Pruébalo gratis</p>
            <h2 id="pruebalo" className="mt-3 scroll-mt-40 max-w-2xl text-[28px] font-bold leading-[1.1] text-white md:text-[36px] [font-family:var(--font-zilla-slab)]">
              Escucha tu marca hoy, sin cuenta y sin tarjeta.
            </h2>
          </div>
          <a href="#escucha-gratis" className="text-[14px] font-semibold text-white/70 transition-colors hover:text-[#F540FF] [font-family:var(--font-figtree)]">
            O pruébala aquí mismo ↓
          </a>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {TESTS.map((x) => (
            <li key={x.href}>
              <Link
                href={x.href}
                className="group relative flex h-full items-start gap-4 overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.03] p-5 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06]"
              >
                <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60" style={{ background: x.acento }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={x.icono} alt="" aria-hidden className="h-14 w-14 shrink-0 object-contain" loading="lazy" />
                <span className="relative min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="text-[16px] font-bold text-white [font-family:var(--font-figtree)]">{x.t}</span>
                  </span>
                  <span className="mt-1.5 block text-[14px] leading-relaxed text-white/65">{x.d}</span>
                  <span className="mt-3 flex items-center gap-3 text-[12px] text-white/50">
                    <span className="rounded-full border border-white/15 px-2 py-0.5">Gratis · {x.tiempo}</span>
                    <span className="font-semibold text-white/80 transition-transform duration-300 group-hover:translate-x-0.5" style={{ color: x.acento === "#3450FF" ? "#7d8cff" : x.acento === "#9244D8" ? "#B98AEB" : x.acento }}>
                      Empezar →
                    </span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
