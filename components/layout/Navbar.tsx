"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { GlowMenu, type GlowMenuItem } from "@/components/ui/glow-menu";

const menuItems: GlowMenuItem[] = [
  { label: "Inicio", href: "/" },
  // En mobile escondemos Nosotros + Servicios + Premios + Shift LAB
  // porque el pill no entra en 375px. Quedan visibles: Inicio +
  // Contacto + "+". Los ocultos se acceden desde el dropdown del "+".
  { label: "Nosotros", href: "/about-us", hideOnMobile: true },
  { label: "Servicios", href: "/services", hideOnMobile: true },
  { label: "Premios", href: "/awards", hideOnMobile: true },
  { label: "Contacto", href: "/contact" },
  // Shift LAB sale del dropdown a un slot propio — wordmark con color
  // split (Shift en blanco/azul / LAB magenta) + halo magenta always-on
  // para destacarlo como sub-marca premium.
  {
    label: "Shift LAB",
    href: "/shift-lab",
    highlight: true,
    hideOnMobile: true,
  },
  {
    label: "Más",
    href: "#",
    iconTrigger: true,
    dropdown: [
      // Estos 4 se muestran SIEMPRE en el dropdown — son redundantes en
      // desktop (también están en el bar principal) pero garantizan
      // acceso desde mobile donde no caben arriba.
      { label: "Nosotros", href: "/about-us" },
      { label: "Servicios", href: "/services" },
      { label: "Premios", href: "/awards" },
      { label: "Shift LAB", href: "/shift-lab" },
      { label: "Shifting Culture®", href: "/shifting-culture" },
      { label: "Propósito", href: "/purpose" },
    ],
  },
];

/**
 * Detects whether the nav is currently sitting over a light background or
 * a dark one (video / hero gradient). Returns "light" | "dark".
 *
 * Sampling: probes elementsFromPoint just below the nav at 3 x-positions,
 * walks the z-stack and classifies the first painted element it finds.
 */
function useOverlayTone(navRef: React.RefObject<HTMLDivElement | null>): "light" | "dark" {
  const [tone, setTone] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isLightColor = (rgb: string): boolean | null => {
      const m = rgb.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
      const [r, g, b, a = 1] = parts;
      if (a < 0.05) return null;
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return lum > 0.55;
    };

    const classifyPoint = (x: number, y: number): boolean => {
      const stack = document.elementsFromPoint(x, y) || [];
      const nav = navRef.current;
      for (const el of stack) {
        if (nav && nav.contains(el)) continue;
        if (el.tagName === "VIDEO" || el.tagName === "IMG") return false;
        const cs = getComputedStyle(el);
        const light = isLightColor(cs.backgroundColor);
        if (light !== null) return light;
        if (cs.backgroundImage && cs.backgroundImage !== "none") {
          const rgbMatch = cs.backgroundImage.match(/rgba?\(([^)]+)\)/);
          if (rgbMatch) {
            const l = isLightColor(`rgb(${rgbMatch[1]})`);
            if (l !== null) return l;
          }
          const hexMatch = cs.backgroundImage.match(/#([0-9a-fA-F]{6})/);
          if (hexMatch) {
            const v = parseInt(hexMatch[1], 16);
            const r = (v >> 16) & 255;
            const g = (v >> 8) & 255;
            const b = v & 255;
            return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
          }
          return false; // image → assume dark hero
        }
      }
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      const fallback = isLightColor(bodyBg);
      return fallback ?? true;
    };

    const probe = () => {
      const nav = navRef.current;
      if (!nav) return;
      const rect = nav.getBoundingClientRect();
      const y = rect.bottom + 14;
      const samples = [
        rect.left + rect.width * 0.5,
        rect.left + 24,
        rect.right - 24,
      ];
      let lightVotes = 0;
      for (const x of samples) if (classifyPoint(x, y)) lightVotes++;
      setTone(lightVotes >= 2 ? "light" : "dark");
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        probe();
        ticking = false;
      });
    };

    // initial passes (catch late-loaded video and hydration)
    const t1 = window.setTimeout(probe, 60);
    const t2 = window.setTimeout(probe, 400);
    const t3 = window.setTimeout(probe, 1200);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [navRef]);

  return tone;
}

export default function Navbar() {
  const pathname = usePathname();
  const navRef = useRef<HTMLDivElement | null>(null);
  const tone = useOverlayTone(navRef);

  // The original Navbar locked body scroll when mobile menu was open.
  // With the floating glow nav we no longer need a fullscreen overlay,
  // but keep the scroll-restore on route change just in case.
  useEffect(() => {
    document.body.style.overflow = "";
  }, [pathname]);

  return (
    <div
      ref={navRef}
      className="pointer-events-none fixed left-0 right-0 top-4 z-50 flex justify-center px-4 sm:px-6"
    >
      <div className="pointer-events-auto inline-flex items-center gap-3 sm:gap-4">
        <Link
          href="/"
          aria-label="Shift Latam — inicio"
          className="flex flex-shrink-0 items-center px-1 sm:px-2"
        >
          <Image
            src="/assets/svg/nav-logo.svg"
            alt="Shift Latam"
            width={290}
            height={118}
            priority
            className={`h-7 w-auto sm:h-8 transition-[filter] duration-500 ease-out ${
              tone === "dark" ? "[filter:brightness(0)_invert(1)]" : ""
            }`}
          />
        </Link>
        <GlowMenu items={menuItems} pathname={pathname} tone={tone} />
      </div>
    </div>
  );
}
