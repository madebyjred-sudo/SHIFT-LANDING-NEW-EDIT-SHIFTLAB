"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { REDES } from "@/lib/escucha/redes";
import { SentinelMarca } from "@/components/escucha/SentinelMarca";

/* «Dónde escucha Sentinel» como la máquina, no como lista: cada superficie
 * suelta sus menciones (píxeles) hacia la compuerta morada. Lo que no es de la
 * marca cae en gris; lo que pasa se suma a la derecha. Cifras de muestra
 * (las mismas de «por dentro»); con `ocupado` el flujo se acelera. */

const LEIDAS = 18420;
const TUYAS = 5034;
const PASA = TUYAS / LEIDAS;
const POR_PIXEL = 71;
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

type P = { x: number; y: number; vx: number; vy: number; fila: number; fase: 0 | 1 | 2; pasa: boolean; a: number; ty: number };

export default function Compuerta({ ocupado }: { ocupado: boolean }) {
  const caja = useRef<HTMLDivElement>(null);
  const lienzo = useRef<HTMLCanvasElement>(null);
  const puerta = useRef<HTMLDivElement>(null);
  const filas = useRef<(HTMLLIElement | null)[]>([]);
  const rapido = useRef(ocupado);
  const [cuenta, setCuenta] = useState({ l: 0, t: 0 });

  useEffect(() => {
    rapido.current = ocupado;
  }, [ocupado]);

  useEffect(() => {
    const cv = lienzo.current, box = caja.current;
    if (!cv || !box) return;
    const ctx = cv.getContext("2d")!;
    const quieto = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (quieto) {
      setCuenta({ l: LEIDAS, t: TUYAS });
      return;
    }
    let W = 0, H = 0, dpr = 1, gx = 0, gTop = 0, gBot = 0, x0 = 0, outX = 0;
    let ys: number[] = [];
    const medir = () => {
      const r = box.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      const g = puerta.current!.getBoundingClientRect();
      gx = g.left - r.left; gTop = g.top - r.top; gBot = g.bottom - r.top;
      ys = filas.current.map((li) => (li ? li.getBoundingClientRect().top - r.top + li.offsetHeight / 2 : 0));
      const l0 = filas.current[0];
      x0 = l0 ? l0.getBoundingClientRect().right - r.left - 4 : 120;
      outX = gx + 10;
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(box);

    const activas = REDES.map((r, i) => (r.soloCompleto ? -1 : i)).filter((i) => i >= 0);
    const ps: P[] = [];
    let llegadas = 0, pasadas = 0, acum = 0, visible = true, raf = 0, t0 = performance.now();
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(box);

    const cuadro = (t: number) => {
      raf = requestAnimationFrame(cuadro);
      const dt = Math.min(0.05, (t - t0) / 1000);
      t0 = t;
      if (!visible) return;
      // Emisión: más rápida mientras se pide el reporte.
      acum += dt * (rapido.current ? 48 : 22);
      while (acum > 1) {
        acum--;
        const fila = activas[Math.floor(Math.random() * activas.length)];
        const ty = gTop + (gBot - gTop) * (0.15 + Math.random() * 0.7);
        ps.push({ x: x0, y: ys[fila], vx: 0, vy: 0, fila, fase: 0, pasa: Math.random() < PASA, a: 0, ty });
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const vel = rapido.current ? 1.7 : 1;
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (p.fase === 0) {
          // Viaje en curva suave desde la fila hacia la compuerta.
          p.x += (90 + (p.fila % 3) * 18) * dt * vel;
          const k = Math.min(1, (p.x - x0) / Math.max(1, gx - x0));
          p.y = ys[p.fila] + (p.ty - ys[p.fila]) * (k * k * (3 - 2 * k));
          p.a = Math.min(1, p.a + dt * 3);
          if (p.x >= gx - 3) {
            p.fase = 1;
            llegadas++;
            if (p.pasa) { pasadas++; p.vx = 60; p.vy = 0; } else { p.vx = -20 - Math.random() * 30; p.vy = 10; }
          }
        } else if (p.fase === 1) {
          if (p.pasa) {
            p.x += p.vx * dt * vel;
            p.y += ((gTop + gBot) / 2 - p.y) * dt * 1.5;
            if (p.x > outX) { p.a -= dt * 6; }
          } else {
            p.vy += 220 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.a -= dt * 0.9;
          }
          if (p.a <= 0 || p.y > H + 10) { ps.splice(i, 1); continue; }
        }
        const morado = p.fase === 0 || p.pasa;
        ctx.globalAlpha = Math.max(0, p.a) * (morado ? 0.9 : 0.6);
        ctx.fillStyle = p.fase === 0 ? "#B98AEB" : p.pasa ? "#9244D8" : "#C9C9C3";
        if (p.x > gx + 14 && p.pasa) continue;
        ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      }
      ctx.globalAlpha = 1;
      const l = Math.min(LEIDAS, llegadas * POR_PIXEL);
      setCuenta((c) => {
        const nt = l >= LEIDAS ? TUYAS : Math.min(TUYAS, pasadas * POR_PIXEL);
        return c.l === l && c.t === nt ? c : { l, t: nt };
      });
    };
    raf = requestAnimationFrame(cuadro);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const estado = ocupado ? "Leyendo" : "En espera";
  return (
    <div className="self-start overflow-hidden rounded-[6px] border border-[#DCDCD6] bg-white shadow-[0_30px_70px_-45px_rgba(23,23,27,0.5)]">
      <div className="flex items-baseline justify-between border-b border-[#DCDCD6] px-5 py-3.5">
        <h2 className="flex items-baseline gap-2 text-[15px] font-semibold">
          <SentinelMarca className="text-[13px]" /> <span>· dónde escucha</span>
        </h2>
        <span className={`text-[13px] ${ocupado ? "text-[#9244D8]" : "text-[#8A8B92]"}`}>{estado}</span>
      </div>

      <div ref={caja} className="relative grid grid-cols-[118px_minmax(0,1fr)_96px] gap-0 px-4 py-4 sm:grid-cols-[150px_minmax(0,1fr)_150px] sm:px-5">
        <canvas ref={lienzo} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
        <ul className="relative z-[1]">
          {REDES.map((r, i) => (
            <li key={r.key} ref={(el) => { filas.current[i] = el; }} className={`flex h-[36px] items-center gap-2.5 text-[12.5px] sm:text-[13.5px] ${r.soloCompleto ? "text-[#8A8B92]" : ""}`}>
              {r.icono ? (
                <Image src={r.icono} alt="" width={16} height={16} className={`h-4 w-4 [filter:brightness(0)] ${r.soloCompleto ? "opacity-25" : "opacity-75"}`} />
              ) : (
                <span className="grid h-4 w-4 place-items-center"><span className="h-1.5 w-1.5 rounded-full bg-[#8A8B92]" /></span>
              )}
              <span className="truncate">{r.nombre}</span>
            </li>
          ))}
        </ul>

        {/* La compuerta */}
        <div className="relative">
          <div ref={puerta} className="absolute bottom-6 right-0 top-1 w-[4px] rounded-full bg-gradient-to-b from-[#9244D8] to-[#5B2793] shadow-[0_0_24px_rgba(146,68,216,0.45)]" />
          <span className="absolute bottom-0 right-[-14px] text-[10px] font-medium uppercase tracking-[0.14em] text-[#9244D8] [font-family:var(--font-plex-mono)]">Compuerta</span>
        </div>

        <div className="relative z-[1] flex flex-col justify-center pl-4 sm:pl-6">
          <p className="text-[11px] text-[#8A8B92] sm:text-[12px]">Leídas</p>
          <p className="text-[26px] font-semibold leading-none tracking-[-0.02em] tabular-nums sm:text-[40px]">{fmt(cuenta.l)}</p>
          <p className="mt-4 text-[11px] text-[#8A8B92] sm:text-[12px]">Son de tu marca</p>
          <p className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-[#9244D8] tabular-nums sm:text-[40px]">{fmt(cuenta.t)}</p>
          <p className="mt-4 hidden text-[12px] leading-snug text-[#8A8B92] sm:block">Lo demás queda fuera del conteo: homónimos, reventa, spam.</p>
        </div>
      </div>

      <p className="border-t border-[#DCDCD6] bg-[#FAFAF8] px-5 py-3 text-[12px] leading-relaxed text-[#8A8B92]">
        11 superficies, siempre. TikTok, LinkedIn, radio y TV entran en el monitoreo completo. Cifras de ejemplo.
      </p>
    </div>
  );
}
