"use client";

import { motion } from "framer-motion";

const PARTNERS = [
  { src: "/assets/images/partnership/HubSpot_partner-badge-color-601x594-c6f7719.webp", sizeClass: "h-20 md:h-28" },
  { src: "/assets/images/partnership/MBP-Badge-Dark-backgrounds@4x.png", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/Meltwater-logo1.png", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/Metricool_Logo.jpg", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/camaraCR.png", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/camaraSV.png", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/klear_logo.png", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/konekti_media_logo.jpeg", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/logo-logan.svg", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/logo_tru.png", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/mediam_group_logo.jpeg", sizeClass: "h-12 md:h-16" },
  { src: "/assets/images/partnership/sellopymeCR.avif", sizeClass: "h-20 md:h-28" },
];

export default function PartnershipMarquee() {
  return (
    <div className="relative overflow-hidden bg-white py-4 md:py-8 z-10">
      <div className="mx-auto w-full max-w-[1815px] px-10 md:px-16 lg:px-20">
        <h3 className="text-[#111A31] opacity-30 text-sm sm:text-base md:text-lg uppercase tracking-[0.15em] mb-6 md:mb-10 font-semibold [font-family:var(--font-figtree)]">
          Aliados
        </h3>
      </div>
      
      <div className="relative flex">
        {/* Gradients on the sides to blend seamlessly */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-white to-transparent z-10"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-white to-transparent z-10"></div>
        
        {/* Marquee Content */}
      <motion.div
        className="flex w-max items-center gap-16 md:gap-24 pr-16 md:pr-24"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 40,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {/* We duplicate the array to create a seamless loop */}
        {[...PARTNERS, ...PARTNERS].map((partner, index) => (
          <div key={index} className={`flex-shrink-0 ${partner.sizeClass} flex items-center justify-center`}>
            {/* mix-blend-multiply naturally removes white backgrounds and leaves the dark parts.
                grayscale makes colorful logos gray. opacity-70 makes them elegant dark-gray. */}
            <img 
              src={partner.src} 
              alt="Partner logo" 
              className="max-h-full w-auto max-w-[160px] md:max-w-[240px] object-contain opacity-60 grayscale mix-blend-multiply hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-pointer"
            />
          </div>
        ))}
      </motion.div>
      </div>
    </div>
  );
}
