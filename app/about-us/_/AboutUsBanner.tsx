"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

const people: { src: string }[] = [
  { src: "/assets/png/awards/person-1.png" },
  { src: "/assets/png/awards/person-2.png" },
  { src: "/assets/png/awards/person-3.png" },
  { src: "/assets/png/awards/person-4.png" },
  { src: "/assets/png/awards/person-5.png" },
  { src: "/assets/png/awards/person-6.png" },
];

const INTRO_MS = 20000;

/** Strong ease-out: fast start, long gentle finish (one full duplicated row when possible). */
function easeOutQuint(t: number): number {
  return 1 - (1 - t) ** 5;
}

function PortraitRow() {
  return (
    <div className="flex mr-4 md:mr-6 shrink-0 gap-4 md:gap-6">
      {people.map(({ src }, index) => (
        <div key={src} className="awards-person-scroll-slide">
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl">
            <Image
              src={src}
              alt={`Retrato de colaborador del equipo Shift Latam — ${index + 1} de ${people.length}`}
              fill
              sizes="(max-width: 767px) 34vw, 26vw"
              className="pointer-events-none object-cover"
              draggable={false}
              priority={false}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AboutUsBanner() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [scrollUnlocked, setScrollUnlocked] = useState(false);
  const isInView = useInView(sectionRef, { once: true, amount: 0.35 });

  useLayoutEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setScrollUnlocked(true);
  }, []);

  useEffect(() => {
    if (!isInView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = stripRef.current;
    if (!el) return;

    let cancelled = false;
    let outerRaf = 0;

    const startTick = () => {
      if (cancelled) return;
      const halfWidth = el.scrollWidth / 2;
      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
      const target = Math.min(halfWidth, maxScroll);
      let animStart = 0;

      const tick = (now: number) => {
        if (cancelled) return;
        if (!animStart) animStart = now;
        const t = Math.min(1, (now - animStart) / INTRO_MS);
        const eased = easeOutQuint(t);
        el.scrollLeft = target * eased;
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setScrollUnlocked(true);
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    };

    outerRaf = requestAnimationFrame(() => {
      if (cancelled) return;
      rafRef.current = requestAnimationFrame(startTick);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isInView]);

  useEffect(() => {
    if (!scrollUnlocked) return;
    const el = stripRef.current;
    if (!el) return;

    let dragging = false;
    let activePointerId = 0;
    let startClientX = 0;
    let startScrollLeft = 0;
    let lastClientX = 0;
    let lastTime = 0;
    let velocityPxPerMs = 0;
    let momentumRaf = 0;

    const stopMomentum = () => {
      if (momentumRaf) cancelAnimationFrame(momentumRaf);
      momentumRaf = 0;
    };

    const clampScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.scrollLeft = Math.max(0, Math.min(max, el.scrollLeft));
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      stopMomentum();
      dragging = true;
      activePointerId = e.pointerId;
      startClientX = e.clientX;
      startScrollLeft = el.scrollLeft;
      lastClientX = e.clientX;
      lastTime = performance.now();
      velocityPxPerMs = 0;
      el.setPointerCapture(e.pointerId);
      el.classList.add("cursor-grabbing");
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      const now = performance.now();
      const dx = e.clientX - startClientX;
      el.scrollLeft = startScrollLeft - dx;
      clampScroll();
      const dt = now - lastTime;
      if (dt > 0) {
        const inst = (e.clientX - lastClientX) / dt;
        velocityPxPerMs = velocityPxPerMs * 0.35 + inst * 0.65;
      }
      lastClientX = e.clientX;
      lastTime = now;
    };

    const resetDrag = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      dragging = false;
      el.classList.remove("cursor-grabbing");
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging || e.pointerId !== activePointerId) return;
      const max = el.scrollWidth - el.clientWidth;
      const vx = velocityPxPerMs;
      resetDrag(e);
      if (max <= 0) return;

      /* vx in px/ms → initial glide speed in px/s */
      let v = -vx * 1000 * 0.48;
      if (Math.abs(v) < 48) return;

      let prev = performance.now();
      const step = (now: number) => {
        const dt = Math.min((now - prev) / 1000, 0.05);
        prev = now;
        el.scrollLeft += v * dt;
        const atStart = el.scrollLeft <= 0;
        const atEnd = el.scrollLeft >= max - 0.5;
        if (atStart || atEnd) {
          stopMomentum();
          clampScroll();
          return;
        }
        v *= Math.exp(-dt * 5.2);
        if (Math.abs(v) < 10) {
          stopMomentum();
          return;
        }
        momentumRaf = requestAnimationFrame(step);
      };
      momentumRaf = requestAnimationFrame(step);
    };

    const onPointerCancel = (e: PointerEvent) => {
      stopMomentum();
      resetDrag(e);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);

    return () => {
      stopMomentum();
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [scrollUnlocked]);

  return (
    // <div ref={sectionRef} className="overflow-hidden pb-22 pt-2">
    //   <div className="awards-person-scroll relative mt-44 w-full overflow-hidden">
    //     <Image
    //       src="/assets/svg/full-rings.svg"
    //       alt=""
    //       width={849}
    //       height={728}
    //       aria-hidden
    //       className="absolute h-full scale-150 top-1/2 right-[-3%]  md:right-[10%] translate-y-[-50%]"
    //     />
    //     <Image
    //       src="/assets/svg/half-rings.svg"
    //       alt=""
    //       width={849}
    //       height={728}
    //       aria-hidden
    //       className="pointer-events-none z-20 absolute h-full scale-150 top-1/2 right-[-3%]  md:right-[10%] translate-y-[-50%]"
    //       // className=" absolute z-20 h-full scale-150 top-1/2 right-[calc(2.4%)] md:right-[calc(14%-1.5px)] translate-y-[-50%]"
    //     />

    //     <div
    //       ref={stripRef}
    //       className={`awards-person-scroll-strip relative z-10 w-full touch-pan-x select-none pt-2 pb-4 md:py-4 ${
    //         scrollUnlocked
    //           ? "cursor-grab overflow-hidden"
    //           : "cursor-default overflow-hidden"
    //         }`}
    //       style={{ WebkitOverflowScrolling: "touch" }}
    //     >
    //       <div className="flex w-max">
    //         <PortraitRow />
    //         <PortraitRow />
    //       </div>
    //     </div>
    //   </div>
    // </div>

    <div ref={sectionRef} className="relative pt-2 pb-22 w-full overflow-x-clip">
      <div className="awards-person-scroll relative md:mt-44 w-full">
        <Image
          src="/assets/svg/full-rings.svg"
          alt="Anillos concéntricos decorativos de fondo"
          width={849}
          height={728}
          aria-hidden
          className="absolute top-1/2 right-[-3%] z-0 h-full scale-150 -translate-y-1/2 md:right-[10%] object-visible"
        />

        {/* PORTRAITS CONTAINER */}
        <div
          ref={stripRef}
          className={`awards-person-scroll-strip relative z-10 w-full touch-pan-x select-none overflow-x-auto no-scrollbar py-4 ${scrollUnlocked ? "cursor-grab" : "cursor-default"
            }`}
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="flex w-max">
            <PortraitRow />
            <PortraitRow />
          </div>
        </div>

        {/* HALF RINGS (Foreground) */}
        <Image
          src="/assets/svg/half-rings.svg"
          alt="Medio anillo decorativo en primer plano del carrusel de equipo"
          width={849}
          height={728}
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-[-3%] z-20 h-full scale-150 -translate-y-1/2 md:right-[10%]"
        />

      </div>
    </div>
  );
}
