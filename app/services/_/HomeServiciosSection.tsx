"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLenis } from "lenis/react";
import ServiceCardVideoWithScrollAudio from "@/app/services/_/ServiceCardVideoWithScrollAudio";
import { ServiciosScrollAudioProvider } from "@/app/services/_/ServiciosScrollAudioProvider";
import {
  CARD_STACK_INSET_CLASSES,
  CARD_TOP_OFFSET_CLASSES,
  useNavbarHeight,
  usePanelScrollPx,
} from "@/lib/stickyCardStackViewport";

// ----------------------------------------------------------------------
// Data
// ----------------------------------------------------------------------

type ServiceTheme = {
  /** Card background */
  bg: string;
  /** Body text color */
  text: string;
  /** Subtitle / muted text */
  muted: string;
  /** Accent for eyebrow + CTA */
  accent: string;
  /** Big number / outline color */
  numberStroke: string;
};

type Service = {
  id: string;
  category: string; // small eyebrow tag, e.g. "REPUTACIÓN"
  title: string;
  description: string;
  ctaLabel: string;
  ctaSubject: string; // ?subject= param into /contact
  posterSrc: string;
  videoSrc: string;
  iconSrc: string;
  theme: ServiceTheme;
};

const SERVICIOS: Service[] = [
  {
    id: "01",
    category: "REPUTACIÓN",
    title: "Estrategia Corporativa y Reputación",
    description:
      "Consultoría a nivel C-suite: arquitectura de reputación corporativa, asuntos públicos, comunicación interna, posicionamiento ejecutivo y narrativa institucional. Alineamos lo que la compañía hace con lo que el mercado escucha.",
    ctaLabel: "Conversemos sobre reputación",
    ctaSubject: "Reputacion",
    posterSrc: "/assets/images/servicios/influencia.svg",
    videoSrc: "/assets/videos/services/PERFORMANCE%20(1).mp4",
    iconSrc: "/assets/images/servicios/icons/reputation.svg",
    theme: {
      bg: "#FAFAFC",
      text: "#0E1745",
      muted: "#3F4665",
      accent: "#1534DC",
      numberStroke: "rgba(21,52,220,0.10)",
    },
  },
  {
    id: "02",
    category: "CREATIVIDAD",
    title: "Creatividad y Campañas Integradas",
    description:
      "Creatividad aplicada a problemas de negocio y cambio social. Plataformas que combinan PR, contenido, activación, asuntos públicos e influencia cultural. Traducimos tensiones culturales en ideas que mueven mercados.",
    ctaLabel: "Conversemos sobre creatividad",
    ctaSubject: "Creatividad",
    posterSrc: "/assets/images/servicios/creatividad.svg",
    videoSrc: "/assets/videos/services/CREATIVIDAD.mp4",
    iconSrc: "/assets/images/servicios/icons/search.svg",
    theme: {
      bg: "#1534DC",
      text: "#FFFFFF",
      muted: "rgba(255,255,255,0.75)",
      accent: "#F540FF",
      numberStroke: "rgba(255,255,255,0.18)",
    },
  },
  {
    id: "03",
    category: "MEDIA + DATA",
    title: "Media Performance y Data",
    description:
      "Distribución pagada, ganada y propia con medición continua. Integramos data de consumo digital, escucha social y performance editorial para decidir qué historia mover, en qué canal y a qué audiencia.",
    ctaLabel: "Conversemos sobre performance",
    ctaSubject: "Media-Performance",
    posterSrc: "/assets/images/servicios/media-performance.svg",
    videoSrc: "/assets/videos/services/PERFORMANCE.mp4",
    iconSrc: "/assets/images/servicios/icons/sms.svg",
    theme: {
      bg: "#0E1745",
      text: "#FFFFFF",
      muted: "rgba(255,255,255,0.7)",
      accent: "#5BE9FF",
      numberStroke: "rgba(91,233,255,0.22)",
    },
  },
  {
    id: "04",
    category: "CRISIS",
    title: "Crisis y Gestión de Riesgo",
    description:
      "Acompañamos antes, durante y después de eventos sensibles que pueden afectar reputación. Monitoreo, vocería, manejo de stakeholders y narrativa estratégica — desde riesgos regulatorios hasta crisis digitales.",
    ctaLabel: "Conversemos sobre crisis",
    ctaSubject: "Crisis",
    posterSrc: "/assets/images/servicios/crisis.svg",
    videoSrc: "/assets/videos/services/GESTION%20DE%20RIESGO.mp4",
    iconSrc: "/assets/images/servicios/icons/mail.svg",
    theme: {
      bg: "#F540FF",
      text: "#FFFFFF",
      muted: "rgba(255,255,255,0.85)",
      accent: "#FFFFFF",
      numberStroke: "rgba(255,255,255,0.22)",
    },
  },
];

