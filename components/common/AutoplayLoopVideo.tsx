"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type AutoplayLoopVideoProps = {
  src: string;
  mimeType?: string;
  poster?: string;
  className?: string;
  /**
   * When true, the media element is attached on first paint (first-screen heroes).
   * Playback is still gated by viewport visibility to save decode when scrolled away.
   */
  priority?: boolean;
  /** Meaningful label for assistive tech. When omitted, the video is decorative (`aria-hidden`). */
  ariaLabel?: string;
  onLoadedMetadata?: (e: React.SyntheticEvent<HTMLVideoElement>) => void;
  /**
   * When true, playback starts muted (for autoplay policy), then unmutes after a short delay.
   */
  audioEnabled?: boolean;
};

const AUDIO_UNMUTE_DELAY_MS = 500;

const IO_ROOT_MARGIN = "120px 0px";

export default function AutoplayLoopVideo({
  src,
  mimeType = "video/mp4",
  poster,
  className = "absolute inset-0 h-full w-full object-cover",
  priority = false,
  ariaLabel,
  onLoadedMetadata,
  audioEnabled = false,
}: AutoplayLoopVideoProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaReady, setMediaReady] = useState(priority);
  const [shouldPlay, setShouldPlay] = useState(priority);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (typeof IntersectionObserver === "undefined") {
      setMediaReady(true);
      setShouldPlay(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const on = !!entry?.isIntersecting;
        if (on) setMediaReady(true);
        setShouldPlay(on);
      },
      { rootMargin: IO_ROOT_MARGIN, threshold: 0.01 },
    );

    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !mediaReady) return;

    if (!shouldPlay) {
      el.pause();
      el.muted = true;
      return;
    }

    el.load();
    el.muted = true;

    const attemptPlay = () => {
      void el.play().catch(() => {});
    };
    attemptPlay();
    el.addEventListener("canplay", attemptPlay, { once: true });
    el.addEventListener("loadeddata", attemptPlay, { once: true });

    const removePlayListeners = () => {
      el.removeEventListener("canplay", attemptPlay);
      el.removeEventListener("loadeddata", attemptPlay);
    };

    if (!audioEnabled) {
      return () => {
        removePlayListeners();
        el.muted = true;
      };
    }

    const tryPlayMutedFallback = () => {
      if (videoRef.current !== el) return;
      el.muted = true;
      void el.play().catch(() => {});
    };

    const id = window.setTimeout(() => {
      if (videoRef.current !== el) return;
      el.muted = false;
      void el.play().catch(tryPlayMutedFallback);
      requestAnimationFrame(() => {
        if (videoRef.current !== el || !el.paused) return;
        tryPlayMutedFallback();
      });
    }, AUDIO_UNMUTE_DELAY_MS);

    return () => {
      window.clearTimeout(id);
      removePlayListeners();
      el.muted = true;
    };
  }, [mediaReady, shouldPlay, src, audioEnabled]);

  const handleLoadedMetadata = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      onLoadedMetadata?.(e);
    },
    [onLoadedMetadata],
  );

  const decorative = !ariaLabel;

  return (
    <div ref={rootRef} className="absolute inset-0">
      <video
        ref={videoRef}
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload={mediaReady ? "metadata" : "none"}
        poster={poster}
        onLoadedMetadata={handleLoadedMetadata}
        aria-hidden={decorative || undefined}
        aria-label={ariaLabel}
      >
        {mediaReady ? <source src={src} type={mimeType} /> : null}
      </video>
    </div>
  );
}
