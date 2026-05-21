"use client";

import ScrollExpandVideoBanner from "@/components/common/ScrollExpandVideoBanner";
import ScrollLayeredText from "@/components/common/ScrollLayeredText";

/**
 * Awards manifesto — the 6-verb chain reads as the WORKING PROCESS that
 * leads to recognition. Reframes "look at our trophies" as "awards are a
 * consequence of doing it right". Story arc: listen → think → create →
 * influence → impact → transcend (where "transcend" implies the awards
 * themselves are the natural outcome, not the goal).
 *
 * Mixed case + Glitz font intentional — the quiet tone reinforces "we
 * don't shout about awards, we earn them".
 */
const awardsManifestoLines = [
  { top: " ",          bottom: "Escuchar" },
  { top: "Escuchar",   bottom: "Pensar" },
  { top: "Pensar",     bottom: "Crear" },
  { top: "Crear",      bottom: "Influir" },
  { top: "Influir",    bottom: "Impactar" },
  { top: "Impactar",   bottom: "Trascender" },
  { top: "Trascender", bottom: " " },
];

/**
 * Client-side wrapper: needed because we pass a render-prop (`overlay`)
 * to ScrollExpandVideoBanner. Server → Client function props are not
 * serializable across the RSC boundary, so this composition has to live
 * inside a "use client" component.
 */
export default function AwardsVideoManifesto() {
  return (
    <ScrollExpandVideoBanner
      src="/assets/videos/awards/awards-banner.mp4"
      sectionClassName="bg-white pt-16 md:pt-12"
      ariaLabel="Banner visual de la sección Premios de Shift Latam"
      audioEnabled
      overlay={(progress) => (
        <ScrollLayeredText
          lines={awardsManifestoLines}
          progress={progress}
          fontSize="clamp(48px, 9vw, 140px)"
          fontSizeMd="clamp(28px, 6vw, 42px)"
          lineHeight={86}
          lineHeightMd={36}
          staircaseOffset={48}
          staircaseOffsetMd={20}
          className="text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.55)]"
        />
      )}
    />
  );
}
