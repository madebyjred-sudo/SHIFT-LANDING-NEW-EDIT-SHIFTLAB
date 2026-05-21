"use client";

import * as React from "react";
import Image from "next/image";

/**
 * SphereImageGrid — Interactive 3D image sphere.
 *
 * Adapted from the original `img-sphere` component:
 *  - Items keep the existing squircle mask (`rounded-[32px]`) instead of circles
 *  - No modal / lightbox — replaced with a hover label that reveals the name
 *  - Uses next/image for optimization
 *  - Pointer-controlled rotation (drag) + auto-rotate + momentum physics
 *  - Fibonacci sphere distribution for even coverage
 *  - Collision detection to prevent visual overlap
 *
 * Note: this component is intended for desktop only; the parent should
 * branch on viewport and render a fallback grid on mobile/tablet.
 */

// ==========================================
// TYPES
// ==========================================

export interface SphereImageItem {
  id: string;
  src: string;
  alt: string;
  /** Name shown on hover */
  name: string;
  /** Optional role / sub-label shown on hover */
  role?: string;
}

export interface SphereImageGridProps {
  images: SphereImageItem[];
  containerSize?: number;
  sphereRadius?: number;
  dragSensitivity?: number;
  momentumDecay?: number;
  maxRotationSpeed?: number;
  baseImageScale?: number;
  perspective?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  className?: string;
}

interface SphericalPosition {
  theta: number;
  phi: number;
  radius: number;
}
interface Position3D { x: number; y: number; z: number }
interface WorldPosition extends Position3D {
  scale: number;
  zIndex: number;
  isVisible: boolean;
  fadeOpacity: number;
  originalIndex: number;
}

// ==========================================
// MATH HELPERS
// ==========================================

const degToRad = (d: number) => d * (Math.PI / 180);
const normalizeAngle = (a: number) => {
  while (a > 180) a -= 360;
  while (a < -180) a += 360;
  return a;
};

// ==========================================
// COMPONENT
// ==========================================

