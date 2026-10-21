"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { CASAS } from "@/lib/escucha/casas";
import { EJEMPLO_ECO as EJEMPLO, LOGO_NIKE, foto } from "@/components/escucha/MarcaEjemplo";
import { CreditosFotos } from "@/components/escucha/CreditosFotos";
import { ECO_REAL, FECHA_DATOS } from "@/lib/escucha/datos-reales";

/* Eco por dentro: lo que ninguna otra herramienta de «visibilidad» hace,
 * mostrado con pantallas fieles a la app (mismos tokens) y una marca de
 * ejemplo inventada. Siempre visible: no depende de lanzar la escucha. */

const ease = [0.22, 1, 0.36, 1] as const;
const T = { tinta: "#0e1745", suave: "#4a5488", tenue: "#858eb4", linea: "#e3e5f1", azul: "#1534dc", mag: "#f540ff", verde: "#12a150", rojo: "#e5484d" };
const mono = "[font-family:var(--font-fira-mono),ui-monospace,monospace]";

function Ia({ k, s = 14 }: { k: string; s?: number }) {
  const c = CASAS.find((x) => x.key === k);
  if (!c) return null;
  return <span title={c.nombre} className="inline-grid shrink-0 place-items-center" style={{ width: s, height: s, color: k === "gpt" || k === "grok" ? T.tinta : c.color }} dangerouslySetInnerHTML={{ __html: c.svg }} />;
}

/* La interfaz se dibuja a su tamaño real y se amplía con zoom (no es una captura):
 * en escritorio ~1,5×, nítida, como un acercamiento de cámara a la app. */
function Ventana({ titulo, ruta, children }: { titulo: string; ruta: string; children: ReactNode }) {
  return (
    <div className="eco-zoom">
    <div className="overflow-hidden rounded-[14px] border bg-white shadow-[0_30px_70px_-40px_rgba(14,23,69,0.45)]" style={{ borderColor: T.linea }}>
      <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: T.linea }}>
        <span className="flex items-center gap-2">
          <img src="/escucha/eco/eco-logo.svg" alt="Shift Eco" className="h-3.5 w-auto" />
          <span className="h-3.5 w-px" style={{ background: T.linea }} />
          <img src={LOGO_NIKE} alt={EJEMPLO.marca} className="h-3 w-auto" />
          <span className={`text-[10px] uppercase tracking-[0.12em] ${mono}`} style={{ color: T.tenue }}>{ruta}</span>
        </span>
        <span className="hidden text-[13px] font-semibold sm:block" style={{ color: T.tinta }}>{titulo}</span>
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
    </div>
  );
}

/* 1 · Exactitud: la respuesta real de una IA, con cada dato contrastado contra las fuentes de la marca. */
function PantallaExactitud() {
  const partes: { t: string; ok?: boolean; verdad?: string }[] = [
    { t: "Nike es una marca estadounidense de ropa deportiva " },
    { t: "fundada en 1972", ok: false, verdad: "Nació en 1964 como Blue Ribbon Sports" },
    { t: ", con " },
    { t: "sede en Portland", ok: false, verdad: "La sede está en Beaverton, Oregón" },
    { t: ". Para correr, su modelo más conocido es " },
    { t: "la Pegasus", ok: true },
    { t: ". Una alternativa con más amortiguación es Hoka." },
  ];
  return (
    <Ventana titulo="Exactitud" ruta="respuestas">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold" style={{ borderColor: T.linea, color: T.tinta }}>
          <Ia k="gpt" s={12} /> ChatGPT
        </span>
        <span className={`text-[10px] uppercase tracking-[0.1em] ${mono}`} style={{ color: T.tenue }}>¿Qué me puedes decir de Nike?</span>
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,1fr)_128px]">
      <p className="text-[14.5px] leading-[1.75]" style={{ color: T.tinta }}>
        {partes.map((p, i) =>
          p.ok === undefined ? (
            <span key={i}>{p.t}</span>
          ) : (
            <motion.span
              key={i}
              initial={{ backgroundColor: "rgba(0,0,0,0)" }}
              whileInView={{ backgroundColor: p.ok ? "rgba(18,161,80,0.12)" : "rgba(229,72,77,0.12)" }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
              className="rounded-[4px] px-0.5"
              style={{ boxShadow: `inset 0 -2px 0 ${p.ok ? T.verde : T.rojo}` }}
            >
              {p.t}
            </motion.span>
          ),
        )}
      </p>
      <figure className="hidden sm:block">
        <img src={foto("pegasus")} alt="Nike Zoom Pegasus 38" className="aspect-square w-full rounded-[10px] object-cover" />
        <figcaption className={`mt-1 text-[9.5px] uppercase tracking-[0.08em] ${mono}`} style={{ color: T.tenue }}>Pegasus 38 · ✓ dato correcto</figcaption>
      </figure>
      </div>
      <ul className="mt-4 space-y-2 border-t pt-3" style={{ borderColor: T.linea }}>
        {partes.filter((p) => p.ok !== undefined).map((p, i) => (
          <motion.li key={i} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.8 + i * 0.12, ease }} className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-2 text-[13px]">
            <span className="mt-0.5 grid h-4 w-4 place-items-center rounded-full text-[10px] font-bold text-white" style={{ background: p.ok ? T.verde : T.rojo }}>{p.ok ? "✓" : "!"}</span>
            <span style={{ color: T.suave }}>
              <b style={{ color: T.tinta }}>«{p.t}»</b> {p.ok ? "coincide con tu ficha de marca." : <>no coincide. <span style={{ color: T.tinta }}>{p.verdad}</span>, según tu ficha de marca.</>}
            </span>
          </motion.li>
        ))}
      </ul>
    </Ventana>
  );
}

