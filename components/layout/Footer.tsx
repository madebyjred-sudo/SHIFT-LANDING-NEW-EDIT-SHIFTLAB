"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import {
  AnimatedContainer,
  FooterSection,
} from "@/components/ui/footer-section";

// -------------------------------------------------------------------
// Country list (timezone + Unsplash hover image)
// -------------------------------------------------------------------
const UNSPLASH = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1800&auto=format&fit=crop&q=80`;

type Country = {
  name: string;
  timeZone: string;
  /** Unsplash photo URL shown as a faint overlay on hover */
  img: string;
};

const COUNTRIES: Country[] = [
  { name: "Costa Rica",      timeZone: "America/Costa_Rica",    img: UNSPLASH("1552727131-5fc6af16796d") },
  { name: "Panamá",          timeZone: "America/Panama",        img: UNSPLASH("1632505702897-cc41b0ba3b64") },
  { name: "Nicaragua",       timeZone: "America/Managua",       img: UNSPLASH("1711609065017-749841408b17") },
  { name: "México",          timeZone: "America/Mexico_City",   img: UNSPLASH("1630646188133-c1db51adad97") },
  { name: "Chile",           timeZone: "America/Santiago",      img: UNSPLASH("1558517286-6b7b81953cb5") },
  { name: "Colombia",        timeZone: "America/Bogota",        img: UNSPLASH("1714686495394-73e2bb1bbd39") },
  { name: "Ecuador",         timeZone: "America/Guayaquil",     img: UNSPLASH("1706957614198-8d2e5f0ed6ea") },
  { name: "El Salvador",     timeZone: "America/El_Salvador",   img: UNSPLASH("1690384451505-2aef8ae1b0ef") },
  { name: "Guatemala",       timeZone: "America/Guatemala",     img: UNSPLASH("1669025467363-ace9bad030dc") },
  { name: "Honduras",        timeZone: "America/Tegucigalpa",   img: UNSPLASH("1625106497878-0dee231cd4e6") },
  { name: "Perú",            timeZone: "America/Lima",          img: UNSPLASH("1664515891137-19f371eb9f05") },
  { name: "Rep. Dominicana", timeZone: "America/Santo_Domingo", img: UNSPLASH("1741318102788-34a3b1a79513") },
];

// -------------------------------------------------------------------
// Clock helpers
// -------------------------------------------------------------------
type ClockParts = { hour: number; minute: number; second: number; label: string };

function getClockParts(date: Date, timeZone: string): ClockParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) =>
    Number(parts.find((p) => p.type === t)?.value ?? "0");
  const hour = get("hour");
  const minute = get("minute");
  const second = get("second");
  const label = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  return { hour, minute, second, label };
}

function CountryClock({
  country,
  onEnter,
  onLeave,
}: {
  country: Country;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const clock = useMemo(
    () => (now ? getClockParts(now, country.timeZone) : null),
    [now, country.timeZone],
  );

  const hourAngle = clock ? (clock.hour % 12) * 30 + clock.minute * 0.5 : 0;
  const minuteAngle = clock ? clock.minute * 6 + clock.second * 0.1 : 0;

  return (
    <li
      className="flex items-center gap-2.5 text-white/55 text-sm transition-colors duration-300 hover:text-white"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <svg
        viewBox="0 0 40 40"
        className="h-[22px] w-[22px] flex-shrink-0"
        aria-hidden
        focusable="false"
      >
        <circle
          cx="20"
          cy="20"
          r="18.5"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.6"
        />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="11"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.6"
          className="origin-center transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${hourAngle}deg)`, transformOrigin: "20px 20px" }}
        />
        <line
          x1="20"
          y1="20"
          x2="20"
          y2="7"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.1"
          className="origin-center transition-transform duration-1000 ease-out"
          style={{ transform: `rotate(${minuteAngle}deg)`, transformOrigin: "20px 20px" }}
        />
      </svg>
      <div className="flex min-w-0 flex-col leading-tight">
        <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis [font-family:var(--font-figtree,inherit)]">
          {country.name}
        </span>
        <span className="text-[11px] text-white/35 tabular-nums tracking-[0.04em] [font-family:var(--font-figtree,inherit)]">
          {clock?.label ?? "--:--"}
        </span>
      </div>
    </li>
  );
}

// -------------------------------------------------------------------
// Footer
// -------------------------------------------------------------------
export default function Footer() {
  const [hoverImg, setHoverImg] = useState<string | null>(null);
  const leaveTimer = useRef<number | null>(null);

  // Pre-load all country images so first hover is instant. We use
  // `document.createElement` rather than `new window.Image()` because
  // Next.js's Turbopack rewrites `Image` references and the constructor
  // call can fail in client bundles.
  useEffect(() => {
    if (typeof window === "undefined") return;
    COUNTRIES.forEach((c) => {
      const img = document.createElement("img");
      img.src = c.img;
    });
  }, []);

  const handleEnter = (url: string) => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    setHoverImg(url);
  };
  const handleLeave = () => {
    leaveTimer.current = window.setTimeout(() => setHoverImg(null), 80);
  };

  return (
    <FooterSection>
      {/* Unsplash hover overlay — masked by footer's rounded shape via parent overflow-hidden */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat saturate-[0.9] transition-opacity duration-700 ease-out"
        style={{
          backgroundImage: hoverImg ? `url('${hoverImg}')` : undefined,
          opacity: hoverImg ? 0.15 : 0,
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-[96rem] grid-cols-1 gap-12 xl:grid-cols-[5fr_7fr] xl:items-end xl:gap-16">
        {/* Brand column: big stroke logo + copyright */}
        <AnimatedContainer delay={0.1} className="flex flex-col gap-8">
          <div className="relative aspect-[762/309] w-full max-w-[440px]">
            <Image
              src="/assets/svg/footer/logo.svg"
              alt="Shift LATAM"
              fill
              sizes="(max-width: 768px) 90vw, 440px"
              className="object-contain object-left"
              priority={false}
            />
          </div>
          <p className="m-0 text-sm text-white/45 [font-family:var(--font-figtree,inherit)]">
            © {new Date().getFullYear()} Shift LATAM · Porter Novelli. All rights reserved.
          </p>
        </AnimatedContainer>

        {/* Hours grid */}
        <div>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-4 gap-y-6 p-0 md:grid-cols-4">
            {COUNTRIES.map((c, i) => (
              <AnimatedContainer key={c.name} delay={0.2 + i * 0.05}>
                <CountryClock
                  country={c}
                  onEnter={() => handleEnter(c.img)}
                  onLeave={handleLeave}
                />
              </AnimatedContainer>
            ))}
          </ul>
        </div>
      </div>
    </FooterSection>
  );
}
