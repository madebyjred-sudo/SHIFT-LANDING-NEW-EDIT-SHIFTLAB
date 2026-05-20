"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
// import Link from "next/link";
import SocialLinks from "../ui/SocialLinks";

// const TERMS_LABEL = "Terminos y condiciones - © 19XX - 2026";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/cacporternovelli/?locale=es_LA",
    icon: "/assets/svg/footer/facebook.svg",
    hoverIcon: "/assets/svg/footer/facebook-white.svg",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/shiftlatampn/",
    icon: "/assets/svg/footer/instagram.svg",
    hoverIcon: "/assets/svg/footer/instagram-white.svg",
  },
  {
    name: "LinkedIn",
    href: "https://cr.linkedin.com/company/shiftlatamporternovelli",
    icon: "/assets/svg/footer/linkedIn.svg",
    hoverIcon: "/assets/svg/footer/linkedIn-white.svg",
  },
];

const countries = [
  { name: "Costa Rica", timeZone: "America/Costa_Rica" },
  { name: "Panama", timeZone: "America/Panama" },
  { name: "Nicaragua", timeZone: "America/Managua" },
  { name: "Mexico", timeZone: "America/Mexico_City" },
  { name: "Chile", timeZone: "America/Santiago" },
  { name: "Colombia", timeZone: "America/Bogota" },
  { name: "Ecuador", timeZone: "America/Guayaquil" },
  { name: "El Salvador", timeZone: "America/El_Salvador" },
  { name: "Guatemala", timeZone: "America/Guatemala" },
  { name: "Honduras", timeZone: "America/Tegucigalpa" },
  { name: "Peru", timeZone: "America/Lima" },
  { name: "Republica Dominicana", timeZone: "America/Santo_Domingo" },
];

type ClockParts = {
  hour: number;
  minute: number;
  second: number;
  label: string;
};

const timeLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function getClockParts(date: Date, timeZone: string): ClockParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const second = Number(parts.find((part) => part.type === "second")?.value ?? "0");

  const dateInZone = new Date(date.toLocaleString("en-US", { timeZone }));
  const label = timeLabelFormatter.format(dateInZone);

  return { hour, minute, second, label };
}

function CountryClock({ country, timeZone, index }: { country: string; timeZone: string; index?: number }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, []);

  const clock = useMemo(
    () => (now ? getClockParts(now, timeZone) : null),
    [now, timeZone],
  );

  const minuteAngle = clock ? clock.minute * 6 + clock.second * 0.1 : 0;
  const hourAngle = clock ? (clock.hour % 12) * 30 + clock.minute * 0.5 : 0;

  return (
    <div className={`flex items-center gap-2 ${index === 0 ? "lg:ml-5" : ""}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-6 w-6 md:h-8 md:w-8"
        aria-hidden
        focusable="false"
      >
        <circle cx="20" cy="20" r="19.5" fill="none" stroke="#3F3F3F" />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="10"
          stroke="#3F3F3F"
          strokeLinecap="round"
          className="origin-center transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${hourAngle}deg)` }}
        />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="6.5"
          stroke="#3F3F3F"
          strokeLinecap="round"
          className="origin-center transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${minuteAngle}deg)` }}
        />
      </svg>
      <span className="whitespace-nowrap text-center leading-tight">
        {country}
      </span>
    </div>
  );
}


function BackToTopButton({ className }: { className: string }) {
  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      className={className}
      onClick={handleBackToTop}
    >
      <Image
        src="/assets/svg/footer/arrow-up.svg"
        alt="Icono flecha hacia arriba — volver al inicio"
        aria-hidden
        width={18}
        height={25}
        className="h-5 w-auto"
      />
    </button>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 bg-[#0A0A0A] text-white">
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 md:py-10 lg:px-14 lg:py-28">
        <div className="flex flex-col gap-8 md:gap-10 md:flex-row md:items-stretch md:justify-between">
          <div className="flex items-center my-2 justify-between md:hidden">
            <div className="flex items-center gap-2">
              <SocialLinks socialLinks={socialLinks} size="sm" />
            </div>

            <BackToTopButton className="flex h-11 w-11 items-center justify-center rounded-full border border-[#E7E8EE]" />
          </div>

          <div className="group relative aspect-[762/309] w-full max-w-[760px]">
            <Image
              src="/assets/svg/footer/logo.svg"
              alt="Shift"
              fill
              sizes="(max-width: 768px) 100vw, 760px"
              className="object-contain object-left [transform:translateZ(0)]"
              priority={false}
            />
            <Image
              src="/assets/svg/footer/logo-blue.svg"
              alt="Logotipo Shift Latam — variante azul al pasar el cursor"
              aria-hidden
              fill
              sizes="(max-width: 768px) 100vw, 760px"
              className="pointer-events-none object-contain object-left opacity-0 transition-opacity duration-100 group-hover:opacity-100 [transform:translateZ(0)]"
              priority={false}
            />
          </div>

          <div className="hidden shrink-0 flex-col items-start gap-7 md:flex md:min-h-[309px] md:items-end md:justify-between">
            <BackToTopButton className="flex h-16 w-16 items-center justify-center rounded-full border border-[#FFFFFF] transition-colors duration-100 hover:border-[#1534DC] hover:bg-[#1534DC]" />
            <p className="group relative h-9 text-[27px] font-semibold leading-none">
              <span className="absolute right-0 top-0 transition-opacity duration-100 group-hover:opacity-0">
                Hablemos!
              </span>
              <span className="absolute right-0 top-0 text-[#1534DC] opacity-0 transition-opacity duration-100 group-hover:opacity-100">
                hola@shiftlatam.com
              </span>
            </p>
            <div className="space-y-5 md:text-right">
              <div className="flex items-center gap-3 md:justify-end">
                <SocialLinks socialLinks={socialLinks} size="lg" />
              </div>

              {/* <p className="text-sm font-semibold text-[#3F3F3F]">
                <Link href="#" className="hover:text-white">
                  {TERMS_LABEL}
                </Link>
              </p> */}
            </div>
          </div>

          {/* <p className="text-center text-xs font-semibold text-[#E7E8EE] md:hidden">
            <Link href="#" className="hover:text-white">
              {TERMS_LABEL}
            </Link>{" "}
          </p> */}
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-4 gap-y-4 text-[#3F3F3F] md:mt-12 md:gap-x-18 md:gap-y-5 lg:gap-x-10">
          {countries.map((country, index) => (
            <li
              key={country.name}
              className="flex items-center justify-center text-base md:text-xl lg:text-2xl"
            >
              <CountryClock country={country.name} timeZone={country.timeZone} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
