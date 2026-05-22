"use client";

import * as React from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

/**
 * Generic glow menu / pill nav with dropdown support.
 *
 * Visual model:
 *  - Floating pill with backdrop-blur glass
 *  - On hover: ambient radial glow behind the pill
 *  - Active / hovered item: soft magenta radial glow + magenta text
 *  - One item can declare `dropdown` to render a sub-menu below
 *  - `tone="dark"` (default): white text, dark glass — for use over hero/video
 *    `tone="light"`: brand-blue text, white glass — for use over light bg
 */

export type GlowMenuItem = {
  label: string;
  href: string;
  /** Hide on small screens (collapse for compact mobile bar) */
  hideOnMobile?: boolean;
  /** Sub-items shown in a dropdown beneath this item */
  dropdown?: GlowMenuItem[];
  /** Override label shown on the trigger (e.g. "Más" instead of repeating the item label) */
  triggerLabel?: string;
  /** Render the dropdown trigger as a compact circular "+" icon button
   *  instead of a text pill. The icon rotates 45° to become "×" on open. */
  iconTrigger?: boolean;
  /** Special treatment: render as a sub-brand lockup (Shift LAB style) with
   *  always-on magenta halo. The label itself becomes the wordmark with a
   *  color split (white/blue "Shift" + magenta "LAB"). */
  highlight?: boolean;
};

export type GlowMenuProps = {
  items: GlowMenuItem[];
  /** Pathname to derive active state. If omitted, no item is highlighted. */
  pathname?: string;
  /** Visual tone */
  tone?: "dark" | "light";
  className?: string;
};

