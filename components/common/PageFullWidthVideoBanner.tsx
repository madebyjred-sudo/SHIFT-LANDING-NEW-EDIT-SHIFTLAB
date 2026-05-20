"use client";

import { useCallback, useState, type SyntheticEvent } from "react";
import AutoplayLoopVideo from "@/components/common/AutoplayLoopVideo";

export type PageFullWidthVideoBannerProps = {
  src: string;
  mimeType?: string;
  poster?: string;
  sectionClassName?: string;
  /**
   * When set, used as CSS aspect-ratio immediately (avoids shift before metadata).
   */
  aspectRatio?: string;
  /**
   * Meaningful label for assistive tech. When omitted, the video is decorative (`aria-hidden`).
   */
  ariaLabel?: string;
  /**
   * When true, playback starts muted (for autoplay policy), then unmutes after 1s.
   */
  audioEnabled?: boolean;
  /**
   * When true, the video source is attached on first paint (above-the-fold banners).
   * Default is lazy: source loads when the block nears the viewport.
   */
  priority?: boolean;
};

export default function PageFullWidthVideoBanner({
  src,
  mimeType = "video/mp4",
  poster,
  sectionClassName = "",
  aspectRatio: aspectRatioProp,
  ariaLabel,
  audioEnabled = false,
  priority = false,
}: PageFullWidthVideoBannerProps) {
  const [measuredRatio, setMeasuredRatio] = useState<string | null>(null);

  const onLoadedMetadata = useCallback(
    (e: SyntheticEvent<HTMLVideoElement>) => {
      if (aspectRatioProp) return;
      const { videoWidth, videoHeight } = e.currentTarget;
      if (videoWidth > 0 && videoHeight > 0) {
        setMeasuredRatio(`${videoWidth} / ${videoHeight}`);
      }
    },
    [aspectRatioProp],
  );

  const aspectRatio = aspectRatioProp ?? measuredRatio ?? "16 / 9";
  const decorative = !ariaLabel;

  return (
    <section
      className={`relative w-full overflow-hidden ${sectionClassName}`.trim()}
      style={{ aspectRatio }}
    >
      <AutoplayLoopVideo
        src={src}
        mimeType={mimeType}
        poster={poster}
        priority={priority}
        ariaLabel={decorative ? undefined : ariaLabel}
        onLoadedMetadata={onLoadedMetadata}
        audioEnabled={audioEnabled}
      />
    </section>
  );
}
