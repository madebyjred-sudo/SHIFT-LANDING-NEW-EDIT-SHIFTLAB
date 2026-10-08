"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LabDotGrid } from "@/components/ui/lab-primitives";
import AmericasGlobe from "@/components/ui/AmericasGlobe";

/**
 * Shift LAB · Problem we solve — editorial closing statement.
 * Glitz headline, mono body, single clean CTA. No prompts or run-this.
 */
/**
 * Los doce mercados de Shift. El globo de esta sección es decorativo —no captura
 * clics— pero muestra la red real, no puntos inventados.
 */
const MERCADOS = [
  { pais: "Costa Rica", lat: 9.93, lng: -84.09, activo: true },
  { pais: "El Salvador", lat: 13.69, lng: -89.19, activo: true },
  { pais: "Guatemala", lat: 14.63, lng: -90.51, activo: true },
  { pais: "Honduras", lat: 14.07, lng: -87.19, activo: true },
  { pais: "Nicaragua", lat: 12.11, lng: -86.24, activo: true },
  { pais: "Panamá", lat: 8.98, lng: -79.52, activo: true },
  { pais: "Colombia", lat: 4.71, lng: -74.07, activo: true },
  { pais: "Ecuador", lat: -0.18, lng: -78.47, activo: true },
  { pais: "Rep. Dominicana", lat: 18.49, lng: -69.93, activo: true },
  { pais: "Venezuela", lat: 10.48, lng: -66.9, activo: true },
  { pais: "Miami", lat: 25.72, lng: -80.27, activo: true },
];

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

      {/* Globo en picada: el eje va inclinado (segundo valor de `vista`) para
          mirarlo desde arriba, y gira solo. Decorativo — sin clics. La máscara
          lo desvanece antes del borde para que no se corte en recto. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[300px] top-1/2 z-0 hidden -translate-y-1/2 opacity-[0.65] md:block lg:-right-[150px]"
      >
        <AmericasGlobe
          mercados={MERCADOS}
          vista={[78, -42]}
          spin={0.045}
          size={1280}
          className="sl-globe-fade"
        />
      </div>

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

          <h2 className="mt-6 text-[44px] md:text-[72px] lg:text-[92px] leading-[0.98] [font-family:var(--font-zilla-slab)] font-bold text-white">
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
