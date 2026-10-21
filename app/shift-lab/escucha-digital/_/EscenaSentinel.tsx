"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FECHA_DATOS, SENTINEL_REAL } from "@/lib/escucha/datos-reales";
import type { Resumen } from "@/lib/escucha/cliente";
import { REDES } from "@/lib/escucha/redes";

/* Escena fija de Sentinel: del ruido a la señal, contado con el scroll.
 * 1) Miles de menciones flotan sin orden.  2) Pasan por la compuerta: lo que
 * no es de tu marca cae y se apaga.  3) Lo que pasó se ordena por fuente con
 * las proporciones reales que midió Sentinel. Canvas, ~1.800 puntos. */

const MORADO = [146, 68, 216];
const FUENTES = ["tiktok", "twitter", "facebook", "news", "instagram", "reddit", "blog", "youtube", "radio"] as const;
const NOMBRE: Record<string, string> = { tiktok: "TikTok", twitter: "X", facebook: "Facebook", news: "Noticias", instagram: "Instagram", reddit: "Reddit", blog: "Blogs", youtube: "YouTube", radio: "Radio" };
const N = 1800;

const beatsPara = (marca: string | undefined, pais: string | undefined, r: Resumen | undefined) => [
  { t: `Cada día se dicen miles de cosas que suenan a ${marca ?? "tu marca"}.`, s: "Homónimos, direcciones, spam, notas que te nombran de pasada. Contarlo todo es contar ruido." },
  { t: "La compuerta deja pasar solo lo que es tuyo.", s: "Cada mención se lee y se decide: si no habla de tu marca, no entra al conteo." },
  r
    ? { t: "Lo que pasa se ordena, se mide y te avisa.", s: `${r.total.toLocaleString("es-CR")} menciones de ${marca} en ${pais} en los últimos 30 días. Así se reparten por fuente en la muestra que leímos.` }
    : BEATS_BASE[2],
];

const BEATS_BASE = [
  { t: "", s: "" },
  { t: "", s: "" },
  { t: "Lo que pasa se ordena, se mide y te avisa.", s: `${SENTINEL_REAL.menciones.toLocaleString("es-CR")} menciones curadas desde ${SENTINEL_REAL.desde}, con estas proporciones por fuente, y ${SENTINEL_REAL.alertasEnviadas.toLocaleString("es-CR")} alertas enviadas en el momento.` },
];

