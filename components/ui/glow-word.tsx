"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const DURATION = 2;

export interface GlowWordProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlowWord({ children, className = "" }: GlowWordProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      {/* Arco elíptico que pasa detrás de la palabra, tema claro */}
      <motion.span
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          bottom: "-35%",
          width: "140%",
          height: "90%",
          borderRadius: "100%",
          border: "2px solid rgba(21,52,220,0.55)",
          filter: "blur(2px)",
          boxShadow: "0 -4px 22px rgba(21,52,220,0.30), 0 -2px 10px rgba(245,64,255,0.15)",
        }}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: DURATION, ease: EASE }}
      />
      <motion.span
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          bottom: "-45%",
          width: "160%",
          height: "110%",
          borderRadius: "100%",
          border: "8px solid rgba(21,52,220,0.22)",
          filter: "blur(10px)",
        }}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: DURATION, ease: EASE, delay: 0.15 }}
      />
      <motion.span
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          bottom: "-55%",
          width: "180%",
          height: "130%",
          borderRadius: "100%",
          border: "14px solid rgba(14,23,69,0.08)",
          filter: "blur(18px)",
        }}
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: DURATION, ease: EASE, delay: 0.05 }}
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}
