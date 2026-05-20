"use client";

import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/** Minimum intersection ratio for a card to compete for audio. */
const MIN_RATIO_FOR_AUDIO = 0.2;

/**
 * Sticky cards overlap in DOM space; IntersectionObserver ignores z-index, so
 * several cards can report a high ratio at once. We pick the topmost card in
 * stack order (highest index / z-index) that still crosses the threshold.
 */

type ServiciosScrollAudioContextValue = {
  register: (cardIndex: number, intersectionRatio: number) => void;
  activeIndex: number | null;
};

const ServiciosScrollAudioContext =
  createContext<ServiciosScrollAudioContextValue | null>(null);

export function useServiciosScrollAudio() {
  const ctx = useContext(ServiciosScrollAudioContext);
  if (!ctx) {
    throw new Error(
      "useServiciosScrollAudio must be used within ServiciosScrollAudioProvider",
    );
  }
  return ctx;
}

const IO_THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

type ServiciosScrollAudioProviderProps = {
  cardCount: number;
  children: ReactNode;
};

export function ServiciosScrollAudioProvider({
  cardCount,
  children,
}: ServiciosScrollAudioProviderProps) {
  const ratiosRef = useRef<number[]>(
    Array.from({ length: cardCount }, () => 0),
  );
  const rafRef = useRef<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const flush = useCallback(() => {
    const arr = ratiosRef.current;
    let bestIdx: number | null = null;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] >= MIN_RATIO_FOR_AUDIO) {
        bestIdx = i;
        break;
      }
    }
    setActiveIndex((prev) => (prev === bestIdx ? prev : bestIdx));
  }, []);

  const register = useCallback(
    (cardIndex: number, intersectionRatio: number) => {
      const arr = ratiosRef.current;
      if (cardIndex < 0 || cardIndex >= arr.length) return;
      arr[cardIndex] = intersectionRatio;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        flush();
      });
    },
    [flush],
  );

  const value = useMemo(
    () => ({ register, activeIndex }),
    [register, activeIndex],
  );

  return (
    <ServiciosScrollAudioContext.Provider value={value}>
      {children}
    </ServiciosScrollAudioContext.Provider>
  );
}

export { IO_THRESHOLDS };