/* 2 · Pregunta por pregunta: dónde la IA te nombra, en cuál y quién ocupa tu lugar. */
const PREGUNTAS: { q: string; ias: Record<string, boolean>; lugar: string; res?: { f: string; t: string } }[] = [
  { q: "¿Cuáles son las mejores zapatillas para correr?", ias: { gpt: true, gemini: true, claude: true, perplexity: true, meta: true }, lugar: "", res: { f: "pegasus", t: "Las 5 IA recomiendan la Pegasus como la opción para todos los días." } },
  { q: "Zapatillas para maratón con buena amortiguación", ias: { gpt: false, gemini: true, claude: false, perplexity: false, meta: true }, lugar: "Asics", res: { f: "vaporfly", t: "Gemini y Meta AI nombran la Vaporfly. ChatGPT, Claude y Perplexity responden con Asics." } },
  { q: "Tenis cómodos para trabajar de pie todo el día", ias: { gpt: false, gemini: false, claude: true, perplexity: false, meta: false }, lugar: "Skechers", res: { f: "airmax90", t: "Solo Claude nombra la Air Max 90. Las demás recomiendan Skechers." } },
  { q: "¿Qué marca deportiva es más sostenible?", ias: { gpt: false, gemini: false, claude: false, perplexity: false, meta: false }, lugar: "Adidas" },
];
function PantallaPreguntas() {
  const orden = ["gpt", "gemini", "claude", "perplexity", "meta"];
  return (
    <Ventana titulo="Dónde no apareces" ruta="brechas">
      <div className={`hidden grid-cols-[minmax(0,1fr)_118px_104px] gap-3 border-b pb-2 text-[10px] uppercase tracking-[0.1em] sm:grid ${mono}`} style={{ borderColor: T.linea, color: T.tenue }}>
        <span>Pregunta del cliente</span>
        <span>Te nombra</span>
        <span>En tu lugar</span>
      </div>
      {PREGUNTAS.map((p, i) => {
        const n = orden.filter((k) => p.ias[k]).length;
        return (
          <motion.div key={p.q} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.1, ease }} className="grid grid-cols-1 gap-2 border-b py-3 last:border-0 sm:grid-cols-[minmax(0,1fr)_118px_104px] sm:items-center sm:gap-3" style={{ borderColor: T.linea }}>
            <span className="text-[13.5px] leading-snug" style={{ color: T.tinta }}>{p.q}</span>
            <span className="flex items-center gap-1.5">
              {orden.map((k) => (
                <span key={k} className="grid h-[16px] w-[16px] place-items-center" style={{ opacity: p.ias[k] ? 1 : 0.22, filter: p.ias[k] ? "none" : "grayscale(1)" }}>
                  <Ia k={k} s={14} />
                </span>
              ))}
              <span className={`ml-1 text-[11px] ${mono}`} style={{ color: n === 0 ? T.mag : T.tenue }}>{n}/5</span>
            </span>
            <span className="text-[12.5px] font-semibold" style={{ color: p.lugar ? T.mag : T.verde }}>
              <span className="font-normal sm:hidden" style={{ color: T.tenue }}>En tu lugar: </span>
              {p.lugar || "Nadie"}
            </span>
            {p.res && (
              <span className="flex items-center gap-3 sm:col-span-3">
                <img src={foto(p.res.f)} alt="" className="h-11 w-14 shrink-0 rounded-[6px] object-cover" />
                <span className="text-[12px] leading-snug" style={{ color: T.suave }}>{p.res.t}</span>
              </span>
            )}
          </motion.div>
        );
      })}
    </Ventana>
  );
}

