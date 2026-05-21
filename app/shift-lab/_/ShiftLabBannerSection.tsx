"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { LabCornerMarks, LabDotGrid } from "@/components/ui/lab-primitives";

/**
 * Shift LAB · Banner — preserves the existing banner image inside a
 * minimal rounded frame with subtle corner marks. No HUD chrome.
 */
export default function ShiftLabBannerSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0A0E27] pb-20 md:pb-28">
      <LabDotGrid opacity={0.2} />

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-3xl border border-white/10"
        >
          <LabCornerMarks color="rgba(245,64,255,0.5)" />

          <div className="relative aspect-[1094/1492] md:aspect-[1512/865]">
            <Image
              src="/assets/images/shift-lab/shift-lab-banner-mobile.png"
              alt="Banner de Shift Lab — innovación e IA aplicada a comunicación"
              fill
              sizes="(max-width: 768px) 100vw, 1380px"
              className="object-cover md:hidden"
              priority={false}
            />
            <Image
              src="/assets/images/shift-lab/shift-lab-banner-desktop.png"
              alt="Banner de Shift Lab — innovación e IA aplicada a comunicación"
              fill
              sizes="(max-width: 768px) 100vw, 1380px"
              className="hidden md:block object-cover"
              priority={false}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
