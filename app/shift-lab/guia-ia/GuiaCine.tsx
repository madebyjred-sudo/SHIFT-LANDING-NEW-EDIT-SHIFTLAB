"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CASAS } from "@/lib/escucha/casas";

/* Guía Shift LAB en clave de cine: portada a pantalla completa, cada capítulo
 * abre con su escena (pinned + scroll), el texto entra al ritmo de la lectura y
 * las cifras se cuentan. Todo el texto viene del markdown y se renderiza en el
 * servidor, así que sigue siendo indexable. */

export type Capitulo = { titulo: string; cuerpo: string };
const ease = [0.22, 1, 0.36, 1] as const;
const C = { noche: "#0A0E27", noche2: "#0B1030", azul: "#1534dc", azul2: "#3450FF", mag: "#F540FF", cian: "#5BE9FF", tinta: "#0e1745", suave: "#4a5488" };
const NUM = ["uno", "dos", "tres", "cuatro", "cinco", "seis"];
const ICONO = ["percepcion", "checklist", "verbatim", "visibilidad", "nodos", "lectura"];

export const slug = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const texto = (n: unknown): string => (typeof n === "string" ? n : Array.isArray(n) ? n.map(texto).join("") : n && typeof n === "object" && "props" in n ? texto((n as { props: { children?: unknown } }).props.children) : "");
const sinNumero = (t: string) => t.replace(/^Capítulo \d+\.\s*/, "");

/* ------------------------------------------------------------------ */
/* Piezas de texto: entran cuando llegan a la vista                    */
/* ------------------------------------------------------------------ */
const Entra = ({ children, d = 0 }: { children: ReactNode; d?: number }) => (
  <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.9, delay: d, ease }}>
    {children}
  </motion.div>
);

function Markdown({ md }: { md: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h3: ({ children }) => (
          <Entra>
            <h3 id={slug(texto(children))}>{children}</h3>
          </Entra>
        ),
        h4: ({ children }) => <h4>{children}</h4>,
        p: ({ children }) => (
          <Entra>
            <p>{children}</p>
          </Entra>
        ),
        ul: ({ children }) => (
          <Entra>
            <ul>{children}</ul>
          </Entra>
        ),
        ol: ({ children }) => (
          <Entra>
            <ol>{children}</ol>
          </Entra>
        ),
        table: ({ children }) => (
          <Entra>
            <div className="g-tabla"><table>{children}</table></div>
          </Entra>
        ),
        blockquote: ({ children }) => (
          <motion.blockquote initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 1.1, ease }}>
            {children}
          </motion.blockquote>
        ),
        a: ({ href, children }) => (href?.startsWith("/") ? <Link href={href}>{children}</Link> : <a href={href} target="_blank" rel="noopener">{children}</a>),
      }}
    >
      {md}
    </ReactMarkdown>
  );
}

