"use client";

import Link from "next/link";

/**
 * Tira de colecciones, debajo de la franja destacada.
 *
 * Va como una línea fina y no como tarjetas: tres paneles pastel encima del
 * panel oscuro de la colección destacada hacían efecto de doble bandeja y
 * competían con ella. Acá la jerarquía queda clara — la colección destacada
 * manda, esto es el índice para saltar a las otras.
 */

export interface ColeccionResumen {
  slug: string;
  name: string;
  tagline: string;
  accent: string;
  total: number;
}

export default function CollectionsRail({ items }: { items: ColeccionResumen[] }) {
  if (!items.length) return null;

  return (
    <nav
      aria-label="Colecciones del Newsroom"
      className="mb-20 flex flex-wrap items-center gap-x-1 gap-y-3 border-y border-[#111A31]/8 py-4 md:mb-24"
    >
      <span className="mr-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#111A31]/35 [font-family:var(--font-figtree)]">
        Colecciones
      </span>

      {items.map((c, i) => (
        <span key={c.slug} className="flex items-center">
          {i > 0 && (
            <span aria-hidden className="mx-1 h-3 w-px bg-[#111A31]/10 md:mx-3" />
          )}
          <Link
            href={`/newsroom/feeds/${c.slug}`}
            title={c.tagline}
            className="group flex items-center gap-2 rounded-full px-2.5 py-1.5 transition-colors duration-200 hover:bg-[#111A31]/[0.04]"
          >
            <span
              aria-hidden
              className="h-[7px] w-[7px] flex-shrink-0 rounded-full"
              style={{ background: c.accent }}
            />
            <span className="text-[14px] font-semibold text-[#111A31]/75 transition-colors duration-200 group-hover:text-[#111A31] [font-family:var(--font-figtree)]">
              {c.name}
            </span>
            <span className="text-[12px] tabular-nums text-[#111A31]/35 [font-family:var(--font-figtree)]">
              {c.total}
            </span>
          </Link>
        </span>
      ))}

      <Link
        href="/newsroom/feeds"
        className="ml-auto text-[13px] text-[#111A31]/45 underline-offset-4 transition-colors hover:text-[#111A31] hover:underline [font-family:var(--font-figtree)]"
      >
        Ver todas →
      </Link>
    </nav>
  );
}
