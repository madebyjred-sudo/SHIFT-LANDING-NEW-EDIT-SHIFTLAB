"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";

export type AwardCounts = {
  grandPrix?: number;
  gold?: number;
  silver?: number;
  bronze?: number;
};

type AwardCardProps = {
  name: string;
  svgPath: string;
  counts?: AwardCounts;
  customTexts?: string[];
};

export default function AwardCard({ name, svgPath, counts, customTexts }: AwardCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);

  const totalCount = customTexts 
    ? customTexts.length 
    : (counts?.grandPrix || 0) + (counts?.gold || 0) + (counts?.silver || 0) + (counts?.bronze || 0);

  useEffect(() => {
    const controls = animate(0, totalCount, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        setDisplayCount(Math.round(value));
      }
    });
    return () => controls.stop();
  }, [totalCount]);

  // Helper to render individual count with mask
  const renderCount = (count: number | undefined, colorClass: string, label: string) => {
    if (!count) return null;
    return (
      <div className="flex flex-col items-center justify-center gap-0.5">
        <div className="flex items-center gap-1">
          <span className="text-[13px] font-bold text-white leading-none font-[family-name:var(--font-figtree)]">{count}</span>
          <div
            className={`h-5 w-5 ${colorClass}`}
            style={{
              WebkitMaskImage: `url('${svgPath}')`,
              maskImage: `url('${svgPath}')`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
        </div>
        <span className="text-[9px] uppercase tracking-wider text-white/70 leading-none font-[family-name:var(--font-figtree)]">{label}</span>
      </div>
    );
  };

  return (
    <div
      className="relative flex aspect-square w-full max-w-[150px] cursor-pointer items-center justify-center transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Default State: Icon with Superscript Counter */}
      <div className={`absolute inset-0 p-4 flex flex-col items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className="relative flex items-center justify-center mb-2 mt-1">
          {/* Main Logo */}
          <div
            className="w-14 h-14 bg-[#111A31]"
            style={{
              WebkitMaskImage: `url('${svgPath}')`,
              maskImage: `url('${svgPath}')`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          />
          {/* Superscript Counter */}
          <div className="absolute -top-1 -right-3">
            <span className="text-[13px] font-bold text-slate-500 font-[family-name:var(--font-figtree)] tabular-nums">
              {displayCount}
            </span>
          </div>
        </div>

        {/* Award Name */}
        <span className="text-[10px] uppercase font-bold text-slate-400 text-center leading-tight tracking-wider font-[family-name:var(--font-figtree)]">
          {name}
        </span>
      </div>

      {/* Hover State Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#111A31] p-3 shadow-xl overflow-hidden"
          >
            <span className="text-[10px] font-medium text-white/90 mb-3 text-center leading-tight font-[family-name:var(--font-figtree)] shrink-0">
              {name}
            </span>
            
            {customTexts ? (
              <div className="flex w-full flex-col items-start justify-start gap-y-1.5 overflow-y-auto max-h-[90px] scrollbar-hide px-1">
                {customTexts.map((text, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 bg-[#F59E0B] shrink-0"
                      style={{
                        WebkitMaskImage: `url('${svgPath}')`,
                        maskImage: `url('${svgPath}')`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                      }}
                    />
                    <span className="text-[7.5px] text-left text-white/90 leading-[1.1] font-[family-name:var(--font-figtree)]">
                      {text}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-3">
                {renderCount(counts?.grandPrix, "bg-purple-400", "GP")}
                {renderCount(counts?.gold, "bg-[#F59E0B]", "Oro")}
                {renderCount(counts?.silver, "bg-[#CBD5E1]", "Plata")}
                {renderCount(counts?.bronze, "bg-[#D97706]", "Bronce")}
              </div>
            )}

            {/* Show name if no counts exist (fallback) */}
            {!customTexts && !counts?.grandPrix && !counts?.gold && !counts?.silver && !counts?.bronze && (
              <span className="text-center text-xs font-medium text-white/50 mt-2 font-[family-name:var(--font-figtree)]">Próximamente</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