export default function SphereImageGrid({
  images,
  containerSize = 600,
  sphereRadius = 240,
  dragSensitivity = 0.6,
  momentumDecay = 0.96,
  maxRotationSpeed = 6,
  baseImageScale = 0.18,
  perspective = 1000,
  autoRotate = true,
  autoRotateSpeed = 0.2,
  className = "",
}: SphereImageGridProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [rotation, setRotation] = React.useState({ x: 12, y: 12, z: 0 });
  const [velocity, setVelocity] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [imagePositions, setImagePositions] = React.useState<SphericalPosition[]>([]);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const lastPointer = React.useRef({ x: 0, y: 0 });
  const animationFrame = React.useRef<number | null>(null);

  const actualSphereRadius = sphereRadius || containerSize * 0.5;
  const baseImageSize = containerSize * baseImageScale;

  // ----------- POSITION GENERATION (Fibonacci) -----------
  const generateSpherePositions = React.useCallback((): SphericalPosition[] => {
    const positions: SphericalPosition[] = [];
    const imageCount = images.length;
    if (!imageCount) return positions;

    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    const angleIncrement = (2 * Math.PI) / goldenRatio;

    for (let i = 0; i < imageCount; i++) {
      const t = i / imageCount;
      const inclination = Math.acos(1 - 2 * t);
      const azimuth = angleIncrement * i;

      let phi = inclination * (180 / Math.PI);
      let theta = (azimuth * (180 / Math.PI)) % 360;

      // Stretch coverage a bit so we reach near the poles
      const poleBonus = Math.pow(Math.abs(phi - 90) / 90, 0.6) * 35;
      phi = phi < 90 ? Math.max(5, phi - poleBonus) : Math.min(175, phi + poleBonus);
      phi = 15 + (phi / 180) * 150;

      // Slight randomization to avoid perfect patterns
      const rndTheta = (Math.random() - 0.5) * 20;
      theta = (theta + rndTheta) % 360;
      phi = Math.max(0, Math.min(180, phi + (Math.random() - 0.5) * 10));

      positions.push({ theta, phi, radius: actualSphereRadius });
    }
    return positions;
  }, [images.length, actualSphereRadius]);

  // ----------- WORLD POSITION CALCULATION -----------
  const worldPositions: WorldPosition[] = React.useMemo(() => {
    const positions = imagePositions.map<WorldPosition>((pos, index) => {
      const thetaRad = degToRad(pos.theta);
      const phiRad = degToRad(pos.phi);
      const rotXRad = degToRad(rotation.x);
      const rotYRad = degToRad(rotation.y);

      let x = pos.radius * Math.sin(phiRad) * Math.cos(thetaRad);
      let y = pos.radius * Math.cos(phiRad);
      let z = pos.radius * Math.sin(phiRad) * Math.sin(thetaRad);

      const x1 = x * Math.cos(rotYRad) + z * Math.sin(rotYRad);
      const z1 = -x * Math.sin(rotYRad) + z * Math.cos(rotYRad);
      x = x1; z = z1;

      const y2 = y * Math.cos(rotXRad) - z * Math.sin(rotXRad);
      const z2 = y * Math.sin(rotXRad) + z * Math.cos(rotXRad);
      y = y2; z = z2;

      const fadeZoneStart = -10;
      const fadeZoneEnd = -30;
      const isVisible = z > fadeZoneEnd;
      let fadeOpacity = 1;
      if (z <= fadeZoneStart) {
        fadeOpacity = Math.max(0, (z - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd));
      }

      const isPoleImage = pos.phi < 30 || pos.phi > 150;
      const distanceFromCenter = Math.sqrt(x * x + y * y);
      const distanceRatio = Math.min(distanceFromCenter / actualSphereRadius, 1);
      const distancePenalty = isPoleImage ? 0.4 : 0.7;
      const centerScale = Math.max(0.3, 1 - distanceRatio * distancePenalty);
      const depthScale = (z + actualSphereRadius) / (2 * actualSphereRadius);
      const scale = centerScale * Math.max(0.5, 0.8 + depthScale * 0.3);

      return {
        x, y, z,
        scale,
        zIndex: Math.round(1000 + z),
        isVisible,
        fadeOpacity,
        originalIndex: index,
      };
    });

    // Collision detection — shrink overlapping items
    for (let i = 0; i < positions.length; i++) {
      const a = positions[i];
      if (!a.isVisible) continue;
      let adjustedScale = a.scale;
      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;
        const b = positions[j];
        if (!b.isVisible) continue;
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const sizeA = baseImageSize * adjustedScale;
        const sizeB = baseImageSize * b.scale;
        const minDistance = (sizeA + sizeB) / 2 + 24;
        if (distance < minDistance && distance > 0) {
          const overlap = minDistance - distance;
          const reduction = Math.max(0.4, 1 - (overlap / minDistance) * 0.6);
          adjustedScale = Math.min(adjustedScale, adjustedScale * reduction);
        }
      }
      positions[i] = { ...a, scale: Math.max(0.25, adjustedScale) };
    }

    return positions;
  }, [imagePositions, rotation, actualSphereRadius, baseImageSize]);

  // ----------- PHYSICS / MOMENTUM LOOP -----------
  const clampSpeed = React.useCallback(
    (s: number) => Math.max(-maxRotationSpeed, Math.min(maxRotationSpeed, s)),
    [maxRotationSpeed]
  );

  const updateMomentum = React.useCallback(() => {
    if (isDragging) return;
    setVelocity((prev) => {
      const next = { x: prev.x * momentumDecay, y: prev.y * momentumDecay };
      if (!autoRotate && Math.abs(next.x) < 0.01 && Math.abs(next.y) < 0.01) {
        return { x: 0, y: 0 };
      }
      return next;
    });
    setRotation((prev) => {
      let newY = prev.y;
      if (autoRotate) newY += autoRotateSpeed;
      newY += clampSpeed(velocity.y);
      return {
        x: normalizeAngle(prev.x + clampSpeed(velocity.x)),
        y: normalizeAngle(newY),
        z: prev.z,
      };
    });
  }, [isDragging, momentumDecay, velocity, clampSpeed, autoRotate, autoRotateSpeed]);

  // ----------- POINTER HANDLERS -----------
  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setVelocity({ x: 0, y: 0 });
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = React.useCallback((e: PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    const rDelta = { x: -dy * dragSensitivity, y: dx * dragSensitivity };
    setRotation((prev) => ({
      x: normalizeAngle(prev.x + clampSpeed(rDelta.x)),
      y: normalizeAngle(prev.y + clampSpeed(rDelta.y)),
      z: prev.z,
    }));
    setVelocity({ x: clampSpeed(rDelta.x), y: clampSpeed(rDelta.y) });
    lastPointer.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, dragSensitivity, clampSpeed]);

  const onPointerUp = React.useCallback(() => setIsDragging(false), []);

  // ----------- LIFECYCLE -----------
  React.useEffect(() => setIsMounted(true), []);

  React.useEffect(() => {
    setImagePositions(generateSpherePositions());
  }, [generateSpherePositions]);

  React.useEffect(() => {
    if (!isMounted) return;
    const tick = () => {
      updateMomentum();
      animationFrame.current = requestAnimationFrame(tick);
    };
    animationFrame.current = requestAnimationFrame(tick);
    return () => {
      if (animationFrame.current) cancelAnimationFrame(animationFrame.current);
    };
  }, [isMounted, updateMomentum]);

  React.useEffect(() => {
    if (!isMounted) return;
    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerUp);
    };
  }, [isMounted, onPointerMove, onPointerUp]);

  // ----------- RENDER -----------
  if (!isMounted) {
    return (
      <div
        className={`bg-transparent ${className}`}
        style={{ width: containerSize, height: containerSize }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none cursor-grab active:cursor-grabbing touch-none ${className}`}
      style={{ width: containerSize, height: containerSize, perspective: `${perspective}px` }}
      onPointerDown={onPointerDown}
    >
      <div className="relative w-full h-full" style={{ zIndex: 10 }}>
        {images.map((image, index) => {
          const pos = worldPositions[index];
          if (!pos || !pos.isVisible) return null;

          const imageSize = baseImageSize * pos.scale;
          const isHovered = hoveredIndex === index;
          const finalScale = isHovered ? Math.min(1.25, 1.25 / pos.scale) : 1;

          return (
            <div
              key={image.id}
              className="absolute select-none transition-transform duration-200 ease-out"
              style={{
                width: `${imageSize}px`,
                height: `${imageSize}px`,
                left: `${containerSize / 2 + pos.x}px`,
                top: `${containerSize / 2 + pos.y}px`,
                opacity: pos.fadeOpacity,
                transform: `translate(-50%, -50%) scale(${finalScale})`,
                zIndex: isHovered ? 9999 : pos.zIndex,
              }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex((cur) => (cur === index ? null : cur))}
            >
              <div className="group relative h-full w-full overflow-hidden rounded-[18%] shadow-[0_8px_24px_-8px_rgba(0,0,0,0.35)]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover pointer-events-none"
                  draggable={false}
                  priority={index < 4}
                />

                {/* Hover reveal — gradient bottom + name */}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-start justify-end gap-1 px-3 pb-3 pt-12 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(14,23,69,0.95) 0%, rgba(14,23,69,0.7) 50%, rgba(14,23,69,0) 100%)",
                  }}
                >
                  <span className="text-white text-[15px] font-bold leading-tight tracking-[-0.02em] [font-family:var(--font-figtree,inherit)]">
                    {image.name}
                  </span>
                  {image.role && (
                    <span className="text-[#F540FF] text-[11px] font-medium leading-tight tracking-[0.01em] [font-family:var(--font-figtree,inherit)] whitespace-pre-line">
                      {image.role}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
