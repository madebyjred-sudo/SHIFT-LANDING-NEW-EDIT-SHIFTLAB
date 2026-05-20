"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import GradientText from "@/components/ui/GradientText";
import TextSection from "@/components/common/TextSection";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function subscribePrefersReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getPrefersReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function SectorsHeroSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLDivElement>(null);
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
    const els = [heroHeadlineRef.current, subTextRef.current].filter(
      (node): node is HTMLDivElement => node != null
    );
    for (const el of els) {
      el.classList.remove("shift-logo-enter--on");
      void el.offsetWidth;
      el.classList.add("shift-logo-enter--on");
    }
  }, [visible, prefersReducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined" || prefersReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".spring-image", {
        x: 200,
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        delay: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [prefersReducedMotion]);

  const backgroundImage = (
    <Image
      src="/assets/svg/spring.svg"
      alt="Elemento gráfico decorativo — Newsroom Shift Latam"
      aria-hidden="true"
      width={849}
      height={728}
      className="spring-image pointer-events-none absolute right-[-29.5%] md:right-[0.5%] top-[16%] md:top-[-24%] z-10 h-auto w-[80%] md:w-[62%]"
    />
  );

  const enterMotion =
    "shift-logo-enter shift-logo-enter--purpose" +
    (visible ? "shift-logo-enter--on" : "shift-logo-enter--concealed");

  const mainText = (
    <div ref={heroHeadlineRef} className={enterMotion}>
      <h1 className="hidden font-glitz leading-[0.95] md:block md:text-[50px]">
        <GradientText text="Experiencia en" />
        <GradientText text="Sectores Estratégicos" />
        <GradientText text="en Latinoamérica" />
      </h1>
      <h1 className="text-4xl font-glitz pb-6  leading-none md:hidden">
        <GradientText text="Experiencia en" />
        <GradientText text="Sectores" />
        <GradientText text="Estratégicos en" />
        <GradientText text="Latinoamérica" />
      </h1>
    </div>
  );

  const subText = (
    <div ref={subTextRef} className={enterMotion}>
      <p
        className="w-full relative max-w-[90%] md:max-w-[85%] md:float-right pt-4 md:pt-1 [font-family:var(--font-fira-sans)]"
        style={{
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "18px",
          lineHeight: "20px",
          letterSpacing: 0,
        }}
      >
        <span>
          En SHIFT LATAM trabajamos con industrias reguladas, complejas y altamente competitivas.
          <span className="[font-family:var(--font-fira-sans)] font-bold not-italic text-[18px] leading-[20px] tracking-[0] [leading-trim:none]">
            {" "}
            Nuestro conocimiento sectorial nos permite anticipar riesgos, diseñar narrativas sólidas y construir reputación sostenible.
          </span>
        </span>
      </p>
    </div>
  );

  return (
    <div ref={sectionRef}>
      <div className="hidden lg:block h-35"></div>
      <TextSection sectionClassname="lg:pb-10!" backgroundImage={backgroundImage} mainText={mainText} subText={subText} />
    </div>
  );
}
