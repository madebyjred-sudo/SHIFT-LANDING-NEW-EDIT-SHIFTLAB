"use client";

import { motion } from "framer-motion";

const PARTNERS = [
  "/assets/images/partnership/HubSpot_partner-badge-color-601x594-c6f7719.webp",
  "/assets/images/partnership/MBP-Badge-Dark-backgrounds@4x.png",
  "/assets/images/partnership/Meltwater-logo1.png",
  "/assets/images/partnership/Metricool_Logo.jpg",
  "/assets/images/partnership/camaraCR.png",
  "/assets/images/partnership/camaraSV.png",
  "/assets/images/partnership/klear_logo.png",
  "/assets/images/partnership/konekti_media_logo.jpeg",
  "/assets/images/partnership/logo-logan.svg",
  "/assets/images/partnership/logo_tru.png",
  "/assets/images/partnership/mediam_group_logo.jpeg",
  "/assets/images/partnership/sellopymeCR.avif",
];

export default function PartnershipMarquee() {
  return (
    <div className="relative flex overflow-hidden bg-white py-12 md:py-20 z-10">
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
        {[...PARTNERS, ...PARTNERS].map((src, index) => (
          <div key={index} className="flex-shrink-0 h-12 md:h-16 flex items-center justify-center">
            {/* mix-blend-multiply naturally removes white backgrounds and leaves the dark parts.
                grayscale makes colorful logos gray. opacity-70 makes them elegant dark-gray. */}
            <img 
              src={src} 
              alt="Partner logo" 
              className="max-h-full w-auto max-w-[140px] md:max-w-[200px] object-contain opacity-60 grayscale mix-blend-multiply hover:opacity-100 hover:grayscale-0 transition-all duration-500 cursor-pointer"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