const navGlowVariants: Variants = {
  initial: { opacity: 0 },
  hover: {
    opacity: 0.7,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

function normalize(p: string | undefined) {
  if (!p) return "/";
  return p.replace(/index\.html$/, "").replace(/\/+$/, "/") || "/";
}

function matchesHref(href: string, pathname: string | undefined) {
  if (!pathname) return false;
  const a = normalize(href);
  const c = normalize(pathname);
  if (a === "/") return c === "/";
  return c === a || c.startsWith(a);
}

function dropdownHasActive(items: GlowMenuItem[] | undefined, pathname: string | undefined) {
  return !!items?.some((it) => matchesHref(it.href, pathname));
}

export function GlowMenu({ items, pathname, tone = "dark", className }: GlowMenuProps) {
  const isLight = tone === "light";
  const navRef = React.useRef<HTMLElement | null>(null);

  return (
    <motion.nav
      aria-label="Navegación principal"
      initial="initial"
      whileHover="hover"
      ref={navRef}
      className={[
        // Apple-style Liquid Glass surface:
        //   • backdrop-filter chain: url() warp → blur → saturate boost
        //   • multi-layer inset shadows: top-edge highlight + bottom-edge depth
        //   • soft drop shadow grounding it on the page
        //   • specular highlight follows pointer (see <NavSpecular/>)
        // NOTE: no `overflow-hidden` here — the dropdown is positioned
        // absolutely OUTSIDE this element. Inner decorative spans bring
        // their own `rounded-full` so they clip cleanly to the pill.
        "relative isolate inline-flex items-center rounded-full p-1.5",
        "transition-[background-color,box-shadow] duration-500 ease-out",
        isLight
          ? "[background-color:rgba(255,255,255,0.55)] " +
            "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.85),inset_0_-1px_0_rgba(21,52,220,0.10),inset_0_0_0_0.5px_rgba(21,52,220,0.12),0_14px_40px_-12px_rgba(21,52,220,0.18)]"
          : "[background-color:rgba(255,255,255,0.08)] " +
            "[box-shadow:inset_0_1px_0_rgba(255,255,255,0.35),inset_0_-1px_0_rgba(0,0,0,0.20),inset_0_0_0_0.5px_rgba(255,255,255,0.10),0_14px_40px_-12px_rgba(0,0,0,0.45)]",
        // Backdrop filter chain — Safari prefix done via the style attr below for browsers
        // that need it; the Tailwind arbitrary value here covers Chrome/Edge/Firefox.
        "[backdrop-filter:url(#shift-liquid-warp)_blur(14px)_saturate(180%)_brightness(1.05)]",
        "[-webkit-backdrop-filter:url(#shift-liquid-warp)_blur(14px)_saturate(180%)_brightness(1.05)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Top "wet" highlight — light bending more at the apex of the curvature */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-full"
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(255,255,255,0.55), transparent 70%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 70%)",
        }}
      />

      {/* Pointer-following specular highlight — the moving "shine" */}
      <NavSpecular isLight={isLight} navRef={navRef} />

      {/* Ambient outer glow (visible on whole-nav hover) */}
      <motion.span
        aria-hidden
        variants={navGlowVariants}
        className="pointer-events-none absolute -inset-2 -z-10 rounded-full blur-md"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(245,64,255,0.25) 30%, rgba(21,52,220,0.25) 60%, rgba(245,64,255,0.25) 90%, transparent 100%)",
        }}
      />

      <ul className="relative z-10 flex items-center gap-0.5">
        {items.map((item) => {
          const isActive =
            matchesHref(item.href, pathname) ||
            (item.dropdown && dropdownHasActive(item.dropdown, pathname));

          if (item.dropdown && item.dropdown.length > 0) {
            return (
              <DropdownItem
                key={item.label}
                item={item}
                pathname={pathname}
                isActive={!!isActive}
                isLight={isLight}
              />
            );
          }

          if (item.highlight) {
            return (
              <HighlightItem
                key={item.label}
                item={item}
                isActive={!!isActive}
                isLight={isLight}
              />
            );
          }

          return (
            <li
              key={item.label}
              className={item.hideOnMobile ? "hidden sm:block" : ""}
            >
              <Link
                href={item.href}
                aria-current={
                  matchesHref(item.href, pathname) ? "page" : undefined
                }
                className={[
                  "group relative inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap [font-family:var(--font-figtree,inherit)] transition-colors duration-300",
                  isActive
                    ? "text-[#F540FF]"
                    : isLight
                      ? "text-[#1534DC] hover:text-[#F540FF]"
                      : "text-white/90 hover:text-[#F540FF]",
                ].join(" ")}
              >
                {/* Per-item glow halo — only shows when THIS item is
                    active or hovered. CSS group-hover scope keeps it
                    isolated to the link, regardless of parent nav state. */}
                <span
                  aria-hidden
                  className={[
                    "pointer-events-none absolute inset-0 -z-10 rounded-full",
                    "transition-[opacity,transform] duration-500 ease-out",
                    isActive
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
                  ].join(" ")}
                  style={{
                    background:
                      "radial-gradient(circle at center, rgba(245,64,255,0.30) 0%, rgba(245,64,255,0.12) 50%, rgba(245,64,255,0) 100%)",
                  }}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}

/**
 * HighlightItem — slot premium del nav.
 *
 * Mismo treatment tipográfico que el resto del nav (Figtree uppercase
 * 13px tracking-[0.04em]) pero con color split: "SHIFT" en el tono del
 * navbar (blanco/azul), "LAB" en magenta. Halo magenta always-on
 * respirando detrás para destacarlo como sub-marca.
 */
function HighlightItem({
  item,
  isActive,
  isLight,
}: {
  item: GlowMenuItem;
  isActive: boolean;
  isLight: boolean;
}) {
  return (
    <li className={item.hideOnMobile ? "hidden sm:block" : ""}>
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={[
          "group relative inline-flex items-center gap-[3px] rounded-full px-4 py-2.5",
          "text-[13px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap",
          "[font-family:var(--font-figtree,inherit)]",
        ].join(" ")}
      >
        {/* Halo always-on — magenta breathing aura. Es el signal de
            distinción visual sobre los items de texto plano. */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(245,64,255,0.38) 0%, rgba(245,64,255,0.14) 55%, rgba(245,64,255,0) 100%)",
          }}
          animate={{ opacity: isActive ? [0.85, 1, 0.85] : [0.55, 0.85, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Glow extra en hover — refuerzo */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 -z-10 rounded-full opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at center, rgba(245,64,255,0.55) 0%, rgba(245,64,255,0.18) 60%, rgba(245,64,255,0) 100%)",
          }}
        />

        <span
          className={
            isActive
              ? "text-[#F540FF]"
              : isLight
                ? "text-[#1534DC]"
                : "text-white/95"
          }
        >
          SHIFT
        </span>
        <span className="text-[#F540FF]">LAB</span>
      </Link>
    </li>
  );
}

function DropdownItem({
  item,
  pathname,
  isActive,
  isLight,
}: {
  item: GlowMenuItem;
  pathname: string | undefined;
  isActive: boolean;
  isLight: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  // sticky lives in a ref so synchronous reads (in mouseleave / keydown)
  // see the LATEST value — React state snapshots are stale across
  // closely-timed pointer events.
  const stickyRef = React.useRef(false);
  const leaveTimer = React.useRef<number | null>(null);
  const wrapRef = React.useRef<HTMLLIElement | null>(null);

  const openMenu = React.useCallback(() => setOpen(true), []);
  const closeMenu = React.useCallback(() => {
    setOpen(false);
    stickyRef.current = false;
  }, []);

  // Outside click + escape. Run BEFORE React's synthetic click via
  // mousedown capture phase so we can decide whether to close without
  // racing the click that just opened us.
  React.useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, closeMenu]);

  const handleEnter = () => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    if (!stickyRef.current) openMenu();
  };
  const handleLeave = () => {
    if (stickyRef.current) return;
    leaveTimer.current = window.setTimeout(() => closeMenu(), 220);
  };
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Cancel any pending hover-close so the click doesn't get reverted.
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
    if (stickyRef.current) {
      closeMenu();
    } else {
      openMenu();
      stickyRef.current = true;
    }
  };

  return (
    <li
      ref={wrapRef}
      className={`relative ${item.hideOnMobile ? "hidden sm:block" : ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {item.iconTrigger ? (
        /* Compact circular "+" trigger — solid brand-magenta CTA. Rotates
           45° → "×" on open. Sits at the END of the nav. The pill wraps
           it with `overflow-hidden` (needed for Liquid Glass backdrop),
           so we avoid any external halo / blur that would get clipped
           into a hard ring. The CTA reads via solid magenta + drop
           shadow alone. */
        <motion.button
          type="button"
          onClick={handleClick}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={item.label}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          className={[
            "group relative inline-flex h-9 w-9 items-center justify-center rounded-full cursor-pointer transition-[background-color,box-shadow] duration-300 ml-1",
            // Solid magenta in all states — slightly darker variant when open/active
            isActive || open
              ? "bg-[#D229E5] text-white shadow-[0_4px_14px_-2px_rgba(245,64,255,0.55)]"
              : "bg-[#F540FF] text-white hover:bg-[#FF5BFF] hover:shadow-[0_4px_14px_-2px_rgba(245,64,255,0.55)]",
          ].join(" ")}
        >
          {/* "+" icon — rotates 45° into "×" on open */}
          <motion.svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </motion.svg>
        </motion.button>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          aria-haspopup="menu"
          aria-expanded={open}
          className={[
            "group relative inline-flex items-center gap-1.5 rounded-full border-0 bg-transparent px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap cursor-pointer [font-family:var(--font-figtree,inherit)] transition-colors duration-300",
            isActive || open
              ? "text-[#F540FF]"
              : isLight
                ? "text-[#1534DC] hover:text-[#F540FF]"
                : "text-white/90 hover:text-[#F540FF]",
          ].join(" ")}
        >
          <span
            aria-hidden
            className={[
              "pointer-events-none absolute inset-0 -z-10 rounded-full",
              "transition-[opacity,transform] duration-500 ease-out",
              isActive || open
                ? "opacity-100 scale-100"
                : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100",
            ].join(" ")}
            style={{
              background:
                "radial-gradient(circle at center, rgba(245,64,255,0.30) 0%, rgba(245,64,255,0.12) 50%, rgba(245,64,255,0) 100%)",
            }}
          />
          <span>{item.triggerLabel ?? item.label}</span>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      <ul
        role="menu"
        aria-hidden={!open}
        // CSS-based open/close — more reliable than framer for this
        // specific case (sticky+hover state interactions were
        // confusing motion's `animate` prop diff).
        style={{
          opacity: open ? 1 : 0,
          transform: open
            ? "translateX(-50%) translateY(0) scale(1)"
            : "translateX(-50%) translateY(-6px) scale(0.96)",
          pointerEvents: open ? "auto" : "none",
          transition:
            "opacity 280ms cubic-bezier(0.4, 0, 0.2, 1), transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        className={[
          // Dropdown chrome — width-fit-content para que se ajuste al
          // item más largo + 1.5rem padding. Con sólo 2-3 entries
          // evitamos un min-w fijo que dejaba aire vacío a la derecha.
          "absolute left-1/2 top-[calc(100%+10px)] -translate-x-1/2 w-max flex flex-col list-none rounded-xl border p-1 backdrop-blur-xl",
          isLight
            ? "bg-white/95 border-[#1534DC]/12 shadow-[0_24px_60px_-12px_rgba(21,52,220,0.25)]"
            : "bg-[rgba(15,15,28,0.94)] border-white/12 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)]",
        ].join(" ")}
      >
        {/* Pointer triangle */}
        <span
          aria-hidden
          className={[
            "absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t",
            isLight
              ? "bg-white/95 border-[#1534DC]/12"
              : "bg-[rgba(15,15,28,0.92)] border-white/12",
          ].join(" ")}
        />
        {item.dropdown!.map((sub, idx) => {
          const subActive = matchesHref(sub.href, pathname);
          return (
            <motion.li
              key={sub.label}
              role="none"
              initial={false}
              animate={
                open
                  ? { opacity: 1, y: 0, transition: { delay: 0.05 + idx * 0.05 } }
                  : { opacity: 0, y: -4, transition: { duration: 0.15 } }
              }
            >
              <Link
                role="menuitem"
                href={sub.href}
                onClick={closeMenu}
                aria-current={subActive ? "page" : undefined}
                className={[
                  // Items compactos — px-3 py-2 da 28px de alto por
                  // item, en lugar de 43px. El dropdown deja de sentirse
                  // hueco con sólo 2 entries.
                  "block rounded-lg px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.04em] whitespace-nowrap [font-family:var(--font-figtree,inherit)] transition-colors duration-200",
                  subActive
                    ? "bg-[#F540FF]/15 text-[#F540FF]"
                    : isLight
                      ? "text-[#1534DC] hover:bg-[#F540FF]/10 hover:text-[#F540FF]"
                      : "text-white/85 hover:bg-[#F540FF]/15 hover:text-[#F540FF]",
                ].join(" ")}
              >
                {sub.label}
              </Link>
            </motion.li>
          );
        })}
      </ul>
    </li>
  );
}

GlowMenu.displayName = "GlowMenu";

/**
 * Pointer-following specular highlight. Tracks pointer position
 * relative to the nav element and renders a soft radial gradient at
 * that position. Brighter when pointer is inside or near the surface,
 * dim when the pointer is far away.
 *
 * This is the third piece of the Liquid Glass aesthetic: real glass
 * picks up moving highlights as the light source (or eye) moves.
 */
function NavSpecular({
  isLight,
  navRef,
}: {
  isLight: boolean;
  navRef: React.RefObject<HTMLElement | null>;
}) {
  const [p, setP] = React.useState({ x: 50, y: 50, near: false });

  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const margin = 80;
      const near =
        e.clientX >= rect.left - margin &&
        e.clientX <= rect.right + margin &&
        e.clientY >= rect.top - margin &&
        e.clientY <= rect.bottom + margin;
      if (!near) {
        setP((prev) => (prev.near ? { ...prev, near: false } : prev));
        return;
      }
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setP({ x, y, near: true });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [navRef]);

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-300"
      style={{
        opacity: p.near ? 0.85 : 0.35,
        background: `radial-gradient(140px 90px at ${p.x}% ${p.y}%, ${
          isLight
            ? "rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.3) 35%, transparent 70%"
            : "rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 35%, transparent 70%"
        })`,
        mixBlendMode: isLight ? "soft-light" : "screen",
      }}
    />
  );
}
