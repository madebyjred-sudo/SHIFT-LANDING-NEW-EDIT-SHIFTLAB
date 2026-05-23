"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LabDotGrid } from "@/components/ui/lab-primitives";

/**
 * Shift LAB · Problem we solve — editorial closing statement.
 * Glitz headline, mono body, single clean CTA. No prompts or run-this.
 */
export default function ProblemWeSolveSection() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0E1745] py-28 md:py-40">
      <LabDotGrid opacity={0.28} />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[460px] w-[460px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(91,233,255,0.18), transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 md:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="max-w-5xl"
        >
          <p className="[font-family:var(--font-figtree)] text-[14px] md:text-[16px] uppercase tracking-[0.18em] text-white/55">
            El problema que resolvemos
          </p>

          <h2 className="mt-6 text-[44px] md:text-[72px] lg:text-[92px] leading-[0.98] [font-family:var(--font-glitz-local)] text-white">
            Convertimos la
            <br />
            <span className="text-[#F540FF]">tecnología</span> en{" "}
            <span className="text-[#5BE9FF]">valor</span>
            <br />
            estratégico real.
          </h2>

          <p className="mt-10 max-w-2xl [font-family:var(--font-fira-mono)] text-[14px] md:text-[15px] leading-[1.85] text-white/70">
            Eliminamos fricción y elevamos la capacidad analítica de las
            organizaciones. Diseñamos{" "}
            <span className="text-white">
              sistemas de criterio
            </span>{" "}
            donde la tecnología se integra al equipo humano y acelera el
            trabajo que ya hacen.
          </p>

          <div className="mt-12">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 rounded-full border border-[#F540FF]/40 bg-[#F540FF]/10 px-7 py-3.5 [font-family:var(--font-figtree)] text-[14px] font-semibold uppercase tracking-[0.08em] text-white transition-colors duration-300 hover:bg-[#F540FF]/20 hover:border-[#F540FF]/70"
            >
              <span>Hablemos con el lab</span>
              <span className="text-[#F540FF] transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
