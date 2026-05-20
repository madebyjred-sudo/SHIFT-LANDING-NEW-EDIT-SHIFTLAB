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

export default function PurposeHeroSection() {
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
      alt="Elemento gráfico decorativo — página Propósito Shift Latam"
      aria-hidden="true"
      width={849}
      height={728}
      className="z-10 spring-image pointer-events-none absolute right-[-29.5%] md:right-[7.5%] top-[21%] md:top-[-10%] h-auto w-[80%] md:w-[60%]"
    />
  );

  const enterMotion =
    "shift-logo-enter shift-logo-enter--purpose " +
    (visible ? "shift-logo-enter--on" : "shift-logo-enter--concealed");

  const mainText = (
    <div ref={heroHeadlineRef} className={enterMotion}>
      <h1 className="hidden font-glitz leading-[0.95] md:block md:text-[50px]">
        <GradientText text="Impulsamos" />
        <GradientText text="Cultura, Reputación" />
        <GradientText text="y Crecimiento" />
      </h1>
      <h1 className="text-4xl pb-6 font-semibold leading-[0.95] md:hidden">
        <GradientText text="Impulsamos" />
        <GradientText text="Cultura, " />
        <GradientText text="Reputación y" />
        <GradientText text="Crecimiento" />
      </h1>
    </div>
  );

  const subText = (
    <div ref={subTextRef} className={enterMotion}>
      <p
        className="w-full max-w-[90%] md:max-w-[85%] md:float-right pt-4 md:pt-1 [font-family:var(--font-fira-sans)]"
        style={{
          fontWeight: 400,
          fontStyle: "normal",
          fontSize: "18px",
          lineHeight: "20px",
          letterSpacing: 0,
        }}
      >
        <span>
          Nuestro propósito es mover cultura para generar impacto real en
          negocios y comunidades.
          <span className="[font-family:var(--font-fira-sans)] font-bold not-italic text-[18px] leading-[20px] tracking-[0] [leading-trim:none]">
            {" "}
            Creemos que la comunicación estratégica no solo debe influir,
            sino transformar.
          </span>
        </span>
        <br />
        <span className="inline-block pt-4 md:pt-0">
          Conectamos empresas, líderes y organizaciones con las conversaciones
          que definen el futuro de Latinoamérica.
        </span>
      </p>
    </div>
  );

  return (
    <div ref={sectionRef}>
      <div className="hidden md:block h-12 lg:h-35"></div>
      <TextSection backgroundImage={backgroundImage} mainText={mainText} subText={subText} />
      <div className="hidden md:block h-12 lg:h-35"></div>

    </div>
  );
}
