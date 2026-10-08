import Link from "next/link";
import type { UbicacionEnSerie } from "@/lib/newsroom/series";

/**
 * Navegador de serie dentro de un artículo.
 *
 * Le dice a quien llegó por buscador que está leyendo la parte N de un hilo y
 * le da las dos salidas que importan: la anterior y la siguiente. Sin esto, una
 * parte suelta se lee como un artículo incompleto y no como un capítulo.
 */
export default function SeriesNav({ u }: { u: UbicacionEnSerie }) {
  const { serie, parte, total, anterior, siguiente } = u;

  return (
    <aside
      className="my-12 rounded-[20px] border p-6 md:p-7"
      style={{ borderColor: `${serie.accent}33`, background: `${serie.accent}0A` }}
      aria-label={`Serie: ${serie.name}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span
          className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] [font-family:var(--font-figtree)]"
          style={{ background: `${serie.accent}1A`, color: serie.accent }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: serie.accent }} />
          Serie
        </span>
        <span className="text-[13px] font-semibold text-[#111A31]/50 tabular-nums [font-family:var(--font-figtree)]">
          Parte {parte} de {total}
        </span>
      </div>

      <Link
        href={`/newsroom/series/${serie.slug}`}
        className="mt-3 block text-[20px] font-bold leading-snug text-[#111A31] transition-colors hover:text-[color:var(--a)] md:text-[23px] [font-family:var(--font-figtree)]"
        style={{ ["--a" as string]: serie.accent } as React.CSSProperties}
      >
        {serie.name}
      </Link>
      <p className="mt-1.5 text-[14px] text-[#111A31]/55">{serie.tagline}</p>

      {/* Barra de avance: cuánto falta, de un vistazo. */}
      <div className="mt-5 flex gap-1.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors"
            style={{ background: i < parte ? serie.accent : `${serie.accent}26` }}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13.5px] [font-family:var(--font-figtree)]">
        {anterior ? (
          <Link
            href={`/newsroom/${anterior}`}
            className="font-semibold text-[#111A31]/70 underline-offset-4 hover:text-[#111A31] hover:underline"
          >
            ← Parte {parte - 1}
          </Link>
        ) : (
          <span className="text-[#111A31]/25">← Es la primera</span>
        )}

        <Link
          href={`/newsroom/series/${serie.slug}`}
          className="text-[#111A31]/45 underline-offset-4 hover:text-[#111A31] hover:underline"
        >
          Ver el hilo completo
        </Link>

        {siguiente ? (
          <Link
            href={`/newsroom/${siguiente}`}
            className="ml-auto font-semibold underline-offset-4 hover:underline"
            style={{ color: serie.accent }}
          >
            Parte {parte + 1} →
          </Link>
        ) : (
          <span className="ml-auto text-[#111A31]/25">Es la última</span>
        )}
      </div>
    </aside>
  );
}
