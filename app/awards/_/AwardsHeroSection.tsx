"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import GradientText from "@/components/ui/GradientText";
import TextSection from "@/components/common/TextSection";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function AwardsHeroSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            gsap.from("h1, p", {
                y: 70,
                opacity: 0,
                duration: 0.6,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            });

            gsap.from(".wave-image", {
                y: 70,
                scale: 0.8,
                opacity: 0,
                duration: 0.8,
                delay: 0.3,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top 80%",
                    toggleActions: "play none none reverse",
                },
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const backgroundImage = <Image
        src="/assets/svg/wave-shape.svg"
        alt="Forma de onda decorativa en la sección hero de Premios"
        aria-hidden="true"
        width={849}
        height={728}
        className="wave-image pointer-events-none absolute  top-[5%] left-full translate-x-[-50%] md:left-[50%] md:top-[-10%] z-0 h-auto w-full md:w-[60%] "
    />

    const mainText = <>
        {/* Opaline trophy icon — single accent thematically aligned con
            la página de Premios. Más grande (72/96px) + halo magenta
            radial detrás para mantener presencia contra el bg blanco
            (los icons opaline tienen edges semi-transparentes que se
            pierden sin halo). */}
        <div
            aria-hidden
            className="relative z-10 mb-4 inline-flex h-[72px] w-[72px] items-center justify-center md:mb-6 md:h-24 md:w-24"
        >
            <span className="absolute inset-0 rounded-full bg-[#F540FF] opacity-15 blur-2xl" />
            <Image
                src="/assets/icons/opaline/trophy.png"
                alt=""
                width={96}
                height={96}
                className="relative h-full w-full object-contain"
            />
        </div>
        <h1 className="relative z-10 hidden font-glitz font-normal tracking-normal leading-[100%] md:block md:text-[50px]">
            <GradientText text="Una de las Agencias" />
            <GradientText text="Más Premiadas en" />
            <GradientText text="Latinoamérica" />
        </h1>
        <h1 className="relative z-10 pb-6 text-4xl font-glitz leading-[0.95] md:hidden">
            <GradientText text="Una de las" />
            <GradientText text="Agencias Más" />
            <GradientText text="Premiadas en" />
            <GradientText text="Latinoamérica" />
        </h1>
    </>

    const subText = <p className="relative z-10 w-full max-w-[90%] md:max-w-full lg:max-w-[500px] lg:ml-auto pt-4 md:pt-1 text-[18px] tracking-normal leading-[20px] text-[#111A31] [font-family:var(--font-fira-sans)]">
        <span>
            Con más de 120 premios internacionales, SHIFT LATAM se posiciona entre las agencias más reconocidas de la región en creatividad, efectividad y relaciones públicas.
        </span>
        <br />
        <span className="inline-block pt-4">
            Nuestros reconocimientos incluyen
            <strong>
                {" "}
                Effie Awards, SABRE Awards LATAM y Global, Cannes Lions, FIAP, PRWeek Global Awards y Clio Awards, entre otros.
            </strong>
        </span>
    </p>

    return (
        <div ref={containerRef} className="relative overflow-hidden">
            <div className="hidden lg:block h-20"></div>
            <TextSection
                backgroundImage={backgroundImage}
                mainText={mainText}
                subText={subText}
            />
            <div className="hidden lg:block h-20"></div>
            <div className="absolute bottom-0 left-0 right-0 block h-[350px] md:h-48 bg-[linear-gradient(to_top,white_0%,rgba(255,255,255,0.5)_80%,transparent_100%)]"></div>
        </div>
    );
}
