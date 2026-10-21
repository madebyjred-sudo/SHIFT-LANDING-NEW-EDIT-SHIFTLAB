"use client";

import { useEffect, useRef } from "react";

/* El peaje: la línea que separa el hero del resto es la compuerta de pertinencia
 * de Sentinel. Miles de píxeles (menciones) caen a su ritmo; al llegar a la línea
 * la encienden donde tocan y la luz se va apagando. El cursor agita la lluvia:
 * cerca del puntero los píxeles aceleran, se apartan y caen más. Todo en el
 * color de Sentinel (#9244D8, el ala del isotipo de Shift).
 *
 * Canvas 2D con arreglos tipados: 2.400 partículas a 60 fps sin presión de GC.
 * Con prefers-reduced-motion se dibuja una sola foto quieta. */

const COLOR = [146, 68, 216] as const; // #9244D8
const N = 3200;

export default function Peaje({ ocupado = false }: { ocupado?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const ocupadoRef = useRef(ocupado);
  ocupadoRef.current = ocupado;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const host = canvas.parentElement!;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1, linea = 0;
    const x = new Float32Array(N), y = new Float32Array(N), vy = new Float32Array(N), vx = new Float32Array(N), t = new Float32Array(N), a = new Float32Array(N);
    let brillo = new Float32Array(1);
    const raton = { x: -1e4, y: -1e4, activo: 0 };

    const nacer = (i: number, arriba: boolean) => {
      x[i] = Math.random() * w;
      y[i] = arriba ? -Math.random() * h * 0.6 : Math.random() * linea;
      vy[i] = 0.25 + Math.random() * 0.9;
      vx[i] = 0;
      t[i] = Math.random() < 0.12 ? 3 : Math.random() < 0.5 ? 2 : 1;
      a[i] = 0.18 + Math.random() * 0.5;
    };

    const medir = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height; linea = h - 1.5;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      brillo = new Float32Array(Math.ceil(w / 2) + 1);
      for (let i = 0; i < N; i++) nacer(i, false);
    };
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(host);

    const mover = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      raton.x = e.clientX - r.left; raton.y = e.clientY - r.top; raton.activo = 1;
    };
    const salir = () => { raton.activo = 0; };
    host.addEventListener("pointermove", mover);
    host.addEventListener("pointerleave", salir);

    const [cr, cg, cb] = COLOR;
    let raf = 0, visible = true;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !raf && !reducido) raf = requestAnimationFrame(cuadro); });
    io.observe(host);

    function dibujar() {
      ctx!.clearRect(0, 0, w, h);
      // Lluvia: cuadraditos con alfa por profundidad.
      for (let i = 0; i < N; i++) {
        if (y[i] < 0) continue;
        const fade = Math.min(1, y[i] / 80) * a[i];
        ctx!.fillStyle = `rgba(${cr},${cg},${cb},${fade})`;
        ctx!.fillRect(x[i], y[i], t[i], t[i]);
      }
      // La línea base del peaje, fina.
      ctx!.fillStyle = `rgba(${cr},${cg},${cb},0.35)`;
      ctx!.fillRect(0, linea, w, 1);
      // Lo que se encendió: un trazo más grueso con halo donde llegaron menciones.
      for (let k = 0; k < brillo.length; k++) {
        const b = brillo[k];
        if (b < 0.02) continue;
        const px = k * 2;
        const v = Math.min(1, b);
        ctx!.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(1, b * 1.4)})`;
        ctx!.fillRect(px, linea - 1, 2, 3);
        // Halo hacia arriba: degradado vertical corto donde la línea está encendida.
        const alto = 26 * v;
        const g = ctx!.createLinearGradient(0, linea - alto, 0, linea);
        g.addColorStop(0, `rgba(${cr},${cg},${cb},0)`);
        g.addColorStop(1, `rgba(${cr},${cg},${cb},${Math.min(0.55, b * 0.45)})`);
        ctx!.fillStyle = g;
        ctx!.fillRect(px, linea - alto, 2, alto);
      }
    }

    function paso() {
      const rx = raton.x, ry = raton.y, act = raton.activo;
      const lluvia = ocupadoRef.current;
      for (let i = 0; i < N; i++) {
        let acel = lluvia ? 3.2 : 1;
        if (act) {
          const dx = x[i] - rx, dy = y[i] - ry, d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const f = 1 - Math.sqrt(d2) / 140;
            vx[i] += (dx > 0 ? 1 : -1) * f * 0.6; // se apartan del cursor
            acel = 1 + f * 4; // y caen más rápido
          }
        }
        vx[i] *= 0.92;
        x[i] += vx[i];
        y[i] += vy[i] * acel * (1 + Math.max(0, (y[i] - linea * 0.7) / (linea * 0.3)) * 1.2);
        if (lluvia) x[i] += Math.sin(y[i] * 0.03 + i) * 0.6; // sin orden: tiemblan mientras se leen
        if (y[i] >= linea) {
          if (lluvia) { nacer(i, true); continue; }
          const k = Math.max(0, Math.min(brillo.length - 1, Math.round(x[i] / 2)));
          brillo[k] = Math.min(2.5, brillo[k] + 0.5 * t[i]);
          if (k > 0) brillo[k - 1] += 0.12;
          if (k < brillo.length - 1) brillo[k + 1] += 0.12;
          nacer(i, true);
        }
      }
      // La luz se esparce un poco y se apaga.
      for (let k = 0; k < brillo.length; k++) brillo[k] *= 0.972;
    }

    function cuadro() {
      raf = 0;
      if (!visible) return;
      paso();
      dibujar();
      raf = requestAnimationFrame(cuadro);
    }

    if (reducido) {
      for (let s = 0; s < 240; s++) paso();
      dibujar();
    } else raf = requestAnimationFrame(cuadro);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener("pointermove", mover);
      host.removeEventListener("pointerleave", salir);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-0 block" />;
}
