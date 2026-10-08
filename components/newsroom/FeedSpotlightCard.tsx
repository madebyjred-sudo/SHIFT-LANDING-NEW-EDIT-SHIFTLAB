"use client";

import Link from "next/link";
import AmericasGlobe from "@/components/ui/AmericasGlobe";

/**
 * Tarjeta de colección dentro del bento del Newsroom.
 *
 * No es un artículo: es la puerta a un hub. Por eso se ve distinta —fondo
 * oscuro, globo vivo— y no compite con las tarjetas de pieza, que son claras
 * y llevan foto.
 *
 * El globo es decorativo acá (sin `onSeleccionar`): la interacción de verdad
 * vive en la colección. Acá solo tiene que dar ganas de entrar.
 */

/** Coordenadas de los doce mercados. Qué mercado está "encendido" NO se decide
 *  acá: llega en `activos`, calculado de los artículos publicados igual que en
 *  la página de la colección. Hardcodearlo garantizaría que se desincronice. */
const COORDS = [
  { pais: "Costa Rica", lat: 9.93, lng: -84.09 },
  { pais: "El Salvador", lat: 13.69, lng: -89.19 },
  { pais: "Guatemala", lat: 14.63, lng: -90.51 },
  { pais: "Honduras", lat: 14.07, lng: -87.19 },
  { pais: "Nicaragua", lat: 12.11, lng: -86.24 },
  { pais: "Panamá", lat: 8.98, lng: -79.52 },
  { pais: "México", lat: 19.36, lng: -99.27 },
  { pais: "Colombia", lat: 4.71, lng: -74.07 },
  { pais: "Ecuador", lat: -0.18, lng: -78.47 },
  { pais: "Rep. Dominicana", lat: 18.49, lng: -69.93 },
  { pais: "Venezuela", lat: 10.48, lng: -66.9 },
  { pais: "Miami", lat: 25.72, lng: -80.27 },
];

interface Props {
  /** Piezas publicadas en la colección. */
  total: number;
  /** Mercados con al menos una pieza publicada. */
  activos: string[];
  className?: string;
}

export default function FeedSpotlightCard({ total, activos, className = "" }: Props) {
  const mercados = COORDS.map((m) => ({ ...m, activo: activos.includes(m.pais) }));
  return (
    <Link
      href="/newsroom/feeds/voces-de-la-region"
      className={`group relative flex flex-col justify-between overflow-hidden rounded-[24px] bg-[#0B1020] p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl md:p-9 ${className}`}
    >
      {/* Globo: excede la tarjeta y la tarjeta lo recorta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[190px] -right-[170px] z-0 opacity-70"
      >
        <AmericasGlobe
          mercados={mercados}
          vista={[79, -14]}
          spin={0.05}
          size={520}
          className="sl-globe-fade"
        />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-[#0B1020] via-[#0B1020]/80 to-transparent"
      />

      <div className="relative z-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm [font-family:var(--font-figtree)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
          </span>
          Colección
        </span>

        <h3 className="mt-5 text-[28px] font-bold leading-[1.05] text-white md:text-[34px] [font-family:var(--font-figtree)]">
          Voces de la región
        </h3>
        <p className="mt-3 max-w-[300px] text-[14px] leading-relaxed text-white/65">
          Lo que publican quienes dirigen cada mercado de Shift, con la fuente
          original citada.
        </p>
      </div>

      <div className="relative z-10 mt-8 flex items-center gap-5">
        <span className="text-[13px] font-semibold text-white/80 [font-family:var(--font-figtree)]">
          {total} {total === 1 ? "pieza" : "piezas"}
        </span>
        <span className="h-3 w-px bg-white/20" />
        <span className="text-[13px] text-white/50 [font-family:var(--font-figtree)]">
          {activos.length} de {COORDS.length} mercados
        </span>
        <span className="ml-auto text-[13px] font-bold text-white transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </div>
    </Link>
  );
}
