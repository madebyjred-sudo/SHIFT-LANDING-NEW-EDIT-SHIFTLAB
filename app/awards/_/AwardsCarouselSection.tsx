"use client";

import { useEffect, useState } from "react";
import Section from "@/components/common/Section";
import CaseStudyCard from "./CaseStudyCard";
import GradientText from "@/components/ui/GradientText";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const CASE_STUDIES = [
  {
    id: "justice-by-her-type",
    youtubeId: "3yMpw8sEgnY",
    title: "Justice by her type",
    client: "Familias Sobreviviendo a Feminicidio",
    summary: "Iniciativa para exigir justicia e impactar el sistema a través de tipografías creadas por mujeres.",
    awardSvg: "/assets/svg/awards/EFFIE.svg",
    awardYear: "2024",
  },
  {
    id: "padvertising",
    youtubeId: "zaVy6e6qtn0",
    title: "Padvertising: Not a Luxury. Period",
    client: "Menstrual Justice Law, Costa Rica",
    summary: "Campaña disruptiva para posicionar los productos de higiene menstrual como necesidad básica.",
    awardSvg: "/assets/svg/awards/CANNES.svg",
    awardYear: "2023",
  },
  {
    id: "welcome-nosotras",
    youtubeId: "sIMN9NvCLi4",
    title: "Welcome To Group Nosotras Women Connecting",
    client: "Nosotras Women Connecting",
    summary: "Iniciativa para empoderar y conectar a mujeres líderes en la región.",
    awardSvg: "/assets/svg/awards/SABRE.svg",
    awardYear: "2024",
  },
  {
    id: "bitcentenario",
    youtubeId: "qJWU7dfDRog",
    title: "BITCentenario",
    client: "Microsoft",
    summary: "Metaverso inmersivo en Minecraft que conecta a la juventud para crear un futuro sostenible e inclusivo.",
    awardSvg: "/assets/svg/awards/SABRE.svg",
    awardYear: "2021",
  },
  {
    id: "heroes-turisticos",
    youtubeId: "F2-EnnQJaFg",
    title: "Héroes Turísticos",
    client: "ICT (Inst. Costarricense de Turismo)",
    summary: "Reconocimiento a las personas que mantienen vivo el espíritu turístico del país durante tiempos desafiantes.",
    awardSvg: "/assets/svg/awards/EFFIE.svg",
    awardYear: "2022",
  },
  {
    id: "turista-no-tico",
    youtubeId: "B9NYlrc_w5Q",
    title: "El turista no Tico, más Tico",
    client: "ICT (Inst. Costarricense de Turismo)",
    summary: "Campaña estratégica para fomentar el turismo interno y atraer extranjeros con mentalidad local.",
    awardSvg: "/assets/svg/awards/EFFIE 2.svg",
    awardYear: "2023",
  },
  {
    id: "matrimonio-igualitario",
    youtubeId: "KfS3DMC9POs",
    title: "Yes I Do, Case - GG",
    client: "Garnier BBDO / Matrimonio Igualitario",
    summary: "Campaña histórica y movilización en favor de la aprobación del matrimonio igualitario en Costa Rica.",
    awardSvg: "/assets/svg/awards/CANNES.svg",
    awardYear: "2020",
  },
  {
    id: "learning-virus",
    youtubeId: "7Sj54BKd0-8",
    title: "Spreading the Learning Virus",
    client: "GG",
    summary: "Iniciativa educativa para potenciar el aprendizaje continuo de manera viral.",
    awardSvg: "/assets/svg/awards/EFFIE.svg",
    awardYear: "2021",
  }
];

export default function AwardsCarouselSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!api) return;

    setActiveIndex(api.selectedScrollSnap());

    api.on("select", () => {
      setActiveIndex(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Section className="py-12 md:py-24 relative z-10 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Improved Header Layout */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-6">
          <div className="flex-1">
            <h2 className="flex flex-col text-4xl md:text-[5rem] font-glitz tracking-tight leading-[0.85] gap-y-1">
              <GradientText text="Trabajos" />
              <GradientText text="Premiados" />
            </h2>
          </div>
          <div className="flex-1 md:max-w-md pb-2">
            <p className="text-[18px] tracking-normal leading-[20px] text-[#111A31] [font-family:var(--font-fira-sans)]">
              Conocé los casos de éxito que han sido reconocidos en los festivales más importantes de la región y el mundo.
            </p>
          </div>
        </div>

        {/* Carousel Container */}
        <div className="relative px-0 md:px-8 pb-12">
          <Carousel
            setApi={setApi}
            opts={{
              align: "center",
              loop: true,
            }}
            orientation="vertical"
            className="w-full"
          >
            {/* Mask applied here so buttons are not affected */}
            <div 
              className="relative w-full h-full"
              style={{
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)"
              }}
            >
              {/* Decreased height on mobile to prevent huge gaps, basis adjusted proportionally */}
              <CarouselContent className="-mt-1 h-[400px] sm:h-[450px] md:h-[65vh]">
                {CASE_STUDIES.map((caseStudy, index) => (
                  <CarouselItem key={caseStudy.id} className="pt-2 md:pt-4 basis-[60%] sm:basis-[70%] md:basis-[85%] lg:basis-[90%]">
                    <div className={`transition-all duration-700 w-full h-full ${activeIndex === index ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}>
                      <CaseStudyCard caseStudy={caseStudy} isActive={activeIndex === index} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </div>
            
            <CarouselPrevious className="absolute left-1/2 -top-6 -translate-x-1/2 rotate-90 bg-white border border-slate-200 shadow-md hover:bg-slate-100 text-[#111A31] z-30" />
            <CarouselNext className="absolute left-1/2 -bottom-2 -translate-x-1/2 rotate-90 bg-white border border-slate-200 shadow-md hover:bg-slate-100 text-[#111A31] z-30" />
          </Carousel>
        </div>
      </div>
    </Section>
  );
}