/* ------------------------------------------------------------------ */
/* Portada                                                             */
/* ------------------------------------------------------------------ */
function Portada({ titulo, bajada, capitulos }: { titulo: string; bajada: string; capitulos: Capitulo[] }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const op = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const esc = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const palabras = titulo.replace(/^Guía Shift LAB:\s*/, "").split(" ");
  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden" style={{ background: C.noche }}>
      <motion.div aria-hidden style={{ scale: esc }} className="pointer-events-none absolute inset-0">
        <Anillos />
      </motion.div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40" style={{ background: `linear-gradient(to bottom, transparent, ${C.noche})` }} />
      <motion.div style={{ y, opacity: op }} className="relative z-10 mx-auto w-full max-w-[1180px] px-6 pt-28 md:px-10">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.2 }} className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#F540FF] [font-family:var(--font-figtree)]">
          Guía Shift LAB · seis capítulos
        </motion.p>
        <h1 className="mt-6 max-w-[1000px] text-[44px] font-extrabold leading-[0.98] tracking-[-0.035em] text-white sm:text-[64px] md:text-[96px] [font-family:var(--font-figtree)]">
          {palabras.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span className="inline-block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.1, delay: 0.35 + i * 0.08, ease }}>
                {w === "IA" ? <span style={{ color: C.cian }}>{w}</span> : w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.2, ease }} className="mt-8 max-w-[640px] text-[17px] leading-relaxed text-white/65 md:text-[20px]">
          {bajada}
        </motion.p>
        <motion.ol initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.6 }} className="mt-12 grid max-w-[900px] gap-x-8 gap-y-3 sm:grid-cols-2 md:grid-cols-3">
          {capitulos.map((c, i) => (
            <li key={c.titulo}>
              <a href={`#${slug(c.titulo)}`} className="group flex items-baseline gap-3 text-[14px] text-white/55 transition-colors hover:text-white">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/30 group-hover:text-[#5BE9FF] [font-family:var(--font-figtree)]">{NUM[i]}</span>
                {sinNumero(c.titulo)}
              </a>
            </li>
          ))}
        </motion.ol>
      </motion.div>
      <motion.div aria-hidden initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 1 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.span className="block h-12 w-px bg-white/40" animate={{ scaleY: [0.3, 1, 0.3], originY: 0 }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
      </motion.div>
    </section>
  );
}