/* 3 · Fuentes: qué sitios lee la IA para responder tu categoría y cuáles te nombran. */
const FUENTES = [
  { d: "runrepeat.com", tipo: "Reseñas", te: true, ias: ["gpt", "perplexity", "gemini"], uso: 24.1 },
  { d: "reddit.com", tipo: "Foro", te: false, ias: ["gpt", "perplexity", "claude", "gemini"], uso: 21.7 },
  { d: "youtube.com", tipo: "Video", te: false, ias: ["gemini", "perplexity"], uso: 17.3 },
  { d: "runnersworld.com", tipo: "Medio", te: true, ias: ["gpt", "claude", "gemini"], uso: 12.9 },
  { d: "nike.com", tipo: "Tu sitio", te: true, ias: ["perplexity"], uso: 4.2 },
];
function PantallaFuentes() {
  return (
    <Ventana titulo="Fuentes que lee la IA" ruta="fuentes">
      <div className={`grid grid-cols-[minmax(0,1fr)_88px_56px] gap-3 border-b pb-2 text-[10px] uppercase tracking-[0.1em] sm:grid-cols-[minmax(0,1fr)_84px_70px_78px_52px] ${mono}`} style={{ borderColor: T.linea, color: T.tenue }}>
        <span>Dominio</span>
        <span className="hidden sm:block">Tipo</span>
        <span>Te nombra</span>
        <span className="hidden sm:block">La usan</span>
        <span className="text-right">Uso</span>
      </div>
      {FUENTES.map((f, i) => (
        <motion.div key={f.d} initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.08, ease }} className="grid grid-cols-[minmax(0,1fr)_88px_56px] items-center gap-3 border-b py-2.5 last:border-0 sm:grid-cols-[minmax(0,1fr)_84px_70px_78px_52px]" style={{ borderColor: T.linea }}>
          <span className="truncate text-[13.5px] font-semibold" style={{ color: f.tipo === "Tu sitio" ? T.azul : T.tinta }}>{f.d}</span>
          <span className="hidden sm:block"><span className="rounded-full border px-2 py-0.5 text-[11px]" style={{ borderColor: T.linea, color: T.suave }}>{f.tipo}</span></span>
          <span className="text-[12px] font-semibold" style={{ color: f.te ? T.verde : T.mag }}>{f.te ? "Sí" : "No"}</span>
          <span className="hidden items-center gap-1 sm:flex">{f.ias.map((k) => <Ia key={k} k={k} s={12} />)}</span>
          <span className={`text-right text-[12.5px] ${mono}`} style={{ color: T.tinta }}>{f.uso.toFixed(1).replace(".", ",")}%</span>
        </motion.div>
      ))}
      <p className="mt-3 rounded-[10px] px-3 py-2 text-[12.5px]" style={{ background: "#fdf0ff", color: T.tinta }}>
        <b>Oportunidad:</b> reddit.com y youtube.com pesan el 39% de las citas y no te nombran.
      </p>
    </Ventana>
  );
}

/* 4 · Acciones: el agente propone, tu equipo ejecuta con un clic. */
function PantallaAcciones() {
  const items = [
    { tipo: "Contenido", t: "Publica una guía: «Zapatillas para maratón: cómo elegir la amortiguación»", p: "Cierra la brecha en 3 de 5 IA. Hoy responden con Asics." },
    { tipo: "Corrección", t: "Corrige el año de fundación en las páginas que la IA cita", p: "ChatGPT y Meta AI repiten «1972». El error viene de un blog de 2019 que cita Perplexity." },
    { tipo: "Presencia", t: "Entra al hilo de Reddit «Best marathon shoes for flat feet»", p: "Es la fuente más citada de la pregunta y no te menciona." },
  ];
  return (
    <Ventana titulo="Qué hacer primero" ruta="acciones">
      {items.map((x, i) => (
        <motion.div key={x.t} initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.1, ease }} className="border-b py-3 first:pt-0 last:border-0 last:pb-0" style={{ borderColor: T.linea }}>
          <span className={`text-[10px] uppercase tracking-[0.12em] ${mono}`} style={{ color: T.azul }}>{x.tipo}</span>
          <p className="mt-1 text-[14px] font-semibold leading-snug" style={{ color: T.tinta }}>{x.t}</p>
          <p className="mt-1 text-[12.5px]" style={{ color: T.suave }}>{x.p}</p>
          <div className="mt-2.5 flex gap-2">
            <span className="rounded-[6px] px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: T.azul }}>Empezar</span>
            <span className="rounded-[6px] border px-2.5 py-1 text-[11px]" style={{ borderColor: T.linea, color: T.suave }}>Descartar</span>
          </div>
        </motion.div>
      ))}
    </Ventana>
  );
}

