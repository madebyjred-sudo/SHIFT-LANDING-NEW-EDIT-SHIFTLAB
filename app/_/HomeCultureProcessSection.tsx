"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";

export type Step = {
  num: string;
  title: string;
  imageSrc: string;
};

export interface HomeCultureProcessSectionProps {
  steps: readonly Step[];
  defaultActive?: number;
}

// ── Exact Figma values ─────────────────────────────────────────────────────

const GAP = 16;   // px gap between cards
const COLLAPSED_W = 177;  // px — Figma: collapsed card width
const CARD_H = 432;  // px — Figma: card height
const RADIUS = 30;   // px — Figma: border radius
const ACTIVE_BG = "#002E6D";
const COLLAPSED_BG = "#1534DC";
const BORDER_COLOR = "#1534DC";

// ──────────────────────────────────────────────────────────────────────────

export default function HomeCultureProcessSection({ steps, defaultActive = 0 }: HomeCultureProcessSectionProps) {
  const [active, setActive] = useState(defaultActive);
  const [animating, setAnimating] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef(defaultActive);
  const trackWRef = useRef(0);

  // Compute left + width for every card
  const getPositions = useCallback((activeIdx: number, trackW: number) => {
    const aw =
      trackW - (steps.length - 1) * COLLAPSED_W - (steps.length - 1) * GAP;
    let cursor = 0;
    return steps.map((_, i) => {
      const w = i === activeIdx ? aw : COLLAPSED_W;
      const left = cursor;
      cursor += w + GAP;
      return { left, width: w };
    });
  }, []);

  // Write positions directly to DOM
  const applyPositions = useCallback(
    (positions: { left: number; width: number }[], withTransition: boolean) => {
      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        card.style.transition = withTransition
          ? "left 0.38s cubic-bezier(0.32,1,0.4,1), width 0.38s cubic-bezier(0.32,1,0.4,1)"
          : "none";
        card.style.left = `${positions[i].left}px`;
        card.style.width = `${positions[i].width}px`;
      });
    },
    []
  );

  // Measure + layout on mount and resize
  useEffect(() => {
    if (!trackRef.current) return;
    const measure = () => {
      const w = trackRef.current?.offsetWidth ?? 0;
      if (w === 0) return;
      trackWRef.current = w;
      applyPositions(getPositions(activeRef.current, w), false);
    };
    requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    return () => ro.disconnect();
  }, [getPositions, applyPositions]);

  // Swap animation
  const handleCardClick = useCallback(
    (clickedIndex: number) => {
      if (clickedIndex === activeRef.current || animating) return;

      const trackW = trackWRef.current;
      if (trackW === 0) {
        activeRef.current = clickedIndex;
        setActive(clickedIndex);
        return;
      }

      setAnimating(true);
      const prev = activeRef.current;
      const fromPos = getPositions(prev, trackW);
      const toPos = getPositions(clickedIndex, trackW);
      const aw =
        trackW - (steps.length - 1) * COLLAPSED_W - (steps.length - 1) * GAP;

      // 1. Freeze transitions
      cardRefs.current.forEach((c) => { if (c) c.style.transition = "none"; });

      // 2. Teleport clicked card to active card's current slot
      const clickedCard = cardRefs.current[clickedIndex];
      const prevCard = cardRefs.current[prev];
      if (clickedCard) {
        clickedCard.style.left = `${fromPos[prev].left}px`;
        clickedCard.style.width = `${aw}px`;
        clickedCard.style.zIndex = "20";
      }
      if (prevCard) {
        prevCard.style.left = `${fromPos[prev].left}px`;
        prevCard.style.width = `${aw}px`;
      }

      // 3. Force reflow
      trackRef.current?.getBoundingClientRect();

      // 4. Animate all cards to final positions
      const tr =
        "left 0.38s cubic-bezier(0.32,1,0.4,1), width 0.38s cubic-bezier(0.32,1,0.4,1)";
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        c.style.transition = tr;
        c.style.left = `${toPos[i].left}px`;
        c.style.width = `${toPos[i].width}px`;
        c.style.zIndex = i === clickedIndex ? "20" : "1";
      });

      activeRef.current = clickedIndex;
      setActive(clickedIndex);

      setTimeout(() => {
        if (clickedCard) clickedCard.style.zIndex = "5";
        setAnimating(false);
      }, 420);
    },
    [animating, getPositions]
  );

  return (
    <section className="relative bg-white">
      <div className="mx-auto w-full max-w-[1380px]">

        {/* ── Mobile: flex-col ── */}
        <div
          className="flex flex-col gap-3 min-[500px]:hidden"
          role="tablist"
          aria-label="Pasos del modelo Shifting Culture"
        >
          {steps.map((step, index) => {
            const isActive = active === index;
            return (
              <button
                key={step.num}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => { activeRef.current = index; setActive(index); }}
                style={{
                  borderRadius: `${RADIUS}px`,
                  border: `2px solid ${BORDER_COLOR}`,
                  backgroundColor: isActive ? ACTIVE_BG : COLLAPSED_BG,
                }}
                className={[
                  "relative flex cursor-pointer flex-col overflow-hidden border-0 text-left",
                  "transition-[min-height,background-color] duration-380 ease-[cubic-bezier(0.32,1,0.4,1)]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E600FF]",
                  isActive ? "min-h-[280px]" : "min-h-[64px]",
                ].join(" ")}
              >
                <CardContent step={step} isActive={isActive} index={index} size="mobile" />
              </button>
            );
          })}
        </div>

        {/* ── Desktop: absolute-positioned swap ── */}
        <div
          ref={trackRef}
          className="relative hidden min-[500px]:block"
          style={{ height: `${CARD_H}px` }}
          role="tablist"
          aria-label="Pasos del modelo Shifting Culture"
        >
          {steps.map((step, index) => {
            const isActive = active === index;
            return (
              <button
                key={step.num}
                ref={(el) => { cardRefs.current[index] = el; }}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-expanded={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleCardClick(index)}
                style={{
                  position: "absolute",
                  top: 0,
                  height: `${CARD_H}px`,
                  borderRadius: `${RADIUS}px`,
                  border: `2px solid ${BORDER_COLOR}`,
                  backgroundColor: isActive ? ACTIVE_BG : COLLAPSED_BG,
                  zIndex: isActive ? 5 : 1,
                }}
                className={[
                  "cursor-pointer overflow-hidden text-left",
                  "transition-[background-color,box-shadow] duration-280 ease-out",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E600FF]",
                  isActive ? "" : "",
                ].join(" ")}
              >
                <CardContent step={step} isActive={isActive} index={index} size="desktop" />
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}

// ─── Shared card content ──────────────────────────────────────────────────
function CardContent({
  step,
  isActive,
  index,
  size,
}: {
  step: Step;
  isActive: boolean;
  index: number;
  size: "mobile" | "tablet" | "desktop";
}) {
  const isMobile = size === "mobile";
  const isTablet = size === "tablet";

  return (
    <>
      {/* Step number — always top-left, colour transitions only */}
      <span
        className={[
          "pointer-events-none absolute z-10 select-none font-sans font-extrabold leading-none tracking-tight",
          "transition-colors duration-[250ms]",
          isMobile
            ? "left-5 top-5 text-[1.5rem]"
            : isTablet
              ? "left-6 top-6 text-[2rem]"
              : "left-8 top-8 text-[clamp(1.6rem,2.4vw,2.4rem)]",
          isActive ? "text-[#E600FF]" : "text-white",
        ].join(" ")}
      >
        {step.num}
      </span>

      {!isActive && <span className="sr-only">{step.title}</span>}

      {/* 3D image — fades in when active */}
      <div
        className={[
          "pointer-events-none absolute z-4",
          "transition-[opacity,transform] ease-out",
          isMobile
            ? "right-4 top-4 size-30 duration-260"
            : isTablet
              ? "right-5 top-5 size-120 duration-270"
              : "right-6 top-6 size-[clamp(100px,14vw,202px)] duration-280",
          isActive
            ? "translate-y-0 scale-100 opacity-100 delay-150"
            : "-translate-y-2 scale-[0.82] opacity-0 delay-0",
        ].join(" ")}
        aria-hidden
      >
        <Image
          src={step.imageSrc}
          alt={`Ilustración del paso ${step.num}: ${step.title}`}
          width={202}
          height={202}
          className="size-full object-contain drop-shadow-[0_12px_40px_rgba(230,0,255,0.3)]"
          sizes={isMobile ? "80px" : isTablet ? "120px" : "(max-width:1024px) 140px, 202px"}
          priority={index === 0}
        />
      </div>

      {/* Title — fades up when active */}
      <div
        className={[
          "absolute bottom-0 left-0 right-0 z-[5]",
          "transition-[opacity,transform] ease-out",
          isMobile ? "p-5 pb-6 duration-200" : isTablet ? "p-6 pb-8 duration-210" : "p-8 pb-10 duration-220",
          isActive
            ? "translate-y-0 opacity-100 delay-140"
            : "translate-y-3 opacity-0 delay-0",
        ].join(" ")}
      >
        <p
          className={[
            "max-w-[18ch] leading-[1.15] text-white [font-family:var(--font-glitz-local)]",
            isMobile ? "text-[2rem]" : isTablet ? "text-[32px] lg:text-[40px]" : "text-[35px] md:text-[40px] lg:text-[50px]",
          ].join(" ")}
        >
          {step.title}
        </p>
      </div>
    </>
  );
}
