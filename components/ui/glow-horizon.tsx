"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const DURATION = 2.2;

export type GlowHorizonVariant = "top" | "bottom" | "left" | "right";
export type GlowHorizonTheme = "dark" | "light";

const VARIANTS: Record<GlowHorizonVariant, {
  axis: "x" | "y";
  scaleAxis: "scaleX" | "scaleY";
  enterPct: string;
  restPct: string;
}> = {
  top:    { axis: "y", scaleAxis: "scaleY", enterPct: "-100%", restPct: "-55%" },
  bottom: { axis: "y", scaleAxis: "scaleY", enterPct:  "100%", restPct:  "55%" },
  left:   { axis: "x", scaleAxis: "scaleX", enterPct:  "100%", restPct:  "55%" },
  right:  { axis: "x", scaleAxis: "scaleX", enterPct: "-100%", restPct: "-55%" },
};

export interface GlowHorizonProps {
  className?: string;
  variant?: GlowHorizonVariant;
  theme?: GlowHorizonTheme;
}

export default function GlowHorizonFM({
  className,
  variant = "top",
  theme = "dark",
}: GlowHorizonProps) {
  const { axis, scaleAxis, enterPct, restPct } = VARIANTS[variant];

  return (
    <motion.div
      className={"absolute w-full h-full " + (className ?? "")}
      style={{ isolation: "isolate" }}
      initial={{ [axis]: enterPct, [scaleAxis]: 1.5, opacity: 0, filter: "blur(15px)" }}
      animate={{ [axis]: restPct, [scaleAxis]: 1, opacity: 1, filter: "blur(0px)" }}
      transition={{ duration: DURATION, ease: EASE }}
    >
      {theme === "dark" ? <DarkArcs variant={variant} /> : <LightArcs variant={variant} />}
    </motion.div>
  );
}

function DarkArcs({ variant }: { variant: GlowHorizonVariant }) {
  return (
    <>
      <ArcFill variant={variant} color="rgba(255,255,255,0.95)" size="132%" boxShadow="0px -4px 23px 0px rgba(255,255,255,0.7)" delay={1.2} />
      <ArcFill variant={variant} color="rgba(165,88,251,0.8)" size="120%" blur={31} delay={0.6} initialOffset="10%" />
      <ArcFill variant={variant} color="rgba(73,34,229,0.75)" size="124%" blur={21} delay={0} initialOffset="10%" />
      <ArcFill variant={variant} color="rgba(0,0,0,0.9)" size="120%" blur={51} delay={0} initialOffset="10%" />
    </>
  );
}

function LightArcs({ variant }: { variant: GlowHorizonVariant }) {
  // Tema claro: trazos difuminados, predominio azul electric, magenta solo como acento.
  return (
    <>
      {/* Línea principal del horizonte: ink difuminado con halo eléctrico */}
      <ArcStroke
        variant={variant}
        color="rgba(14,23,69,0.65)"
        size="132%"
        width={2}
        blur={6}
        boxShadow="0px -2px 24px 0px rgba(21,52,220,0.28), 0px -1px 10px 0px rgba(14,23,69,0.14)"
        delay={1.2}
      />
      {/* Acento magenta sutil */}
      <ArcStroke variant={variant} color="rgba(245,64,255,0.28)" size="128%" width={8} blur={24} delay={0.6} initialOffset="10%" />
      {/* Halo eléctrico principal */}
      <ArcStroke variant={variant} color="rgba(21,52,220,0.48)" size="124%" width={14} blur={26} delay={0.2} initialOffset="10%" />
      {/* Núcleo eléctrico nítido */}
      <ArcStroke variant={variant} color="rgba(21,52,220,0.38)" size="122%" width={3.5} blur={7} delay={0.4} initialOffset="8%" />
      {/* Sombra de profundidad ink difusa */}
      <ArcStroke variant={variant} color="rgba(14,23,69,0.10)" size="140%" width={28} blur={58} delay={0} initialOffset="14%" />
    </>
  );
}

function ArcFill({
  variant,
  color,
  size,
  initialOffset,
  blur,
  boxShadow,
  delay,
}: {
  variant: GlowHorizonVariant;
  color: string;
  size: string;
  initialOffset?: string;
  blur?: number;
  boxShadow?: string;
  delay: number;
}) {
  const scale = parseFloat(size) / 100;
  const { axis, enterPct } = VARIANTS[variant];
  const sign = enterPct.startsWith("-") ? -1 : 1;
  const startPct = initialOffset
    ? `${sign * Math.abs(parseFloat(initialOffset) - 50)}%`
    : undefined;

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 rounded-[100%]"
      style={{
        scale,
        background: color,
        ...(blur !== undefined && { filter: `blur(${blur}px)` }),
        ...(boxShadow && { boxShadow }),
      }}
      initial={startPct ? { [axis]: startPct } : false}
      animate={startPct ? { [axis]: 0 } : undefined}
      transition={{ duration: DURATION, ease: EASE, delay }}
    />
  );
}

function ArcStroke({
  variant,
  color,
  size,
  width,
  initialOffset,
  blur,
  boxShadow,
  delay,
}: {
  variant: GlowHorizonVariant;
  color: string;
  size: string;
  width: number;
  initialOffset?: string;
  blur?: number;
  boxShadow?: string;
  delay: number;
}) {
  const scale = parseFloat(size) / 100;
  const { axis, enterPct } = VARIANTS[variant];
  const sign = enterPct.startsWith("-") ? -1 : 1;
  const startPct = initialOffset
    ? `${sign * Math.abs(parseFloat(initialOffset) - 50)}%`
    : undefined;

  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 rounded-[100%]"
      style={{
        scale,
        background: "transparent",
        border: `${width}px solid ${color}`,
        ...(blur !== undefined && { filter: `blur(${blur}px)` }),
        ...(boxShadow && { boxShadow }),
      }}
      initial={startPct ? { [axis]: startPct } : false}
      animate={startPct ? { [axis]: 0 } : undefined}
      transition={{ duration: DURATION, ease: EASE, delay }}
    />
  );
}
