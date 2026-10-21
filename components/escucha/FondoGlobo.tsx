"use client";

import AmericasGlobe from "@/components/ui/AmericasGlobe";

/* Fondo de la escucha integral: el mismo globo de las Américas de «Voces de
 * la región» y de Shift LAB, con los mercados donde opera Shift. Decorativo:
 * gira lento, sin clics, y se desvanece antes del borde (sl-globe-fade). */
const MERCADOS = [
  { pais: "Costa Rica", lat: 9.93, lng: -84.09, activo: true },
  { pais: "El Salvador", lat: 13.69, lng: -89.19, activo: true },
  { pais: "Guatemala", lat: 14.63, lng: -90.51, activo: true },
  { pais: "Honduras", lat: 14.07, lng: -87.19, activo: true },
  { pais: "Nicaragua", lat: 12.11, lng: -86.24, activo: true },
  { pais: "Panamá", lat: 8.98, lng: -79.52, activo: true },
  { pais: "México", lat: 19.43, lng: -99.13, activo: true },
  { pais: "Colombia", lat: 4.71, lng: -74.07, activo: true },
  { pais: "Ecuador", lat: -0.18, lng: -78.47, activo: true },
  { pais: "Rep. Dominicana", lat: 18.49, lng: -69.93, activo: true },
  { pais: "Venezuela", lat: 10.48, lng: -66.9, activo: true },
  { pais: "Miami", lat: 25.72, lng: -80.27, activo: true },
];

export default function FondoGlobo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Resplandor detrás del globo, en los colores de la casa. */}
      <div
        className="absolute right-[-420px] top-[-260px] h-[1300px] w-[1300px] rounded-full opacity-70 md:right-[-300px]"
        style={{ background: "radial-gradient(circle, rgba(21,52,220,0.35) 0%, rgba(245,64,255,0.12) 38%, transparent 66%)", filter: "blur(30px)" }}
      />
      <div className="absolute right-[-640px] top-[-120px] opacity-90 md:right-[-470px] md:top-[-300px] lg:right-[-330px]">
        <AmericasGlobe mercados={MERCADOS} vista={[84, -14]} spin={0.035} size={1200} className="sl-globe-fade" />
      </div>
      {/* Velo para que el texto y el formulario le ganen al globo. */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E27] via-[#0A0E27]/55 via-45% to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0A0E27] to-transparent" />
    </div>
  );
}
