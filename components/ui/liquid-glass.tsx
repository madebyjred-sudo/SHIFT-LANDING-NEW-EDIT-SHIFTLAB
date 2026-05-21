"use client";

import * as React from "react";

/**
 * Liquid Glass — Apple-style realistic glass effect.
 *
 * The aesthetic is built from FIVE layers that compose on top of each
 * other. None of them work alone:
 *
 *   1. **SVG `feDisplacementMap`** wired into `backdrop-filter: url(#…)`
 *      → this is what WARPS what's behind the surface, the way real
 *      glass refracts. Most "glassmorphism" stops at blur+saturate;
 *      this is the part that makes it feel ALIVE.
 *
 *   2. **Backdrop blur + saturate boost** → softens the warp into milk-
 *      glass and pushes color vibrancy back up after the blur kills it.
 *
 *   3. **Multi-layer inset shadows** → simulate the top-edge highlight
 *      (light reflecting off the upper rim) and the bottom-edge depth
 *      (occlusion under the curvature). Two of them.
 *
 *   4. **Specular highlight** → a soft radial gradient that follows the
 *      pointer. Mimics how real glass picks up the light source.
 *
 *   5. **Drop shadow** → grounds the element on its surface.
 *
 * The base component just renders the chrome. Its `children` sit inside
 * the glass surface. Use it like a `<div>`.
 */

export interface LiquidGlassProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual tone of the glass.
   *  - "dark": for use over dark/video backdrops (lighter overlay)
   *  - "light": for use over white/light backdrops (slightly darker overlay)
   */
  tone?: "dark" | "light";
  /** Shape — default is `rounded-full` (pill). */
  shape?: "pill" | "square";
  /** Disable the pointer-following specular highlight (perf / SSR safety). */
  noSpecular?: boolean;
  /** Border radius override when `shape="square"`. */
  radius?: string;
}

const LiquidGlass = React.forwardRef<HTMLDivElement, LiquidGlassProps>(
  function LiquidGlass(
    {
      className = "",
      children,
      tone = "dark",
      shape = "pill",
      noSpecular = false,
      radius,
      style,
      ...props
    },
    ref,
  ) {
    const innerRef = React.useRef<HTMLDivElement | null>(null);
    React.useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);
    const [pointer, setPointer] = React.useState<{ x: number; y: number; inside: boolean }>({
      x: 50,
      y: 50,
      inside: false,
    });

    React.useEffect(() => {
      if (noSpecular) return;
      const el = innerRef.current;
      if (!el) return;

      const onMove = (e: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        // Distance from pointer to nearest edge of the element.
        const inside =
          e.clientX >= rect.left - 60 &&
          e.clientX <= rect.right + 60 &&
          e.clientY >= rect.top - 60 &&
          e.clientY <= rect.bottom + 60;
        if (!inside) {
          setPointer((p) => (p.inside ? { ...p, inside: false } : p));
          return;
        }
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setPointer({ x, y, inside: true });
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    }, [noSpecular]);

    const isDark = tone === "dark";

    // Base background — translucent so the backdrop filter can warp through it.
    const baseBg = isDark
      ? "rgba(255,255,255,0.08)"
      : "rgba(255,255,255,0.55)";

    // Edge highlight + depth: inset shadows simulating refracted rim light.
    //   1) top-inner: bright light skimming the upper edge
    //   2) bottom-inner: subtle dark for the lower edge (under-curvature)
    //   3) outer: soft drop-shadow so the glass sits on a surface
    const boxShadow = isDark
      ? [
          "inset 0 1px 0 rgba(255,255,255,0.35)",
          "inset 0 -1px 0 rgba(0,0,0,0.20)",
          "inset 0 0 0 0.5px rgba(255,255,255,0.10)",
          "0 14px 40px -12px rgba(0,0,0,0.45)",
        ].join(", ")
      : [
          "inset 0 1px 0 rgba(255,255,255,0.85)",
          "inset 0 -1px 0 rgba(21,52,220,0.10)",
          "inset 0 0 0 0.5px rgba(21,52,220,0.12)",
          "0 14px 40px -12px rgba(21,52,220,0.18)",
        ].join(", ");

    const borderRadius = shape === "pill" ? "9999px" : (radius ?? "1.5rem");

    return (
      <div
        ref={innerRef}
        className={`relative isolate overflow-hidden ${className}`}
        style={{
          borderRadius,
          backgroundColor: baseBg,
          boxShadow,
          // Stack: SVG warp → blur → saturate. Order matters.
          backdropFilter:
            "url(#shift-liquid-warp) blur(14px) saturate(180%) brightness(1.05)",
          WebkitBackdropFilter:
            "url(#shift-liquid-warp) blur(14px) saturate(180%) brightness(1.05)",
          ...style,
        }}
        {...props}
      >
        {/* Specular highlight — a soft radial that follows the pointer.
            Subtle on idle, brighter when nearby. Mimics light catching the
            surface at the cursor's angle. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: pointer.inside ? 0.9 : 0.45,
            background: `radial-gradient(120px 80px at ${pointer.x}% ${pointer.y}%, ${
              isDark
                ? "rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 40%, transparent 70%"
                : "rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 40%, transparent 70%"
            })`,
            mixBlendMode: isDark ? "screen" : "soft-light",
          }}
        />

        {/* Subtle top-edge "wet" highlight — a brighter horizontal strip
            along the upper edge that emulates the light bending more at
            the apex of the curvature. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/3"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 70%)"
              : "linear-gradient(180deg, rgba(255,255,255,0.55), transparent 70%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    );
  },
);

LiquidGlass.displayName = "LiquidGlass";

/**
 * SVG filter that warps the backdrop the way real curved glass refracts
 * light. Mount this ONCE per page (e.g. in the root layout). All
 * `<LiquidGlass>` components reference `#shift-liquid-warp`.
 *
 * Why two filters?
 *  - `feTurbulence` generates organic noise (the "imperfections" in
 *    the glass).
 *  - `feDisplacementMap` uses that noise to physically offset the
 *    backdrop pixels — this is what creates the warp.
 *
 * `scale={40}` controls how much warping. Higher = more liquid feel.
 * Too high looks like wavy water. ~25-50 is the sweet spot for a UI
 * surface.
 */
export function LiquidGlassFilter({
  id = "shift-liquid-warp",
  scale = 36,
  baseFrequency = 0.008,
  numOctaves = 2,
  seed = 42,
}: {
  id?: string;
  scale?: number;
  baseFrequency?: number;
  numOctaves?: number;
  seed?: number;
}) {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={baseFrequency}
            numOctaves={numOctaves}
            seed={seed}
            result="turb"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turb"
            scale={scale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}

export { LiquidGlass };
