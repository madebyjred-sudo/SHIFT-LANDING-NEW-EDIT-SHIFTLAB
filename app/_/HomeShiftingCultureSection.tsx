"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import OutlineArrowButton from "@/components/ui/OutlineArrowButton";

function subscribePrefersReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getPrefersReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HomeShiftingCultureSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    () => false
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (visible) return;

    const target = sectionRef.current;
    if (!target) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.3 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [visible]);

  const replayRef = useRef(false);

  useLayoutEffect(() => {
    if (!visible || prefersReducedMotion) return;
    if (replayRef.current) return;
    replayRef.current = true;
    const el = blockRef.current;
    if (!el) return;
    el.classList.remove("shift-logo-enter--on");
    void el.offsetWidth;
    el.classList.add("shift-logo-enter--on");
  }, [visible, prefersReducedMotion]);

  return (
    <section ref={sectionRef} className="relative bg-white">
      <div className="mx-auto w-full max-w-[1380px] px-5 py-12 md:px-10 md:py-16 lg:px-20 lg:py-24">
        <div
          ref={blockRef}
          className={
            visible
              ? "shift-logo-enter shift-logo-enter--on"
              : "shift-logo-enter shift-logo-enter--concealed"
          }
        >
          <div className="flex w-full flex-col gap-6 md:flex-row md:items-start md:justify-between md:gap-10 lg:gap-16">
            <h2 className="shrink-0 [font-family:var(--font-glitz-local)] text-[clamp(48px,8vw,96px)] font-normal not-italic leading-[85%] tracking-[0] text-[#1D4ED8] [leading-trim:normal] max-w-full break-words md:max-w-[min(100%,12ch)]">
              Shifting <br className="hidden md:block lg:hidden" /> Culture
            </h2>

            <div className="flex min-w-0 w-full max-w-full flex-col gap-6 md:max-w-[min(100%,380px)] md:shrink-0 lg:max-w-[min(100%,420px)] lg:gap-8">
              <p className="[font-family:var(--font-fira-sans)] text-[16px] md:text-[18px] font-normal not-italic leading-[1.3] tracking-[0] text-[#111A31] [leading-trim:normal]">
                Operamos bajo nuestro modelo propietario Shifting Culture®, donde estrategia,
                creatividad y datos funcionan como un solo sistema.
              </p>
              <div>
                <OutlineArrowButton
                  label="Conocé más"
                  href="/shifting-culture"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
