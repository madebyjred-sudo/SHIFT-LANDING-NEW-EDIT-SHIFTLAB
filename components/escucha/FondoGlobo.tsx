"use client";

import AmericasGlobe from "@/components/ui/AmericasGlobe";
import { PAISES } from "@/lib/escucha/paises";

/* El globo de las Américas de «Voces de la región» como parte del formulario
 * de la escucha integral: el país se elige con un clic en el globo o en el
 * selector, y el globo vuela hasta ese país. Mientras la escucha corre, gira
 * lento. En móvil queda de fondo, sin clics. */

const COORD: Record<string, [number, number]> = {
  cr: [9.93, -84.09],
  sv: [13.69, -89.19],
  gt: [14.63, -90.51],
  hn: [14.07, -87.19],
  ni: [12.11, -86.24],
  pa: [8.98, -79.52],
  mx: [19.43, -99.13],
  co: [4.71, -74.07],
  ec: [-0.18, -78.47],
  do: [18.49, -69.93],
  ve: [10.48, -66.9],
};

const MERCADOS = PAISES.map((p) => ({ pais: p.nombre, lat: COORD[p.cc][0], lng: COORD[p.cc][1], activo: true }));

export default function FondoGlobo({ cc, onCc, corriendo = false }: { cc: string; onCc: (cc: string) => void; corriendo?: boolean }) {
  const sel = PAISES.find((p) => p.cc === cc)?.nombre ?? null;
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        aria-hidden
        className="absolute right-[-420px] top-[-260px] h-[1300px] w-[1300px] rounded-full opacity-70 md:right-[-300px]"
        style={{ background: "radial-gradient(circle, rgba(21,52,220,0.35) 0%, rgba(245,64,255,0.12) 38%, transparent 66%)", filter: "blur(30px)" }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#0A0E27] via-[#0A0E27]/40 via-40% to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#0A0E27] to-transparent" />
      <div className="pointer-events-auto absolute right-[-470px] top-[-300px] hidden md:block lg:right-[-330px]">
        <AmericasGlobe
          mercados={MERCADOS}
          seleccionado={sel}
          onSeleccionar={(pais) => {
            const p = PAISES.find((x) => x.nombre === pais);
            if (p) onCc(p.cc);
          }}
          vista={[84, -14]}
          spin={corriendo ? 0.03 : 0}
          size={1200}
          className="sl-globe-fade"
        />
      </div>
      <div aria-hidden className="absolute right-[-640px] top-[-120px] opacity-80 md:hidden">
        <AmericasGlobe mercados={MERCADOS} seleccionado={sel} vista={[84, -14]} size={1200} className="sl-globe-fade" />
      </div>
    </div>
  );
}
