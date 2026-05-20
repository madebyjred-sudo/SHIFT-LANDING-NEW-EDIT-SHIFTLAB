"use client";

import { useEffect, useRef } from "react";
import PageFullWidthVideoBanner from "@/components/common/PageFullWidthVideoBanner";
import {
  IO_THRESHOLDS,
  useServiciosScrollAudio,
} from "./ServiciosScrollAudioProvider";

type ServiceCardVideoWithScrollAudioProps = {
  cardIndex: number;
  src: string;
  poster?: string;
  ariaLabel: string;
  className?: string;
};

/**
 * Full-bleed service video: only the card most visible in the viewport gets
 * `audioEnabled` on `PageFullWidthVideoBanner`; others stay muted.
 */
export default function ServiceCardVideoWithScrollAudio({
  cardIndex,
  src,
  poster,
  ariaLabel,
  className,
}: ServiceCardVideoWithScrollAudioProps) {
  const { register, activeIndex } = useServiciosScrollAudio();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        register(cardIndex, entry?.intersectionRatio ?? 0);
      },
      { threshold: IO_THRESHOLDS },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      register(cardIndex, 0);
    };
  }, [cardIndex, register]);

  const audioEnabled = activeIndex === cardIndex;

  return (
    <div ref={rootRef} className={className}>
      <PageFullWidthVideoBanner
        src={src}
        poster={poster}
        sectionClassName="h-full"
        ariaLabel={ariaLabel}
        audioEnabled={audioEnabled}
      />
    </div>
  );
}
