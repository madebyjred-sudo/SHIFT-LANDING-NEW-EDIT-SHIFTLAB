"use client";

import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useLenis } from "lenis/react";
import ServiceCardVideoWithScrollAudio from "@/app/services/_/ServiceCardVideoWithScrollAudio";
import { ServiciosScrollAudioProvider } from "@/app/services/_/ServiciosScrollAudioProvider";
import {
  CARD_STACK_INSET_CLASSES,
  CARD_TOP_OFFSET_CLASSES,
  useNavbarHeight,
  usePanelScrollPx,
} from "@/lib/stickyCardStackViewport";

const SERVICIOS = [
  {
    title: "Estrategia Corporativa y Reputación",
    description:
      "Auditorías de reputación, narrativa corporativa, asuntos públicos, ESG, posicionamiento y gobernanza comunicacional.",
    borderColor: "var(--Color-Blue-Royal-Blue, #0E1745)",
    panelBg: "#FFFFFF",
    panelText: "#0F0F0F",
    posterSrc: "/assets/images/servicios/influencia.svg",
    videoSrc: "/assets/videos/services/PERFORMANCE%20(1).mp4",
    iconSrc: "/assets/images/servicios/icons/reputation.svg",
  },
  {
    title: "Creatividad y Campañas Integradas",
    description:
      "Plataformas culturales, storytelling ejecutivo, branded content, activaciones y campañas regionales.",
    borderColor: "var(--Color-Blue-Navy-Blue, #0E1745)",
    panelBg: "var(--Color-Blue-Royal-Blue, #1534DC)",
    panelText: "#EDF0FE",
    posterSrc: "/assets/images/servicios/creatividad.svg",
    videoSrc: "/assets/videos/services/CREATIVIDAD.mp4",
    iconSrc: "/assets/images/servicios/icons/search.svg",
  },
  {
    title: "Media Performance y Data",
    description:
      "Planificación digital, optimización, dashboards, modelos de atribución y growth media.",
    borderColor: "var(--Color-Violet-Magenta, #0E1745)",
    panelBg: "#FFFFFF",
    panelText: "#0F0F0F",
    posterSrc: "/assets/images/servicios/media-performance.svg",
    videoSrc: "/assets/videos/services/PERFORMANCE.mp4",
    iconSrc: "/assets/images/servicios/icons/sms.svg",
  },
  {
    title: "Crisis y Gestión de Riesgo",
    description:
      "Modelos preventivos, simulaciones, entrenamiento de voceros y respuesta 24/7.",
    borderColor: "var(--Color-Blue-Royal-Blue, #0E1745)",
    panelBg: "var(--Color-Blue-Royal-Blue, #1534DC)",
    panelText: "#EDF0FE",
    posterSrc: "/assets/images/servicios/crisis.svg",
    videoSrc: "/assets/videos/services/GESTION%20DE%20RIESGO.mp4",
    iconSrc: "/assets/images/servicios/icons/mail.svg",
  },
] as const;

export default function HomeServiciosSection() {
  const lenis = useLenis();
  const navH = useNavbarHeight();
  const panelScrollPx = usePanelScrollPx(navH, lenis);
  const prefersReducedMotion = useReducedMotion();

  const panelMinFallback = `calc(100dvh - ${navH}px)`;

  return (
    <section className="relative mt-10 md:mt-30 mb-20">
      <ServiciosScrollAudioProvider cardCount={SERVICIOS.length}>
        <div
          className={`relative isolate ${CARD_STACK_INSET_CLASSES} pt-4 md:pt-6`}
        >
          {SERVICIOS.map((item, index) => (
          <div
            key={item.title}
            data-card-slot
            className={`flex w-full flex-col ${CARD_TOP_OFFSET_CLASSES} ${prefersReducedMotion ? "relative" : "sticky"
              }`}
            style={{
              zIndex: 10 + index * 10,
              ...(!prefersReducedMotion ? { top: navH } : undefined),
              ...(panelScrollPx != null
                ? {
                  height: panelScrollPx,
                  minHeight: panelScrollPx + 200,
                }
                : {
                  minHeight: panelMinFallback + 200,
                }),
            }}
          >
            <div
              className="relative mx-auto flex min-h-0 w-full max-w-[1380px] flex-1 rounded-xl border border-solid bg-white"
              style={{ borderColor: item.borderColor, backgroundColor: item.panelBg, color: item.panelText }}
            >
              <div
                className="flex w-full flex-col overflow-hidden rounded-[10px]"
              >
                <div className="relative flex basis-[20%] md:basis-[50%] items-center justify-between px-4 py-5 sm:px-5 sm:py-6 md:px-22 md:pr-9 md:py-25">
                  <div className="max-w-[85%] min-[400px]:max-w-[75%] md:max-w-[660px]">
                    <h3 className="text-left align-middle font-['Glitz'] font-normal not-italic tracking-normal text-[16px] leading-[1] sm:text-[20px] md:text-[50px] md:max-w-[540px]">
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 text-left text-[12px] font-normal not-italic leading-[1.25] tracking-[0] opacity-80 [font-family:var(--font-fira-sans)] sm:text-[13px] md:mt-8 md:max-w-[630x] md:text-[20px] md:leading-[28px] md:tracking-[0]"
                      style={{ color: item.panelText }}
                    >
                      {item.description}
                    </p>
                  </div>
                  <div className="relative hidden h-12 w-12 shrink-0 sm:h-16 sm:w-16 md:block md:h-[178px] md:w-[178px] md:right-[35px]">
                    <Image
                      src={item.iconSrc}
                      alt={`Icono del servicio: ${item.title}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                {prefersReducedMotion ? (
                  <div className="relative mx-2 mb-2 mt-2 min-h-[92px] flex-1 overflow-hidden rounded-[12px] md:mx-3 md:mb-3 md:mt-3 md:min-h-[220px]">
                    <Image
                      src={item.posterSrc}
                      alt={`Ilustración del servicio: ${item.title}`}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 1380px) 100vw, 1380px"
                      priority={index < 2}
                    />
                  </div>
                ) : (
                  <ServiceCardVideoWithScrollAudio
                    cardIndex={index}
                    src={item.videoSrc}
                    poster={item.posterSrc}
                    ariaLabel={`Video del servicio: ${item.title}`}
                    className="relative mx-2 mb-2 mt-2 flex h-full min-h-[92px] flex-1 overflow-hidden rounded-[12px] md:mx-3 md:mb-3 md:mt-3 md:min-h-[220px]"
                  />
                )}
              </div>
            </div>
          </div>
          ))}
        </div>
      </ServiciosScrollAudioProvider>
    </section>
  );
}