/* Anillos del radar de Eco con las siete IA orbitando: la firma visual de la guía. */
function Anillos() {
  return (
    <div className="absolute right-[-30vw] top-1/2 h-[120vw] w-[120vw] -translate-y-1/2 md:right-[-18vw] md:h-[78vw] md:w-[78vw]">
      {[1, 0.74, 0.5, 0.28].map((r, i) => (
        <motion.span key={r} className="absolute left-1/2 top-1/2 rounded-full border" style={{ width: `${r * 100}%`, height: `${r * 100}%`, x: "-50%", y: "-50%", borderColor: `rgba(91,233,255,${0.05 + i * 0.03})` }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, delay: 0.2 + i * 0.15, ease }} />
      ))}
      <motion.div className="absolute inset-[13%]" animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }}>
        {CASAS.map((c, i) => {
          const a = (i / CASAS.length) * Math.PI * 2;
          return (
            <span key={c.key} className="absolute grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] md:h-12 md:w-12" style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%`, transform: "translate(-50%,-50%)" }}>
              <span className="h-5 w-5 text-white/70" dangerouslySetInnerHTML={{ __html: c.svg }} />
            </span>
          );
        })}
      </motion.div>
      <span className="absolute left-1/2 top-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle, rgba(52,80,255,0.35), transparent 65%)" }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Escenas de apertura por capítulo                                    */
/* ------------------------------------------------------------------ */
function EscenaPregunta({ p }: { p: MotionValue<number> }) {
  const q = "¿Cuál es la mejor marca de zapatillas para correr?";
  const n = useTransform(p, [0.1, 0.45], [0, q.length]);
  const [k, setK] = useState(0);
  useEffect(() => n.on("change", (v) => setK(Math.round(v))), [n]);
  return (
    <div className="w-full max-w-[520px]">
      <div className="rounded-[18px] border border-white/15 bg-white/[0.05] px-5 py-4 text-[17px] text-white md:text-[20px]">
        {q.slice(0, k)}
        <motion.span className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] bg-[#5BE9FF]" animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2">
        {CASAS.map((c, i) => (
          <Aparece key={c.key} p={p} desde={0.45 + i * 0.03}>
            <span className="grid aspect-square place-items-center rounded-full border border-white/10 bg-white/[0.06]">
              <span className="h-[45%] w-[45%] text-white/80" dangerouslySetInnerHTML={{ __html: c.svg }} />
            </span>
          </Aparece>
        ))}
      </div>
      <Aparece p={p} desde={0.7}>
        <p className="mt-6 text-[14px] leading-relaxed text-white/60">Siete IA, siete respuestas distintas. Ninguna muestra diez enlaces: eligen por ti.</p>
      </Aparece>
    </div>
  );
}

function EscenaFicha({ p }: { p: MotionValue<number> }) {
  const filas = ["Nombre y cómo se escribe", "Qué vendes y dónde", "Año de fundación y sede", "Precios y productos", "Fuentes oficiales"];
  return (
    <div className="w-full max-w-[460px] rounded-[18px] border border-white/12 bg-white/[0.04] p-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-white/40 [font-family:var(--font-figtree)]">Ficha de marca</p>
      {filas.map((f, i) => (
        <Aparece key={f} p={p} desde={0.2 + i * 0.09}>
          <div className="mt-4 flex items-center gap-3 border-b border-white/8 pb-3 text-[16px] text-white/85">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#12a150] text-[13px] font-bold text-white">✓</span>
            {f}
          </div>
        </Aparece>
      ))}
    </div>
  );
}

/* Palabras calientes: dato real, autocompletado de Google en Costa Rica y las 7 IA (Dos Pinos, 21-oct-2026). */
const CALIENTES = [
  { t: "queso crema", f: "Google" },
  { t: "helados", f: "Google" },
  { t: "cooperativa", f: "IA" },
  { t: "rompope", f: "Google" },
  { t: "yogures", f: "IA" },
  { t: "krunchy", f: "Google" },
  { t: "líder", f: "IA" },
  { t: "reputación ↑", f: "Conversación" },
  { t: "quesos", f: "IA" },
  { t: "merco ↑", f: "Conversación" },
];
function EscenaCalientes({ p }: { p: MotionValue<number> }) {
  return (
    <div className="w-full max-w-[560px]">
      <div className="flex flex-wrap gap-x-5 gap-y-3">
        {CALIENTES.map((c, i) => (
          <Caliente key={c.t} p={p} i={i} t={c.t} f={c.f} />
        ))}
      </div>
      <Aparece p={p} desde={0.75}>
        <p className="mt-8 text-[12px] leading-relaxed text-white/45">Ejemplo real: palabras calientes de Dos Pinos en Costa Rica, del autocompletado de Google, las 7 IA y 30 días de conversación. Medido por Shift LAB el 21 de octubre de 2026. Dos Pinos no es cliente de Shift.</p>
      </Aparece>
    </div>
  );
}
function Caliente({ p, i, t, f }: { p: MotionValue<number>; i: number; t: string; f: string }) {
  const a = 0.12 + i * 0.05;
  const op = useTransform(p, [a, a + 0.08], [0, 1]);
  const color = useTransform(p, [a, a + 0.25], ["#3450FF", f === "Conversación" ? "#F540FF" : f === "IA" ? "#5BE9FF" : "#ffffff"]);
  const size = useTransform(p, [a, a + 0.25], [18, 22 + ((i * 7) % 5) * 5]);
  return (
    <motion.span style={{ opacity: op }} className="inline-flex items-baseline gap-1.5">
      <motion.span style={{ color, fontSize: size }} className="font-extrabold tracking-[-0.01em] [font-family:var(--font-figtree)]">{t}</motion.span>
      <span className="text-[10px] uppercase tracking-[0.12em] text-white/35">{f}</span>
    </motion.span>
  );
}

function EscenaCifras({ p, cifras }: { p: MotionValue<number>; cifras: { v: number; d: number; pie: string }[] }) {
  return (
    <div className="grid w-full max-w-[560px] gap-8">
      {cifras.map((c, i) => (
        <Aparece key={c.pie} p={p} desde={0.15 + i * 0.15}>
          <div className="border-t border-white/15 pt-4">
            <Cuenta p={p} desde={0.15 + i * 0.15} v={c.v} d={c.d} />
            <p className="mt-1 max-w-[420px] text-[15px] leading-snug text-white/60">{c.pie}</p>
          </div>
        </Aparece>
      ))}
    </div>
  );
}
function Cuenta({ p, desde, v, d }: { p: MotionValue<number>; desde: number; v: number; d: number }) {
  const n = useTransform(p, [desde, desde + 0.3], [0, v]);
  const [x, setX] = useState("0");
  useEffect(() => n.on("change", (k) => setX(k.toFixed(d).replace(".", ","))), [n, d]);
  return <p className="text-[64px] font-extrabold leading-none tracking-[-0.04em] text-white md:text-[88px] [font-family:var(--font-figtree)]">{x}<span className="text-[#5BE9FF]">%</span></p>;
}

function EscenaDosLados({ p }: { p: MotionValue<number> }) {
  const dentro = ["Páginas que responden la pregunta", "Datos verificables", "Ficha y precios al día"];
  const fuera = ["Medios que la IA lee", "Foros y reseñas", "Videos y comparativas"];
  const linea = useTransform(p, [0.3, 0.65], [0, 1]);
  return (
    <div className="relative grid w-full max-w-[600px] grid-cols-2 gap-10">
      {[["En tu sitio", dentro, C.azul2], ["Fuera de él", fuera, C.mag]].map(([t, xs, col], j) => (
        <div key={t as string}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] [font-family:var(--font-figtree)]" style={{ color: col as string }}>{t as string}</p>
          {(xs as string[]).map((x, i) => (
            <Aparece key={x} p={p} desde={0.15 + j * 0.15 + i * 0.07}>
              <p className="mt-4 border-l-2 pl-3 text-[16px] leading-snug text-white/85" style={{ borderColor: col as string }}>{x}</p>
            </Aparece>
          ))}
        </div>
      ))}
      <motion.span className="absolute -bottom-8 left-0 h-[2px] w-full origin-left" style={{ scaleX: linea, background: `linear-gradient(90deg, ${C.azul2}, ${C.mag})` }} />
      <Aparece p={p} desde={0.68}>
        <p className="absolute -bottom-20 left-0 w-[600px] max-w-[85vw] text-[14px] text-white/55">La respuesta de la IA se arma con los dos lados.</p>
      </Aparece>
    </div>
  );
}

function EscenaCiclo({ p }: { p: MotionValue<number> }) {
  const pasos = ["Medir", "Leer", "Actuar", "Volver a medir"];
  const rot = useTransform(p, [0, 1], [-40, 140]);
  return (
    <div className="relative grid aspect-square w-full max-w-[420px] place-items-center">
      <motion.svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full" style={{ rotate: rot }}>
        <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="1" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="url(#gc)" strokeWidth="3" strokeDasharray="140 413" strokeLinecap="round" />
        <defs>
          <linearGradient id="gc"><stop offset="0" stopColor="#3450FF" /><stop offset="1" stopColor="#F540FF" /></linearGradient>
        </defs>
      </motion.svg>
      {pasos.map((s, i) => {
        const a = (i / pasos.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <Aparece key={s} p={p} desde={0.15 + i * 0.1}>
            <span className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[15px] font-semibold text-white [font-family:var(--font-figtree)]" style={{ left: `${50 + Math.cos(a) * 44}%`, top: `${50 + Math.sin(a) * 44}%` }}>{s}</span>
          </Aparece>
        );
      })}
      <p className="text-center text-[13px] uppercase tracking-[0.16em] text-white/45 [font-family:var(--font-figtree)]">cada semana</p>
    </div>
  );
}

function Aparece({ p, desde, children }: { p: MotionValue<number>; desde: number; children: ReactNode }) {
  const op = useTransform(p, [desde, desde + 0.08], [0, 1]);
  const y = useTransform(p, [desde, desde + 0.08], [14, 0]);
  return <motion.div style={{ opacity: op, y }}>{children}</motion.div>;
}

/* ------------------------------------------------------------------ */
/* Apertura de capítulo: escena fija mientras se hace scroll            */
/* ------------------------------------------------------------------ */
function Apertura({ i, titulo, escena }: { i: number; titulo: string; escena: (p: MotionValue<number>) => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const tituloY = useTransform(p, [0, 0.3], [40, 0]);
  const tituloOp = useTransform(p, [0, 0.12, 0.88, 1], [0.2, 1, 1, 0.4]);
  const iconoY = useTransform(p, [0, 1], [80, -80]);
  const numEsc = useTransform(p, [0, 1], [1.08, 0.96]);
  return (
    <div ref={ref} id={slug(titulo)} className="relative scroll-mt-0" style={{ height: "240vh", background: C.noche }}>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <motion.span aria-hidden style={{ scale: numEsc }} className="pointer-events-none absolute -left-[2vw] bottom-[-6vw] select-none text-[34vw] font-extrabold leading-none tracking-[-0.06em] text-white/[0.035] [font-family:var(--font-figtree)]">
          {NUM[i]}
        </motion.span>
        <motion.img aria-hidden src={`/escucha/eco/iconos/${ICONO[i]}.webp`} alt="" style={{ y: iconoY }} className="pointer-events-none absolute right-[4vw] top-[12vh] w-[22vw] max-w-[260px] opacity-[0.16] md:opacity-25" />
        <div className="relative z-10 mx-auto grid w-full max-w-[1180px] items-center gap-12 px-6 md:px-10 lg:grid-cols-[1fr_1fr]">
          <motion.div style={{ y: tituloY, opacity: tituloOp }}>
            <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-[#F540FF] [font-family:var(--font-figtree)]">Capítulo {NUM[i]}</p>
            <h2 className="mt-5 text-[38px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white md:text-[64px] [font-family:var(--font-figtree)]">{sinNumero(titulo)}</h2>
          </motion.div>
          <div className="flex lg:justify-end">{escena(p)}</div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Barra de progreso + puntos de capítulo                               */
/* ------------------------------------------------------------------ */
function Progreso({ capitulos }: { capitulos: Capitulo[] }) {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 30 });
  const [activo, setActivo] = useState(-1);
  useEffect(() => {
    const els = capitulos.map((c) => document.getElementById(slug(c.titulo)));
    const f = () => {
      let a = -1;
      els.forEach((e, i) => {
        if (e && e.getBoundingClientRect().top < innerHeight * 0.5) a = i;
      });
      setActivo(a);
    };
    f();
    addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, [capitulos]);
  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left" style={{ scaleX: x, background: `linear-gradient(90deg, ${C.azul2}, ${C.mag})` }} />
      <nav aria-label="Capítulos" className="fixed right-5 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        {capitulos.map((c, i) => (
          <a key={c.titulo} href={`#${slug(c.titulo)}`} className="group flex items-center justify-end gap-3" aria-label={sinNumero(c.titulo)}>
            <span className="pointer-events-none translate-x-2 whitespace-nowrap rounded-[8px] bg-[#0A0E27] px-2.5 py-1 text-[12px] text-white opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">{sinNumero(c.titulo)}</span>
            <span className="block h-2 w-2 rounded-full border transition-all" style={{ borderColor: i <= activo ? C.mag : "#b9bfdc", background: i === activo ? C.mag : "transparent", transform: i === activo ? "scale(1.5)" : "none" }} />
          </a>
        ))}
      </nav>
    </>
  );
}