const FILAS = [
  { t: "Exactitud verificada", d: "Contar menciones no te dice si la IA habla bien de ti. Eco contrasta cada dato que dicen de tu marca contra tus fuentes y marca lo que está mal, en qué IA y desde cuándo.", cifra: `${((ECO_REAL.conError / ECO_REAL.respuestasTotales) * 100).toFixed(1).replace(".", ",")}%`, pie: "de las respuestas que medimos trae al menos un dato equivocado de la marca", P: PantallaExactitud },
  { t: "Pregunta por pregunta", d: "Tu presencia no es un número: es cada pregunta que hace un cliente. Eco te muestra en cuáles apareces, en qué IA y quién ocupa tu lugar cuando no estás.", cifra: `${((ECO_REAL.noNombradaConCompetidor / ECO_REAL.noNombrada) * 100).toFixed(1).replace(".", ",")}%`, pie: "de las respuestas sin la marca recomiendan a un competidor", P: PantallaPreguntas },
  { t: "Las fuentes detrás de la respuesta", d: "La IA responde con lo que lee. Eco te dice qué sitios consulta para tu categoría, cuáles te nombran y dónde te conviene estar.", cifra: `${((ECO_REAL.citada / ECO_REAL.respuestas) * 100).toFixed(1).replace(".", ",")}%`, pie: "de las respuestas enlaza al sitio de la marca", P: PantallaFuentes },
];

function Bloque({ kicker, titulo, sub, children }: { kicker: string; titulo: ReactNode; sub: string; children: ReactNode }) {
  return (
    <section className="eco-section border-t" style={{ borderColor: T.linea }}>
      <div className="eco-wrap">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eco-kicker">{kicker}</p>
          <h2 className="eco-h2 mt-4">{titulo}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed" style={{ color: T.suave }}>{sub}</p>
        </div>
        <div className="mt-14 border-t" style={{ borderColor: T.linea }}>{children}</div>
      </div>
    </section>
  );
}

function Fila({ t, d, cifra, pie, P }: { t: string; d: string; cifra?: string; pie?: string; P: () => React.JSX.Element }) {
  return (
    <div className="grid gap-8 border-b py-12 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:gap-14 md:py-16" style={{ borderColor: T.linea }}>
      <div className="lg:pt-2">
        <h3 className="eco-h3">{t}</h3>
        <p className="mt-3 max-w-md text-[16px] leading-relaxed" style={{ color: T.suave }}>{d}</p>
        {cifra && (
          <p className="mt-6 max-w-md text-[14px] leading-relaxed" style={{ color: T.suave }}>
            <b className="mr-1 text-[30px] font-extrabold tracking-tight [font-family:var(--font-figtree)]" style={{ color: T.tinta }}>{cifra}</b>
            {pie}
          </p>
        )}
      </div>
      <P />
    </div>
  );
}

export default function EcoPorDentro() {
  return (
    <>
      <style>{`.eco-zoom{--z:1.12;zoom:var(--z)}@media(min-width:1024px){.eco-zoom{--z:1.45}}`}</style>
      <Bloque kicker="Eco por dentro" titulo={<>No solo cuántas veces <span style={{ color: T.azul }}>te nombran</span></>} sub="La mayoría de las herramientas cuenta menciones. Eco revisa qué dice la IA de ti, pregunta por pregunta, y de dónde lo sacó.">
        {FILAS.map((f) => <Fila key={f.t} {...f} />)}
        <p className={`py-4 text-[12px] ${mono}`} style={{ color: T.tenue }}>{EJEMPLO.rotulo} Cifras de la región: medido por Eco, {FECHA_DATOS}.</p>
        <CreditosFotos />
      </Bloque>
      <Bloque kicker="Del dato a la acción" titulo={<>Saber dónde fallas <span style={{ color: T.mag }}>no basta</span></>} sub="Eco convierte cada brecha en una tarea concreta. El agente propone; tu equipo ejecuta con un clic.">
        <Fila t="Qué hacer primero" d="Cada semana, Eco ordena las acciones por impacto: qué publicar, qué corregir y dónde estar para que la IA te nombre. Con la razón y la fuente de cada una." P={PantallaAcciones} />
      </Bloque>
    </>
  );
}
