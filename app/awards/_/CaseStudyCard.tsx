"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

type CaseStudy = {
  id: string;
  youtubeId: string;
  title: string;
  client: string;
  summary: string;
  awardSvg: string;
  awardYear?: string;
};

type CaseStudyCardProps = {
  caseStudy: CaseStudy;
  isActive?: boolean;
};

export default function CaseStudyCard({ caseStudy, isActive = false }: CaseStudyCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [manualPlay, setManualPlay] = useState(false);

  // Use YouTube's maxresdefault for high-quality thumbnail
  const thumbnailUrl = `https://img.youtube.com/vi/${caseStudy.youtubeId}/maxresdefault.jpg`;

  const shouldPlay = isActive || manualPlay;

  if (shouldPlay) {
    return (
      <div 
        className="w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${caseStudy.youtubeId}?autoplay=1&mute=1&rel=0&controls=1`}
          title={caseStudy.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
        {/* Hover Info Overlay (Pointer events none so user can still pause the video) */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 flex flex-col justify-end p-6 md:p-8 pointer-events-none"
            >
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div
                  className="w-8 h-8 bg-white"
                  style={{
                    WebkitMaskImage: `url('${caseStudy.awardSvg}')`,
                    maskImage: `url('${caseStudy.awardSvg}')`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }}
                />
                {caseStudy.awardYear && (
                  <span className="text-white/80 font-mono text-sm font-bold tracking-widest">{caseStudy.awardYear}</span>
                )}
              </div>
              <span className="text-[#F540FF] text-xs font-bold uppercase tracking-widest mb-1">{caseStudy.client}</span>
              <h3 className="text-white text-xl md:text-2xl font-bold mb-2 leading-tight">{caseStudy.title}</h3>
              <p className="text-slate-300 text-sm md:text-base line-clamp-2 max-w-2xl leading-relaxed">
                {caseStudy.summary}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 cursor-pointer shadow-lg group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setManualPlay(true)}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${thumbnailUrl}')` }}
      />
      
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80" />

      {/* Play Button Icon (Center) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 group-hover:opacity-0">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white shadow-xl ring-1 ring-white/30">
          <Play className="w-6 h-6 ml-1" fill="currentColor" />
        </div>
      </div>

      {/* Hover Info Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 flex flex-col justify-end p-6 md:p-8 pointer-events-none"
          >
            {/* Top Award Badge */}
            <div className="absolute top-6 left-6 flex items-center gap-3">
              <div
                className="w-8 h-8 bg-white"
                style={{
                  WebkitMaskImage: `url('${caseStudy.awardSvg}')`,
                  maskImage: `url('${caseStudy.awardSvg}')`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
              {caseStudy.awardYear && (
                <span className="text-white/80 font-mono text-sm font-bold tracking-widest">{caseStudy.awardYear}</span>
              )}
            </div>

            <span className="text-[#F540FF] text-xs font-bold uppercase tracking-widest mb-1">{caseStudy.client}</span>
            <h3 className="text-white text-xl md:text-2xl font-bold mb-2 leading-tight">{caseStudy.title}</h3>
            <p className="text-slate-300 text-sm md:text-base line-clamp-2 max-w-2xl leading-relaxed">
              {caseStudy.summary}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
