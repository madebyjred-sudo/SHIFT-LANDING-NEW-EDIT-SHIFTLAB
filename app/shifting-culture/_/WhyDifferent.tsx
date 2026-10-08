"use client";

import HeaderSection from "@/components/common/HeaderSection";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useInView } from "framer-motion";

function subscribePrefersReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getPrefersReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function ProblemWeSolveSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const subheadingRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const isInView = useInView(sectionRef, { once: true, amount: 0.35 });
  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    () => false
  );

  useEffect(() => {
    if (!isInView) return;
    setVisible(true);
  }, [isInView]);

  const enterMotion =
    "shift-logo-enter shift-logo-enter--purpose " +
    (visible ? "shift-logo-enter--on" : "shift-logo-enter--concealed");

  const replayRef = useRef(false);

  useLayoutEffect(() => {
    if (!visible || prefersReducedMotion) return;
    if (replayRef.current) return;
    replayRef.current = true;

    const headlineEl = headlineRef.current;
    const subheadingEl = subheadingRef.current;

    const replay = (el: HTMLDivElement | null) => {
      if (!el) return;
      el.classList.remove("shift-logo-enter--on");
      void el.offsetWidth;
      el.classList.add("shift-logo-enter--on");
    };

    replay(headlineEl);
    replay(subheadingEl);
  }, [visible, prefersReducedMotion]);

  const headingText = (
    <div ref={headlineRef} className={enterMotion}>
      <h2 className="text-2xl max-w-[200px] min-[420px]:max-w-full font-glitz  leading-[1.05]  md:text-4xl lg:text-[50px]">
        <span className="rotate-180 inline-block">?</span>
        Por qué es diferente?
      </h2>
    </div>
  );

  const subheadingText = (
    <div ref={subheadingRef} className={enterMotion}>
      <p className="mt-4 max-w-[958px] text-base [font-family:var(--font-fira-sans)] leading-[1.15] text-[#0E1745] md:text-lg lg:text-[18px] lg:leading-[20px]">
        Shifting Culture® no es un marco conceptual. Es una metodología aplicada que integra
        estrategia, creatividad, asuntos públicos y data bajo un mismo sistema operativo
        regional.
      </p>
    </div>
  );

  return (
    <div ref={sectionRef}>
      <HeaderSection
        paddingClassName="py-10 md:py-38!"
        backgroundColourClassName="bg-[#D1D8FB] md:bg-[#EDF0FE]"
        headingText={headingText}
        subheadingText={subheadingText}
      />
    </div>
  );
}