// ----------------------------------------------------------------------
// Hook: which card is currently pinned at the top of the viewport
// ----------------------------------------------------------------------
function useActiveCardIndex(cardCount: number, navH: number) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const slots = document.querySelectorAll<HTMLElement>("[data-card-slot]");
    if (slots.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visibleSlots = entries
          .filter((e) => e.isIntersecting)
          .map((e) => Number(e.target.getAttribute("data-card-index") ?? 0))
          .sort((a, b) => a - b);
        if (visibleSlots.length === 0) return;
        // pick the last-visible — that's the one currently pinned on top
        setActive(visibleSlots[visibleSlots.length - 1]);
      },
      {
        root: null,
        rootMargin: `-${navH + 40}px 0px -55% 0px`,
        threshold: 0,
      },
    );
    slots.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [cardCount, navH]);
  return active;
}

// ----------------------------------------------------------------------
// Floating progress indicator
// ----------------------------------------------------------------------
function ServicesProgressPill({
  index,
  total,
  category,
}: {
  index: number;
  total: number;
  category: string;
}) {
  return (
    <div className="pointer-events-none fixed bottom-8 left-6 z-40 hidden md:flex items-center gap-3 rounded-full border border-white/15 bg-[#0E1745]/85 px-4 py-2 backdrop-blur-md shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)]">
      <span className="[font-family:var(--font-fira-mono)] text-[11px] uppercase tracking-[0.18em] text-white/60">
        {String(index + 1).padStart(2, "0")}
        <span className="mx-1 text-white/30">/</span>
        {String(total).padStart(2, "0")}
      </span>
      <span className="h-3 w-px bg-white/15" />
      <span className="[font-family:var(--font-figtree)] text-[11px] font-semibold tracking-[0.14em] text-white">
        {category}
      </span>
      <span className="ml-2 flex gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={`block h-1 w-3 rounded-full transition-colors duration-300 ${
              i === index ? "bg-[#F540FF]" : "bg-white/15"
            }`}
          />
        ))}
      </span>
    </div>
  );
}

// ----------------------------------------------------------------------
// One service card
// ----------------------------------------------------------------------
function ServiceCard({
  service,
  index,
  reverse,
  prefersReducedMotion,
}: {
  service: Service;
  index: number;
  reverse: boolean;
  prefersReducedMotion: boolean;
}) {
  const { theme } = service;

  return (
    <div
      className="relative mx-auto w-full max-w-[1380px] overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]"
      style={{
        backgroundColor: theme.bg,
        color: theme.text,
        // Bounded card height — fits in viewport, doesn't grow to fill
        // the scroll-through slot. Sticky slot scrolls past this card.
        height: "clamp(540px, 76vh, 720px)",
      }}
    >
      <div
        className={`grid h-full w-full grid-cols-1 lg:grid-cols-[1.05fr_1fr] ${
          reverse ? "lg:[direction:rtl]" : ""
        }`}
      >
        {/* CONTENT side */}
        <div
          className="relative flex h-full flex-col justify-between p-7 md:p-12 lg:p-16 [direction:ltr]"
        >
          {/* Background outline number */}
          <div
            aria-hidden
            className="pointer-events-none absolute right-6 top-4 select-none [font-family:var(--font-glitz-local)] text-[160px] leading-none md:text-[220px] lg:text-[280px]"
            style={{
              color: theme.numberStroke,
              WebkitTextStroke: `1px ${theme.numberStroke}`,
            }}
          >
            {service.id}
          </div>

          {/* Top: eyebrow with category */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 [font-family:var(--font-fira-mono)] text-[11px] tracking-[0.22em]">
              <span style={{ color: theme.accent }} className="font-semibold">
                {service.id}
              </span>
              <span style={{ background: theme.muted }} className="block h-px w-8 opacity-50" />
              <span style={{ color: theme.muted }}>{service.category}</span>
            </div>
          </div>

          {/* Middle: title + description */}
          <div className="relative z-10 mt-10 md:mt-12">
            <h3 className="max-w-[16ch] text-[26px] md:text-[36px] lg:text-[44px] leading-[1.05] [font-family:var(--font-glitz-local)]">
              {service.title}
            </h3>
            <p
              className="mt-5 max-w-[44ch] text-[14px] md:text-[15px] leading-[1.55] [font-family:var(--font-fira-sans)]"
              style={{ color: theme.muted }}
            >
              {service.description}
            </p>
          </div>

          {/* Bottom: just the CTA */}
          <div className="relative z-10 mt-10 md:mt-14">
            <Link
              href={`/contact?subject=${service.ctaSubject}`}
              className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 [font-family:var(--font-figtree)] text-[12px] font-semibold uppercase tracking-[0.10em] transition-all duration-300 hover:opacity-90 active:scale-95"
              style={{
                backgroundColor: theme.accent,
                color: theme.bg === "#FAFAFC" ? "#FFFFFF" : theme.bg,
              }}
            >
              {service.ctaLabel}
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {/* VISUAL side */}
        <div
          className="relative min-h-[280px] md:min-h-[420px] lg:min-h-0 overflow-hidden [direction:ltr]"
        >
          {prefersReducedMotion ? (
            <Image
              src={service.posterSrc}
              alt={`Ilustración del servicio: ${service.title}`}
              fill
              sizes="(max-width: 1024px) 100vw, 640px"
              className="object-cover"
              priority={index < 2}
            />
          ) : (
            <ServiceCardVideoWithScrollAudio
              cardIndex={index}
              src={service.videoSrc}
              poster={service.posterSrc}
              ariaLabel={`Video del servicio: ${service.title}`}
              className="absolute inset-0"
            />
          )}
          {/* Icon overlay */}
          <div
            aria-hidden
            className="absolute right-5 top-5 hidden h-16 w-16 md:right-7 md:top-7 md:flex md:h-20 md:w-20 lg:h-24 lg:w-24 items-center justify-center rounded-full backdrop-blur-md"
            style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
          >
            <Image
              src={service.iconSrc}
              alt=""
              width={48}
              height={48}
              className="h-1/2 w-1/2 object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------
export default function HomeServiciosSection() {
  const lenis = useLenis();
  const navH = useNavbarHeight();
  const panelScrollPx = usePanelScrollPx(navH, lenis);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const panelMinFallback = `calc(100dvh - ${navH}px)`;

  return (
    <>
      <section className="relative mt-10 md:mt-30 mb-20">
        <ServiciosScrollAudioProvider cardCount={SERVICIOS.length}>
          <div
            className={`relative isolate ${CARD_STACK_INSET_CLASSES} pt-4 md:pt-6`}
          >
            {SERVICIOS.map((service, index) => (
              <div
                key={service.id}
                data-card-slot
                data-card-index={index}
                // justify-START (not center) — el slot es más alto que
                // la zona sticky visible (height = panelScrollPx + 200
                // para dar scroll-runway). Si centramos verticalmente,
                // la card queda BAJADA y el CTA inferior se corta del
                // viewport. Anclamos arriba; CARD_TOP_OFFSET_CLASSES da
                // el respiro con el navbar.
                className={`flex w-full flex-col items-stretch justify-start ${CARD_TOP_OFFSET_CLASSES} ${
                  prefersReducedMotion ? "relative" : "sticky"
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
                        minHeight: panelMinFallback + " + 200px",
                      }),
                }}
              >
                <ServiceCard
                  service={service}
                  index={index}
                  reverse={index % 2 === 1}
                  prefersReducedMotion={prefersReducedMotion}
                />
              </div>
            ))}
          </div>
        </ServiciosScrollAudioProvider>
      </section>
    </>
  );
}
