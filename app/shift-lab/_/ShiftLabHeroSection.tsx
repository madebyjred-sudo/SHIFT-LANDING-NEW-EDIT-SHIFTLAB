"use client";

import { motion } from "framer-motion";
import { LabDotGrid, LabScanlines } from "@/components/ui/lab-primitives";

/**
 * Shift LAB hero — editorial tech, no code-cosplay.
 *
 * Dark canvas, subtle dot grid + scanlines, brand glows, big logo, a
 * Figtree subtitle, and a single mono lead paragraph that says
 * something real. No fake commands or section markers.
 */
export default function ShiftLabHeroSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0A0E27] pt-36 pb-24 md:pt-48 md:pb-32">
      {/* Background loop — futuristic data grid, barely perceptible.
          Sits below all decorative layers; volume is silenced and we
          force inline playback on mobile. */}
      <video
        aria-hidden
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.22] mix-blend-screen"
        src="/assets/videos/shift-lab/hero-grid.mp4"
      />
      {/* Slight dark wash so the video doesn't blow out the navy bg */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[#0A0E27]/55"
      />

      <LabDotGrid opacity={0.45} />
      <LabScanlines />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-32 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(245,64,255,0.32), transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-32 h-[480px] w-[480px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(91,233,255,0.20), transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 md:px-12 lg:px-16">
        {/* "Shift" stays white, "Lab" gets the brand magenta. Done with a
            hard-stop linear gradient sampled at ~55% of the logo width
            (the "Shift" wordmark ends roughly there in the source SVG). */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          role="img"
          aria-label="Shift Lab"
          className="block aspect-[476/124] w-[260px] md:w-[440px] lg:w-[560px]"
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

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-10 max-w-3xl text-[28px] md:text-[40px] lg:text-[44px] font-semibold leading-[1.08] tracking-tight text-white [font-family:var(--font-figtree)]"
        >
          Innovación e Inteligencia Artificial{" "}
          <span className="text-[#F540FF]">aplicada a comunicación.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 max-w-2xl [font-family:var(--font-fira-mono)] text-[14px] md:text-[15px] leading-[1.75] text-white/65"
        >
          Diseñamos sistemas donde la inteligencia humana y la artificial
          trabajan en flujo continuo. La tecnología trabaja al servicio de
          la estrategia y del criterio del equipo.
        </motion.p>
      </div>
    </section>
  );
}