/* ------------------------------------------------------------------ */
export default function GuiaCine({ titulo, bajada, intro, capitulos, cifras }: { titulo: string; bajada: string; intro: string; capitulos: Capitulo[]; cifras: { v: number; d: number; pie: string }[] }) {
  const escenas: ((p: MotionValue<number>) => ReactNode)[] = [
    (p) => <EscenaPregunta p={p} />,
    (p) => <EscenaFicha p={p} />,
    (p) => <EscenaCalientes p={p} />,
    (p) => <EscenaCifras p={p} cifras={cifras} />,
    (p) => <EscenaDosLados p={p} />,
    (p) => <EscenaCiclo p={p} />,
  ];
  return (
    <div className="guia-cine bg-white text-[#0e1745]">
      <Progreso capitulos={capitulos} />
      <Portada titulo={titulo} bajada={bajada} capitulos={capitulos} />
      {intro && (
        <section className="mx-auto max-w-[760px] px-6 py-24 md:py-32">
          <div className="g-texto g-intro">
            <Markdown md={intro} />
          </div>
        </section>
      )}
      {capitulos.map((c, i) => (
        <div key={c.titulo}>
          <Apertura i={i} titulo={c.titulo} escena={escenas[i] ?? escenas[0]} />
          <section className="mx-auto max-w-[760px] px-6 py-20 md:py-28">
            <div className="g-texto">
              <Markdown md={c.cuerpo} />
            </div>
          </section>
        </div>
      ))}
      <Cierre />
      <style>{CSS}</style>
    </div>
  );
}

