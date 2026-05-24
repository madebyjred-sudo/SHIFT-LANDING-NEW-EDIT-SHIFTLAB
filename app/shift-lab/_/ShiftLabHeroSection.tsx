"use client";

import * as React from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Shift LAB hero — scroll-driven cinemático.
 *
 * Layout: video FULL-WIDTH siempre. El texto va OVERLAY sobre el video
 * (logo Shift Lab a la izquierda, headline + sub a la derecha). Nunca
 * se divide el viewport en columnas.
 *
 * Choreography:
 *   t=0       → Video ocupa TODO el viewport (100vh × 100vw). Breath
 *               sutil + scroll hint pulsando abajo-centro. No se ve nada
 *               más, solo el video.
 *   t=0→1     → A medida que scrolleás:
 *               · El video AVANZA frame-by-frame (currentTime sync).
 *               · La ALTURA del video se reduce de 100vh → 75vh,
 *                 manteniendo 100% width. Se queda anclado al top.
 *               · Logo izquierda + headline derecha aparecen overlay
 *                 fade-in.
 *   t=1       → Estado final: video como BANNER 75vh ocupando todo el
 *               ancho, overlays visibles encima, debajo asoma el
 *               siguiente section del page (Info).
 *
 * Mechanic:
 *   - Section runway = 170vh (al scrollear los 170vh, la animación
 *     completa de 0 a 1).
 *   - Inner sticky div con height animado de 100vh a 75vh. Como el
 *     sticky reduce su altura DURANTE el scroll, el contenido siguiente
 *     (Info section) va asomando debajo a medida que el banner se hace
 *     más chico.
 *   - useMotionValueEvent sincroniza video.currentTime = progress
 *     * duration → scrubbing real frame-by-frame.
 *
 * Reduce-motion: video queda en su tamaño final (75vh banner) con
 * autoplay loop. Overlays visibles desde el inicio.
 */

const VIDEO_SRC = "/assets/videos/shift-lab/hero-scroll.mp4";

export default function ShiftLabHeroSection() {
  const reduce = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoReadyRef = React.useRef(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Sync video.currentTime → scroll progress (frame-by-frame scrubbing).
  // VIDEO_SCROLL_RATIO = 0.45 → el video se reproduce COMPLETO cuando
  // llegás al 45% del scroll del runway. El 55% restante del scroll lo
  // usamos para terminar de mostrar overlays + el shrink final. Esto da
  // la sensación de "video acelerado" — con poco scroll ya viste mucho
  // del video, en vez de necesitar scrollear todo el runway para verlo
  // entero.
  const VIDEO_SCROLL_RATIO = 0.45;
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const v = videoRef.current;
    if (!v || !videoReadyRef.current || reduce) return;
    const duration = v.duration;
    if (!isFinite(duration) || duration === 0) return;
    // Mapeo acelerado: progress 0 → 0; progress VIDEO_SCROLL_RATIO → 1
    // (último frame). Después queda en el último frame mientras los
    // overlays terminan de aparecer.
    const videoProgress = Math.min(progress / VIDEO_SCROLL_RATIO, 1);
    const t = videoProgress * duration;
    if (Math.abs(v.currentTime - t) > 0.015) {
      v.currentTime = t;
    }
  });

  // ── Animaciones derivadas del scroll ────────────────────────────────
  // Las animaciones de UI (shrink + overlays) corren en la SEGUNDA mitad
  // del runway, mientras el video YA terminó de reproducirse (queda en
  // último frame). Así el usuario primero ve el video entero (scroll 0
  // → 0.45) y después aparece el branding/texto sobre el último frame
  // (scroll 0.5 → 0.95).

  // Altura del video: 100vh → 75vh. Empieza a encoger después de que el
  // video terminó de reproducirse.
  const videoHeight = useTransform(
    scrollYProgress,
    [0.5, 0.95],
    ["100vh", "75vh"],
  );

  // Overlays aparecen una vez que el video terminó.
  const overlayOpacity = useTransform(scrollYProgress, [0.55, 0.9], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0.55, 0.9], [16, 0]);

  // Scroll hint: visible solo al arrancar.
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // Tint overlay sobre el video — más oscuro al inicio para que el hint
  // y el breath se sientan; se aclara según avanza el scroll.
  const tintOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.25, 0.12, 0.05],
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-black"
      style={{ height: "170vh" }}
    >
      <motion.div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: reduce ? "75vh" : videoHeight }}
      >
        {/* Video full-width + full-height del container */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          playsInline
          preload="auto"
          autoPlay={reduce ? true : false}
          loop={reduce ? true : false}
          className="absolute inset-0 h-full w-full object-cover"
          onLoadedMetadata={() => {
            videoReadyRef.current = true;
            if (videoRef.current && !reduce) {
              videoRef.current.pause();
              videoRef.current.currentTime = 0;
            }
          }}
          aria-hidden
        />

        {/* Dark tint para legibilidad de overlays + lectura del breath inicial */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black"
          style={{ opacity: reduce ? 0.05 : tintOpacity }}
        />

        {/* Breath sutil sobre el container del video (solo visible al
            inicio, se autocorrige cuando comienza el scroll). */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            animate={{ scale: [1, 1.012, 1] }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* ── OVERLAYS sobre el video ───────────────────────────── */}
        <motion.div
          aria-hidden={false}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-center px-6 md:px-12 lg:px-20"
          style={
            reduce
              ? { opacity: 1 }
              : { opacity: overlayOpacity, y: overlayY }
          }
        >
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-8 lg:gap-16">
            {/* IZQUIERDA — Logo Shift Lab grande */}
            <div className="flex justify-start">
              <div
                role="img"
                aria-label="Shift Lab"
                className="block aspect-[476/124] w-[260px] md:w-[420px] lg:w-[520px]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #FFFFFF 0%, #FFFFFF 73%, #F540FF 73%, #F540FF 100%)",
                  maskImage:
                    "url(/assets/images/shift-lab/shift-lab.svg)",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "left center",
                  WebkitMaskImage:
                    "url(/assets/images/shift-lab/shift-lab.svg)",
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "left center",
                }}
              />
            </div>

            {/* DERECHA — Headline + sub-text */}
            <div className="md:justify-self-end md:text-left">
              <h2 className="max-w-xl text-[22px] md:text-[30px] lg:text-[38px] font-semibold leading-[1.08] tracking-tight text-white [font-family:var(--font-figtree)]">
                Innovación e Inteligencia Artificial{" "}
                <span className="text-[#F540FF]">
                  aplicada a comunicación.
                </span>
              </h2>
              <p
                className="mt-5 max-w-md text-[12px] md:text-[13px] leading-[1.7] text-white/80"
                style={{
                  fontFamily:
                    "var(--font-fira-mono), ui-monospace, monospace",
                }}
              >
                Diseñamos sistemas donde la inteligencia humana y la
                artificial trabajan en flujo continuo. La tecnología
                trabaja al servicio de la estrategia y del criterio del
                equipo.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Scroll hint — visible solo al inicio */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
            style={{ opacity: hintOpacity }}
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex flex-col items-center gap-2"
            >
              <span
                className="text-[10.5px] uppercase tracking-[0.28em] text-white/80"
                style={{
                  fontFamily:
                    "var(--font-fira-mono), ui-monospace, monospace",
                }}
              >
                Scrolleá
              </span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white/80"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="6 13 12 19 18 13" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
