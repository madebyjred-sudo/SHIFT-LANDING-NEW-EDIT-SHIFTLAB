"use client";

import AutoplayLoopVideo from "@/components/common/AutoplayLoopVideo";

/**
 * "Nuestro Enfoque" banner — versión video puro.
 *
 * Originalmente esta sección tenía un overlay con título "Nuestro
 * enfoque" + descripción centrada sobre un video de fondo. El cliente
 * pidió quitar el texto y reemplazar el video por el nuevo asset
 * SHIFTWEB.mp4 — ahora la sección queda como un banner cinematográfico
 * full-bleed sin overlays.
 *
 * Sin "use client" intencionalmente NO — el componente AutoplayLoopVideo
 * usa hooks y necesita el client boundary, así que lo mantenemos.
 */
export default function AboutUsMoveBanner() {
  return (
    <section className="relative isolate overflow-hidden bg-white pt-4 md:pt-8 lg:pt-16">
      <div className="relative mx-auto h-[360px] w-full sm:h-[520px] md:h-[700px] lg:h-[879px]">
        <AutoplayLoopVideo
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src="/assets/videos/about/shiftweb.mp4"
          mimeType="video/mp4"
        />
      </div>
    </section>
  );
}