function Cierre() {
  return (
    <section className="relative overflow-hidden py-32 md:py-44" style={{ background: C.noche }}>
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <Anillos />
      </div>
      <div className="relative z-10 mx-auto max-w-[1180px] px-6 md:px-10">
        <Entra>
          <h2 className="max-w-[820px] text-[40px] font-extrabold leading-[1.02] tracking-[-0.03em] text-white md:text-[72px] [font-family:var(--font-figtree)]">
            Ahora mira qué dicen <span style={{ color: C.cian }}>de tu marca</span>.
          </h2>
        </Entra>
        <Entra d={0.15}>
          <p className="mt-6 max-w-[560px] text-[18px] leading-relaxed text-white/65">Siete IA y 30 días de redes y medios de tu país. Gratis, con tu correo de trabajo. El reporte te llega en minutos.</p>
        </Entra>
        <Entra d={0.3}>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/shift-lab/escucha-gratis" className="rounded-[14px] bg-[#1534DC] px-7 py-4 text-[16px] font-semibold text-white transition hover:bg-[#2a47f0] [font-family:var(--font-figtree)]">Pedir mi reporte</Link>
            <Link href="/shift-lab/escucha-ia" className="rounded-[14px] border border-white/20 px-7 py-4 text-[16px] font-semibold text-white/85 transition hover:border-white/50 [font-family:var(--font-figtree)]">Solo IA, con Eco</Link>
          </div>
        </Entra>
      </div>
    </section>
  );
}

const CSS = `
.g-texto h3{font-family:var(--font-figtree);font-size:clamp(24px,2.6vw,32px);line-height:1.12;font-weight:800;letter-spacing:-.02em;margin:64px 0 16px;color:#0e1745;scroll-margin-top:110px}
.g-texto h4{font-family:var(--font-figtree);font-size:18px;font-weight:700;margin:32px 0 8px}
.g-texto p,.g-texto li{font-size:18px;line-height:1.8;color:#2c3566}
.g-texto p{margin:0 0 20px}
.g-intro p{font-size:22px;line-height:1.6;color:#0e1745}
.g-intro ol{display:none}
.g-texto ul,.g-texto ol{margin:0 0 22px;padding-left:22px}
.g-texto ul{list-style:disc}.g-texto ol{list-style:decimal}
.g-texto li{margin:8px 0}
.g-texto li::marker{color:#F540FF}
.g-texto strong{color:#0e1745}
.g-texto a{color:#1534dc;text-decoration:underline;text-underline-offset:3px}
.g-texto hr{border:0;height:1px;background:#e3e5f1;margin:56px 0}
.g-tabla{margin:28px -24px 32px;overflow-x:auto;padding:0 24px}
.g-texto table{width:100%;border-collapse:collapse;font-size:15px}
.g-texto th{text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:#858eb4;border-bottom:1px solid #0e1745;padding:10px}
.g-texto td{border-bottom:1px solid #e3e5f1;padding:12px 10px;color:#2c3566}
.g-texto blockquote{margin:48px -8vw;padding:0 8vw;border:0}
.g-texto blockquote p{font-family:var(--font-figtree);font-size:clamp(26px,3.4vw,40px);line-height:1.18;font-weight:800;letter-spacing:-.02em;color:#0e1745}
@media(max-width:768px){.g-texto blockquote{margin:36px 0;padding:0 0 0 16px;border-left:3px solid #F540FF}}
`;