const suave = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function EscenaSentinel({ marca, pais, resumen }: { marca?: string; pais?: string; resumen?: Resumen }) {
  const BEATS = beatsPara(marca, pais, resumen);
  // Fuentes y cifras: las de la marca escuchada; sin escucha, las agregadas de Sentinel.
  const datos = resumen
    ? REDES.filter((x) => !x.soloCompleto && (resumen.porRed[x.key] ?? 0) > 0).map((x) => ({ nombre: x.nombre, n: resumen.porRed[x.key] }))
    : FUENTES.map((k) => ({ nombre: NOMBRE[k], n: SENTINEL_REAL.porFuente[k] }));
  const ref = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progreso = useRef(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [beat, setBeat] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progreso.current = v;
    setBeat(v < 0.33 ? 0 : v < 0.66 ? 1 : 2);
  });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    // Semillas estables por punto.
    const r1 = new Float32Array(N), r2 = new Float32Array(N), r3 = new Float32Array(N);
    const fuente = new Int8Array(N), pasa = new Uint8Array(N), slot = new Int32Array(N);
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const total = Math.max(1, datos.reduce((a, d) => a + d.n, 0));
    const cupo = datos.map((d) => d.n / total);
    const cont = new Int32Array(Math.max(1, datos.length));
    for (let i = 0; i < N; i++) {
      r1[i] = rnd(); r2[i] = rnd(); r3[i] = rnd();
      pasa[i] = rnd() < 0.42 ? 1 : 0;
      let u = rnd(), k = 0;
      while (k < cupo.length - 1 && u > cupo[k]) { u -= cupo[k]; k++; }
      fuente[i] = k;
      if (pasa[i]) slot[i] = cont[k]++;
    }
    const maxCont = Math.max(...cont);

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    medir();
    window.addEventListener("resize", medir);
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let visible = false;
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
    io.observe(canvas);
    const cuadro = (t: number) => {
      if (!visible) { raf = requestAnimationFrame(cuadro); return; }
      const v = progreso.current;
      const tiempo = reducido ? 0 : t / 1000;
      ctx.clearRect(0, 0, w, h);
      const cx = w > 900 ? w * 0.7 : w * 0.5;
      const movil = w <= 900;
      const gy = movil ? h * 0.6 : h * 0.42; // altura de la compuerta: en teléfono, bajo el texto
      const anchoG = Math.min(240, w * 0.3);
      const fase2 = suave(0.3, 0.55, v); // hacia la compuerta
      const fase3 = suave(0.66, 0.9, v); // a las barras
      // Barras: base y ancho.
      const semi = w > 900 ? Math.min(360, w * 0.27) : w * 0.45;
      const bx0 = cx - semi, bx1 = cx + semi;
      const by = movil ? h * 0.8 : h * 0.86, alto = movil ? h * 0.3 : h * 0.36;
      const colW = (bx1 - bx0) / Math.max(1, datos.length);
      const porFila = Math.max(4, Math.floor(colW * 0.7 / 4));

      // Compuerta.
      const gOp = suave(0.25, 0.4, v) * (1 - fase3);
      if (gOp > 0.01) {
        ctx.fillStyle = `rgba(${MORADO},${0.9 * gOp})`;
        ctx.fillRect(cx - anchoG / 2 - 14, gy - 70, 10, 140);
        ctx.fillRect(cx + anchoG / 2 + 4, gy - 70, 10, 140);
        ctx.fillRect(cx - anchoG / 2 - 14, gy - 2, anchoG + 28, 3);
      }

      for (let i = 0; i < N; i++) {
        // A: ruido flotando por toda la pantalla.
        const ax = (r1[i] * 1.2 - 0.1) * w + Math.sin(tiempo * 0.4 + r3[i] * 12) * 14;
        const ay = (r2[i] * 1.1 - 0.05) * h + Math.cos(tiempo * 0.35 + r1[i] * 9) * 12;
        // B: embudo hacia la compuerta; los que no pasan caen hacia afuera.
        const bxp = cx + (r1[i] - 0.5) * anchoG * 0.9;
        const byp = pasa[i] ? gy + 30 + r2[i] * (h * 0.4) : gy - 40 - r2[i] * 60;
        const fueraX = pasa[i] ? bxp : cx + (r1[i] < 0.5 ? -1 : 1) * (anchoG * 0.6 + r3[i] * w * 0.3);
        const fueraY = pasa[i] ? byp : h * 1.1;
        const caida = pasa[i] ? 0 : suave(0.45, 0.62, v);
        let x = ax + (bxp - ax) * fase2;
        let y = ay + (byp - ay) * fase2;
        x += (fueraX - x) * caida;
        y += (fueraY - y) * caida;
        let a = 0.25 + r3[i] * 0.45;
        let col = pasa[i] ? MORADO : [185, 185, 178];
        if (!pasa[i]) a *= 1 - caida;
        // C: barras por fuente.
        if (pasa[i] && fase3 > 0) {
          const k = fuente[i];
          const fila = Math.floor(slot[i] / porFila), colm = slot[i] % porFila;
          const tx = bx0 + k * colW + colW * 0.15 + colm * 4;
          const ty = by - (fila * 4) * (alto / (Math.ceil(maxCont / porFila) * 4));
          x += (tx - x) * fase3;
          y += (ty - y) * fase3;
          a = a + (0.85 - a) * fase3;
        }
        if (a < 0.02) continue;
        if (fase2 < 0.5) col = [Math.round(185 + (col[0] - 185) * fase2 * 2), Math.round(185 + (col[1] - 185) * fase2 * 2), Math.round(178 + (col[2] - 178) * fase2 * 2)];
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
        ctx.fillRect(x, y, 2.4, 2.4);
      }

      // Rótulos de las barras.
      if (fase3 > 0.6) {
        ctx.globalAlpha = (fase3 - 0.6) / 0.4;
        ctx.fillStyle = "rgba(236,236,232,0.75)";
        ctx.font = "12px var(--font-plex), sans-serif";
        ctx.textAlign = "center";
        datos.forEach((d, j) => {
          ctx.fillText(d.nombre.replace("Medios digitales", "Medios").replace("Blogs y foros", "Blogs"), bx0 + j * colW + colW / 2, by + 22);
          ctx.fillStyle = "rgba(236,236,232,0.45)";
          ctx.fillText(d.n.toLocaleString("es-CR"), bx0 + j * colW + colW / 2, by + 38);
          ctx.fillStyle = "rgba(236,236,232,0.75)";
        });
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(cuadro);
    };
    raf = requestAnimationFrame(cuadro);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, [datos.map((d) => d.n).join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section ref={ref} className="relative h-[340vh] bg-[#17171B]" aria-label="Cómo funciona Sentinel">
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />
        <div className="relative mx-auto flex h-full w-full max-w-[1200px] items-start px-6 pt-[18vh] md:items-center md:px-10 md:pt-0">
          <div className="relative min-h-[240px] w-full max-w-[460px]">
            {BEATS.map((b, i) => (
              <motion.div key={i} className="absolute inset-0" initial={false} animate={{ opacity: beat === i ? 1 : 0, y: beat === i ? 0 : beat > i ? -24 : 24 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                <p className="text-[13px] font-medium text-[#B98AEB]">{i + 1} de 3</p>
                <h2 className="mt-3 text-[32px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#F4F4F2] md:text-[46px]">{b.t}</h2>
                <p className="mt-4 text-[16px] leading-relaxed text-[#F4F4F2]/65">{b.s}</p>
              </motion.div>
            ))}
          </div>
        </div>
        <p className="absolute bottom-5 left-0 right-0 text-center text-[12px] text-white/35">{resumen ? `Escucha de ${marca}, ${pais}, últimos 30 días` : `Medido por Sentinel, ${FECHA_DATOS}`}</p>
      </div>
    </section>
  );
}
