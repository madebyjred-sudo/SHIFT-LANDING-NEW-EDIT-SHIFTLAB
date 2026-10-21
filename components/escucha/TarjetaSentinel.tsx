"use client";

import { motion } from "framer-motion";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { SENTINEL_REAL } from "@/lib/escucha/datos-reales";

/* Tarjeta hermana de la de Eco (ShiftLabEcoCard), en el sistema de Sentinel:
 * tinta casi negra, morado #4A1D6E, lila #C59AF0, IBM Plex. Misma anatomía
 * (barra de meta, pitch a la izquierda, señal a la derecha) para que las dos
 * se lean como familia. La señal NO es simulación: son las menciones curadas
 * por fuente que Sentinel midió (datos-reales.ts). */

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500"], display: "swap" });

const NOMBRES: Record<string, string> = {
  tiktok: "TikTok",
  twitter: "X",
  facebook: "Facebook",
  news: "Noticias",
  instagram: "Instagram",
  reddit: "Reddit",
  blog: "Blogs",
  youtube: "YouTube",
  radio: "Radio",
};

const nf = new Intl.NumberFormat("es");

export default function TarjetaSentinel({ href = "/shift-lab/escucha-digital", cta = "Pruébalo gratis" }: { href?: string; cta?: string }) {
  const fuentes = Object.entries(SENTINEL_REAL.porFuente)
    .filter(([k]) => NOMBRES[k])
    .sort((a, b) => b[1] - a[1]);
  const max = fuentes[0][1];
  return (
    <div
      className={`${plex.className} group relative h-full overflow-hidden rounded-[26px] border border-white/10 bg-[#0B0A10] text-[#ECECE8] shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)] transition-transform duration-500 hover:-translate-y-[3px]`}
    >
      <div className={`${plexMono.className} flex items-center justify-between gap-3 border-b border-white/10 px-6 py-[15px] text-[11px] uppercase tracking-[0.11em] md:px-8`}>
        <span className="font-medium text-[#C59AF0]">Escucha digital y de medios</span>
        <span className="normal-case tracking-[0.03em] text-white/40">sentinel by shift</span>
      </div>

      <div className="grid md:grid-cols-[1.02fr_0.98fr]">
        <div className="relative flex flex-col gap-5 overflow-hidden p-7 md:p-10">
          {/* Motivo: el barrido de escucha, líneas que llegan al centro */}
          <svg className="pointer-events-none absolute -bottom-24 -right-24 h-[320px] w-[320px] opacity-[0.16]" viewBox="0 0 200 200" aria-hidden="true">
            {[90, 70, 50, 30].map((r, i) => (
              <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="#C59AF0" strokeWidth="1.2" strokeDasharray={i % 2 ? "2 5" : "0"} />
            ))}
            <motion.line x1="100" y1="100" x2="100" y2="10" stroke="#C59AF0" strokeWidth="2" style={{ originX: "100px", originY: "100px" }} animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
          </svg>

          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-bold tracking-[0.28em] text-[#C59AF0]">SENTINEL</span>
            <span className="text-[12px] text-white/45">by Shift</span>
          </div>
          <h3 className="text-[34px] font-semibold leading-[1.05] tracking-[-0.01em] md:text-[42px]">
            La escucha que separa <span className="text-[#C59AF0]">tu marca</span> del ruido.
          </h3>
          <p className="max-w-md text-[15px] leading-[1.65] text-white/70">
            Redes, medios, radio y tus propios canales en un solo lugar. Cada mención pasa por una compuerta que decide si de verdad habla de ti, y lo que importa te llega como alerta en el momento.
          </p>
          <a
            href={href}
            className="mt-1 inline-flex w-fit items-center gap-2 rounded-[14px] bg-[#4A1D6E] px-6 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(197,154,240,0.55)] transition hover:bg-[#5c2589]"
          >
            {cta}
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </a>
          <p className="text-[12px] text-white/40">Sentinel · escucha social, de medios y de canales propios, pensada para LATAM</p>
        </div>

        <div className="border-t border-white/10 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(74,29,110,0.35),transparent_60%)] p-7 md:border-l md:border-t-0 md:p-10">
          <p className={`${plexMono.className} mb-5 text-[11px] uppercase tracking-[0.11em] text-white/45`}>Menciones por fuente</p>
          <ul className="space-y-3">
            {fuentes.map(([k, n], i) => (
              <li key={k} className="grid grid-cols-[84px_1fr_52px] items-center gap-3 text-[13px]">
                <span className="text-white/80">{NOMBRES[k]}</span>
                <span className="h-[7px] rounded-full bg-white/[0.07]">
                  <motion.span
                    className="block h-[7px] rounded-full"
                    style={{ background: k === "radio" || k === "news" ? "#E0670F" : "#C59AF0" }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(n / max) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
                <span className="text-right tabular-nums text-white/75">{nf.format(n)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[12px] leading-relaxed text-white/45">
            Medido por Sentinel: {nf.format(SENTINEL_REAL.menciones)} menciones que pasaron la compuerta de pertinencia desde {SENTINEL_REAL.desde}, en {SENTINEL_REAL.marcas} marcas de la región.
          </p>
        </div>
      </div>
    </div>
  );
}
