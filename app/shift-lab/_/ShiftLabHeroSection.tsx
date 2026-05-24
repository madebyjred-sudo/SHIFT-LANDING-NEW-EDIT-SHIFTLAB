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
 * Choreography:
 *   t=0    → video ocupa todo el viewport, breath sutil, scroll hint pulsando
 *   t=0→0.7 → al scrollear, el video se encoge desde la izquierda hacia el
 *             borde derecho (width 100% → 55%) Y simultáneamente avanza su
 *             currentTime sincronizado con el progress (frame-by-frame).
 *   t=0.4→0.8 → mientras tanto, el logo "Shift Lab" + tagline + texto
 *               aparecen desde la izquierda (fade + slide).
 *   t=1    → estado final estático: video a la derecha, texto a la izquierda.
 *
 * Mechanic:
 *   - Section tiene altura 250vh (runway de scroll).
 *   - Inner div sticky top-0 h-screen → mantiene el video pegado al viewport
 *     mientras el scroll del runway avanza.
 *   - useScroll mide el progress 0→1 sobre la section.
 *   - useMotionValueEvent sincroniza video.currentTime = progress * duration.
 *   - El video tiene TODOS los frames como keyframes (transcodeado con
 *     ffmpeg -g 1) — necesario para que el scrubbing sea suave en Chrome
 *     y Safari. Sin esto, el browser solo puede saltar a keyframes y se
 *     ve choppy.
 *
 * Reduced motion: si OS pide menos movimiento, mostramos el estado FINAL
 * estático (video en su tamaño final + texto visible) sin scroll-driven
 * playback. El video todavía corre en autoplay loop para no ser
 * completamente estático.
 */

const VIDEO_SRC = "/assets/videos/shift-lab/hero-scroll.mp4";

export default function ShiftLabHeroSection() {
  const reduce = useReducedMotion();
  const sectionRef = React.useRef<HTMLElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = React.useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Sync video.currentTime → scroll progress (frame-by-frame scrubbing).
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const v = videoRef.current;
    if (!v || !videoReady || reduce) return;
    const duration = v.duration;
    if (!isFinite(duration) || duration === 0) return;
    // Clamp progress 0..1
    const t = Math.max(0, Math.min(1, progress)) * duration;
    // Solo escribir si cambió notablemente para evitar thrash
    if (Math.abs(v.currentTime - t) > 0.02) {
      v.currentTime = t;
    }
  });

  // ── Animaciones derivadas del scroll ────────────────────────────────
  // Video: width 100% → 55% (anclado al borde derecho, se encoge desde
  // la izquierda revelando espacio para el texto).
  const videoWidth = useTransform(scrollYProgress, [0, 0.7], ["100%", "55%"]);

  // Texto/logo: aparecen a partir del 40% del scroll, completos al 75%.
  const textOpacity = useTransform(scrollYProgress, [0.4, 0.75], [0, 1]);
  const textX = useTransform(scrollYProgress, [0.4, 0.75], [-24, 0]);

  // Scroll hint: visible solo al inicio, desaparece al primer scroll.
  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // Tint overlay sobre el video — más oscuro al inicio (para que el
  // breath se sienta), se aclara mientras el video toma su posición final.
  const tintOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.25, 0.1, 0],
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-black"
      style={{ height: "250vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video container — width animada, anclado al right edge */}
        <motion.div
          className="absolute top-0 right-0 h-full overflow-hidden"
          style={{ width: reduce ? "55%" : videoWidth }}
        >
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            muted
            playsInline
            preload="auto"
            // Si reduce-motion, hacer autoplay loop. Sino, queda quieto
            // hasta que el scroll lo mueva.
            autoPlay={reduce ? true : false}
            loop={reduce ? true : false}
            className="h-full w-full object-cover"
            onLoadedMetadata={() => {
              setVideoReady(true);
              // Setea frame 0 explícitamente
              if (videoRef.current && !reduce) {
                videoRef.current.pause();
                videoRef.current.currentTime = 0;
              }
            }}
            aria-hidden
          />
          {/* Subtle dark tint overlay para legibility del hint inicial */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-black"
            style={{ opacity: reduce ? 0 : tintOpacity }}
          />
        </motion.div>

        {/* Breath del video al inicio — solo visible mientras está fullscreen.
            Implementado como subtle scale sobre el container del video.
            Pausa cuando el scroll arranca para no competir con el shrink. */}
        {!reduce && <BreathBackground scrollProgress={scrollYProgress} />}

        {/* Logo + tagline + texto — aparecen desde la izquierda */}
        <motion.div
          className="absolute inset-y-0 left-0 flex w-full flex-col justify-center px-6 md:w-[45%] md:px-12 lg:px-16"
          style={
            reduce
              ? { opacity: 1 }
              : { opacity: textOpacity, x: textX }
          }
        >
          {/* Shift Lab wordmark — color split (white "Shift" + magenta "LAB") */}
          <div
            role="img"
            aria-label="Shift Lab"
            className="block aspect-[476/124] w-[260px] md:w-[400px] lg:w-[480px]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #FFFFFF 0%, #FFFFFF 73%, #F540FF 73%, #F540FF 100%)",
              maskImage: "url(/assets/images/shift-lab/shift-lab.svg)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "left center",
              WebkitMaskImage: "url(/assets/images/shift-lab/shift-lab.svg)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "left center",
            }}
          />

          <h2 className="mt-8 max-w-2xl text-[28px] md:text-[40px] lg:text-[44px] font-semibold leading-[1.08] tracking-tight text-white [font-family:var(--font-figtree)]">
            Innovación e Inteligencia Artificial{" "}
            <span className="text-[#F540FF]">aplicada a comunicación.</span>
          </h2>

          <p className="mt-8 max-w-xl [font-family:var(--font-fira-mono)] text-[13px] md:text-[14.5px] leading-[1.75] text-white/65">
            Diseñamos sistemas donde la inteligencia humana y la artificial
            trabajan en flujo continuo. La tecnología trabaja al servicio de
            la estrategia y del criterio del equipo.
          </p>
        </motion.div>

        {/* Scroll hint — visible solo al inicio */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2"
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
                className="text-[10.5px] uppercase tracking-[0.28em] text-white/70"
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
                className="h-5 w-5 text-white/70"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="6 13 12 19 18 13" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/**
 * BreathBackground — subtle scale breath sobre el container del video
 * mientras el visitante todavía no scrolleó. Da la lectura "estoy vivo,
 * tocame". Se apaga cuando el scroll arranca para no competir con el
 * shrink del video.
 */
function BreathBackground({
  scrollProgress,
}: {
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // Breath solo activo cuando progress < 0.05 (apenas empezó a scrollear)
  const breathScale = useTransform(scrollProgress, [0, 0.05], [1.015, 1]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ scale: breathScale, transformOrigin: "center" }}
      animate={{ scale: [1, 1.012, 1] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
