"use client";

import EcoPorDentro from "./EcoPorDentro";
import { FAQ_ECO } from "@/lib/escucha/faq";
import EscenaEco from "./EscenaEco";
import Copiloto from "@/components/escucha/Copiloto";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Confirmacion, useSolicitud } from "@/components/escucha/PedirReporte";
import { useCampoMarca } from "@/components/escucha/CampoMarca";
import { CASAS } from "@/lib/escucha/casas";
import { enlaceDossier, escuchaInicial, registrarLead, type ResIA } from "@/lib/escucha/cliente";
import { alternativasNombradas, datosEnDisputa } from "@/lib/escucha/lectura";
import { ECO_REAL, EJEMPLO_MEMORIA_VS_BUSQUEDA, FECHA_DATOS } from "@/lib/escucha/datos-reales";
import { PAISES, paisDelNavegador, paisPorCc } from "@/lib/escucha/paises";
import "./eco.css";

const pct = (a: number, b: number) => (b ? ((a / b) * 100).toLocaleString("es-CR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : "0");
const tinta = (key: string, color: string) => (key === "gpt" || key === "grok" ? "#0e1745" : color);
const casa = (key: string) => CASAS.find((c) => c.key === key);
const FUENTE = `Medido por Eco, ${FECHA_DATOS}`;
const ease = [0.22, 1, 0.36, 1] as const;

function recortar(s: string, n = 240) {
  const t = s.replace(/\s+/g, " ").replace(/[*#_`]/g, "").trim();
  if (t.length <= n) return t;
  const corte = t.slice(0, n);
  return corte.slice(0, corte.lastIndexOf(" ")).replace(/[,;:.]$/, "") + "…";
}

function Logo({ k, size = 22, apagado = false }: { k: string; size?: number; apagado?: boolean }) {
  const c = casa(k);
  if (!c) return null;
  return (
    <span
      aria-hidden
      className="eco-logo"
      style={{ width: size, height: size, color: apagado ? "#c3c8dd" : tinta(c.key, c.color) }}
      dangerouslySetInnerHTML={{ __html: c.svg }}
    />
  );
}

/* ---------- Radar: el motivo de Eco, con las siete IA en órbita ---------- */
function Radar({ fase, resultados }: { fase: string; resultados?: ResIA[] }) {
  const [paso, setPaso] = useState(0);
  useEffect(() => {
    if (fase !== "corriendo") return;
    const id = setInterval(() => setPaso((p) => p + 1), 900);
    return () => clearInterval(id);
  }, [fase]);
  return (
    <div className={`eco-radar ${fase === "corriendo" ? "is-busy" : ""}`} aria-hidden>
      <span className="eco-radar__ring" />
      <span className="eco-radar__ring" />
      <span className="eco-radar__ring" />
      <span className="eco-radar__grid" />
      <span className="eco-radar__sweep" />
      <span className="eco-radar__core">
        <img src="/escucha/eco/eco-logo.svg" alt="" />
      </span>
      {CASAS.map((c, i) => {
        const ang = (i / CASAS.length) * Math.PI * 2 - Math.PI / 2;
        const r = resultados?.find((x) => x.key === c.key);
        const activo = fase === "corriendo" ? paso % CASAS.length === i : false;
        const apagado = fase === "listo" && r ? !r.conoce : false;
        return (
          <span
            key={c.key}
            className={`eco-radar__node ${activo ? "is-on" : ""} ${apagado ? "is-off" : ""}`}
            style={{ left: `${50 + Math.cos(ang) * 41}%`, top: `${50 + Math.sin(ang) * 41}%` }}
          >
            <Logo k={c.key} size={26} apagado={apagado} />
          </span>
        );
      })}
    </div>
  );
}

const PASOS = [
  "Le preguntamos a las siete IA, en paralelo",
  "Cada una busca en la web y responde",
  "Leemos si te conoce y si te nombra",
  "Buscamos a quién recomiendan en tu lugar",
  "Comparamos los datos que dan de ti",
];

function Corriendo({ marca }: { marca: string }) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const id = setInterval(() => setS(Math.floor((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(id);
  }, []);
  const i = Math.min(PASOS.length - 1, Math.floor(s / 8));
  return (
    <div className="mt-8 border-t border-[#e3e5f1] pt-6" role="status" aria-live="polite">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#1534dc] [font-family:var(--font-figtree)]">
        Escuchando a la IA sobre {marca} · {s} s
      </p>
      <ol className="mt-4 space-y-2">
        {PASOS.map((p, k) => (
          <li key={p} className={`flex items-center gap-3 text-[15px] transition-colors duration-500 ${k < i ? "text-[#858eb4]" : k === i ? "text-[#0e1745]" : "text-[#c3c8dd]"}`}>
            <span className={`eco-step ${k < i ? "is-done" : k === i ? "is-now" : ""}`} />
            {p}
          </li>
        ))}
      </ol>
      <div className="mt-5 h-[3px] w-full overflow-hidden bg-[#e3e5f1]">
        <div className="h-full bg-[#1534dc] transition-[width] duration-500 ease-out" style={{ width: `${Math.min(96, (s / 40) * 100)}%` }} />
      </div>
    </div>
  );
}

/* ---------- El reporte ---------- */
export function Reporte({ marca, cc, resultados, crudo }: { marca: string; cc: string; resultados: ResIA[]; crudo?: { key: string; answer: string; error?: boolean }[] }) {
  const pais = paisPorCc(cc);
  const validos = resultados.filter((r) => !r.error);
  const conocen = validos.filter((r) => r.conoce);
  const noConocen = validos.filter((r) => !r.conoce);
  const alternativas = useMemo(() => alternativasNombradas(resultados, marca), [resultados, marca]);
  const disputa = useMemo(() => datosEnDisputa(resultados), [resultados]);
  const [abierta, setAbierta] = useState<string | null>(null);

  const veredicto =
    conocen.length === validos.length
      ? "Todas las IA te conocen. Ahora la pregunta es si dicen lo correcto."
      : conocen.length === 0
        ? "Ninguna IA te conoce todavía. Para la persona que pregunta, no existes."
        : `${noConocen.length} de cada ${validos.length} conversaciones sobre ${marca} terminan sin tu marca.`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease }}
      className="eco-report"
      id="reporte"
      aria-label={`Reporte de ${marca}`}
    >
      {/* Encabezado del reporte */}
      <div className="grid gap-10 border-b border-[#e3e5f1] pb-12 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div>
          <p className="eco-kicker">Reporte de Eco · {marca} · {pais.nombre}</p>
          <p className="mt-6 flex items-baseline gap-3 [font-family:var(--font-figtree)]">
            <span className="eco-giant">{conocen.length}</span>
            <span className="text-[44px] font-semibold text-[#858eb4] md:text-[64px]">/ {validos.length}</span>
          </p>
          <p className="mt-2 text-[22px] font-semibold leading-tight text-[#0e1745] md:text-[28px] [font-family:var(--font-figtree)]">
            inteligencias artificiales conocen {marca}
          </p>
        </div>
        <div>
          <p className="text-[18px] leading-relaxed text-[#4a5488]">{veredicto}</p>
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
            {validos.map((r) => (
              <li key={r.key} className="flex items-center gap-2 text-[14px]">
                <Logo k={r.key} size={18} apagado={!r.conoce} />
                <span className={r.conoce ? "text-[#0e1745]" : "text-[#858eb4] line-through decoration-[#f540ff]"}>{casa(r.key)?.nombre}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Qué dice cada una */}
      <div className="grid gap-8 py-12 lg:grid-cols-[280px_1fr]">
        <div>
          <h3 className="eco-h3">Qué responde cada una</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-[#4a5488]">La misma pregunta, con búsqueda web, como la haría un cliente en {pais.nombre}.</p>
        </div>
        <ul className="divide-y divide-[#e3e5f1] border-y border-[#e3e5f1]">
          {resultados.map((r, i) => {
            const c = casa(r.key);
            const open = abierta === r.key;
            const texto = r.error ? "No respondió a tiempo en esta escucha." : open ? r.answer.replace(/[*#_`]/g, "") : recortar(r.answer);
            return (
              <motion.li
                key={r.key}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease }}
                className="grid gap-3 py-5 md:grid-cols-[170px_1fr] md:gap-6"
              >
                <div className="flex items-center gap-3 md:items-start">
                  <Logo k={r.key} size={24} apagado={!r.conoce} />
                  <div>
                    <p className="text-[16px] font-semibold text-[#0e1745] [font-family:var(--font-figtree)]">{c?.nombre}</p>
                    <p className={`text-[13px] font-medium ${r.error ? "text-[#858eb4]" : r.conoce ? "text-[#1534dc]" : "text-[#b01cbd]"}`}>
                      {r.error ? "Sin respuesta" : r.conoce ? (r.nombra ? "Te conoce y te nombra" : "Te conoce") : "No te conoce"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="whitespace-pre-line text-[15px] leading-relaxed text-[#4a5488]">{texto}</p>
                  {!r.error && r.answer.length > 240 && (
                    <button type="button" onClick={() => setAbierta(open ? null : r.key)} className="eco-link mt-2 text-[14px]">
                      {open ? "Ver menos" : "Leer la respuesta completa"}
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Alternativas y datos en disputa */}
      {(alternativas.length > 0 || disputa.length > 0) && (
        <div className="grid gap-12 border-t border-[#e3e5f1] py-12 lg:grid-cols-2">
          {alternativas.length > 0 && (
            <div>
              <h3 className="eco-h3">A quién recomiendan en tu lugar</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#4a5488]">Marcas que nombran dos o más IA cuando hablan de tu categoría. Es la competencia que la IA ya tiene en la cabeza.</p>
              <ul className="mt-6 space-y-3">
                {alternativas.map((a) => (
                  <li key={a.nombre} className="grid grid-cols-[1fr_auto] items-center gap-4">
                    <div>
                      <p className="text-[17px] font-semibold text-[#0e1745] [font-family:var(--font-figtree)]">{a.nombre}</p>
                      <div className="mt-1.5 h-[6px] bg-[#edeffb]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${(a.ias / validos.length) * 100}%` }} transition={{ duration: 0.9, ease, delay: 0.3 }} className="h-full bg-[#f540ff]" />
                      </div>
                    </div>
                    <span className="text-[14px] tabular-nums text-[#4a5488]">{a.ias} de {validos.length}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {disputa.length > 0 && (
            <div>
              <h3 className="eco-h3">Donde no se ponen de acuerdo</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#4a5488]">Si dos IA dan un dato distinto sobre ti, por lo menos una se equivoca. Eso es lo que repite a cada persona que pregunta.</p>
              <div className="mt-6 space-y-6">
                {disputa.map((d) => (
                  <div key={d.tema}>
                    <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#858eb4] [font-family:var(--font-figtree)]">{d.tema}</p>
                    <div className="mt-2 flex flex-wrap gap-x-8 gap-y-3">
                      {d.valores.map((v) => (
                        <div key={v.valor}>
                          <p className="text-[34px] font-bold leading-none text-[#0e1745] [font-family:var(--font-figtree)]">{v.valor}</p>
                          <p className="mt-2 flex gap-1.5">
                            {v.ias.map((k) => (
                              <Logo key={k} k={k} size={16} />
                            ))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <ConEcoCompleto marca={marca} pais={pais} crudo={crudo} conocen={conocen.length} total={validos.length} alternativas={alternativas.map((a) => a.nombre)} disputas={disputa.length} />
    </motion.section>
  );
}

const MEDICION = [
  ["Cientos de preguntas", "Las que hace tu cliente en tu categoría, no solo tu nombre. Ahí se gana o se pierde la recomendación."],
  ["Presencia con intervalo", "Qué parte de las respuestas te nombra, con su margen de error, semana a semana y por IA."],
  ["Exactitud contra fuentes", "Cada dato que la IA dice de ti, verificado contra tus fuentes oficiales. Lo que está mal, señalado."],
  ["Competidores", "Quién aparece cuando tú no, en qué preguntas y con qué argumentos."],
  ["Fuentes que citan", "Qué sitios lee la IA para hablar de ti, y cuáles conviene trabajar para cambiar la respuesta."],
];

function ConEcoCompleto(p: { marca: string; pais: ReturnType<typeof paisPorCc>; crudo?: { key: string; answer: string; error?: boolean }[]; conocen: number; total: number; alternativas: string[]; disputas: number }) {
  const [panel, setPanel] = useState(false);
  const [correo, setCorreo] = useState("");
  const [envio, setEnvio] = useState<"no" | "enviando" | "ok" | "fallo">("no");

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(correo)) return;
    window.open(enlaceDossier(p.marca, p.pais.nombre, p.crudo), "_blank", "noopener");
    setEnvio("enviando");
    const idea = `Escucha gratis en IA (Eco) · ${p.marca} · ${p.pais.nombre}. La conocen ${p.conocen} de ${p.total} IA.${p.alternativas.length ? ` Alternativas nombradas: ${p.alternativas.join(", ")}.` : ""}${p.disputas ? ` Datos en disputa: ${p.disputas}.` : ""} Pidió la demo completa.`;
    const ok = await registrarLead(p.pais.hub, correo, idea);
    setEnvio(ok ? "ok" : "fallo");
  }

  return (
    <div className="eco-full">
      <div className="eco-full__radar" aria-hidden>
        <span /><span /><span />
      </div>
      <div className="relative grid gap-10 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="eco-kicker !text-[#9fb0ff]">Esto fue una pregunta</p>
          <h3 className="mt-4 text-[34px] font-bold leading-[1.05] text-white md:text-[48px] [font-family:var(--font-figtree)]">
            Con Eco medimos {p.marca} con cientos.
          </h3>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-white/70">
            La escucha gratis te muestra una foto. Eco te muestra la película: qué responde la IA en toda tu categoría, cada semana, y qué cambiar para que te recomiende.
          </p>
          <div className="mt-8">
            <button type="button" onClick={() => setPanel((v) => !v)} aria-expanded={panel} className="eco-btn eco-btn--light">
              {panel ? "Cerrar" : "Ver demo completa"}
              <span aria-hidden className={`transition-transform duration-300 ${panel ? "rotate-45" : ""}`}>+</span>
            </button>
          </div>
          <AnimatePresence initial={false}>
            {panel && (
              <motion.div
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease }}
                className="overflow-hidden"
              >
                <form onSubmit={pedir} className="mt-6 max-w-md border-t border-white/15 pt-6">
                  <label htmlFor="eco-correo" className="text-[15px] text-white/80">
                    Tu correo de trabajo. Abrimos el dossier de {p.marca} con estas respuestas y el equipo de Shift en {p.pais.nombre} te escribe una vez.
                  </label>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="eco-correo"
                      type="email"
                      required
                      autoComplete="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="nombre@empresa.com"
                      className="eco-input eco-input--dark flex-1"
                    />
                    <button type="submit" disabled={envio === "enviando"} className="eco-btn eco-btn--magenta">
                      {envio === "enviando" ? "Enviando…" : "Abrir el dossier"}
                    </button>
                  </div>
                  {envio === "ok" && <p className="mt-3 text-[14px] text-[#9fb0ff]">Listo. El dossier se abrió en otra pestaña y te escribimos pronto.</p>}
                  {envio === "fallo" && <p className="mt-3 text-[14px] text-white/70">El dossier se abrió en otra pestaña. No pudimos guardar tu correo: escríbenos desde la página de contacto.</p>}
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <ul className="border-t border-white/15">
          {MEDICION.map(([t, d]) => (
            <li key={t} className="grid gap-1 border-b border-white/15 py-4 sm:grid-cols-[200px_1fr] sm:gap-6">
              <p className="text-[16px] font-semibold text-white [font-family:var(--font-figtree)]">{t}</p>
              <p className="text-[15px] leading-relaxed text-white/65">{d}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Datos reales de Eco ---------- */
/* ---------- Lo que Eco ve a fondo: brechas y el resto del producto ---------- */
const MODULOS = [
  { i: "lectura", t: "Exactitud", d: "Lo que la IA dice de ti, contrastado con tus fuentes. Cada dato equivocado queda marcado con la respuesta y la IA que lo dijo.", cifra: () => `${pct(ECO_REAL.conError, ECO_REAL.respuestasTotales)}%`, pie: "de las respuestas trae al menos un dato que no coincide con la marca" },
  { i: "pin", t: "Fuentes", d: "Qué sitios lee la IA para hablar de tu categoría y cuáles te mencionan. Ahí se gana o se pierde la respuesta.", cifra: () => `${pct(ECO_REAL.citada, ECO_REAL.respuestas)}%`, pie: "de las respuestas enlaza al sitio de la marca" },
  { i: "nodos", t: "Competidores", d: "Pregunta por pregunta, quién aparece contigo, quién en tu lugar y en qué IA cada uno es más fuerte." },
  { i: "percepcion", t: "Percepción", d: "Con qué palabras te describe cada IA, en qué tono y qué atributos te asigna frente a tu competencia." },
  { i: "riesgo", t: "Riesgos", d: "Temas sensibles, datos viejos o afirmaciones peligrosas que la IA repite de tu marca, ordenados por gravedad." },
  { i: "checklist", t: "Acciones", d: "El agente propone qué publicar y dónde para cerrar cada brecha; tu equipo lo ejecuta con un clic." },
];

const PREGUNTAS_EJEMPLO = [
  { q: "¿Cuál es la mejor opción en mi ciudad?", tu: false, otro: "Competidor A" },
  { q: "¿Qué marca es más barata?", tu: false, otro: "Competidor B" },
  { q: "¿Es confiable [tu marca]?", tu: true, otro: "" },
  { q: "¿Qué alternativas hay a [tu marca]?", tu: true, otro: "Competidor A" },
  { q: "¿Dónde compro con envío a domicilio?", tu: false, otro: "Competidor C" },
];

function LoQueEcoVe() {
  return (
    <section className="eco-section border-t border-[#e3e5f1]" aria-labelledby="fondo">
      <div className="eco-wrap">
        <p className="eco-kicker">Eco completo</p>
        <h2 id="fondo" className="eco-h2 mt-4 max-w-4xl">Una pregunta es una foto. Eco mide todas las preguntas de tu categoría.</h2>

        {/* Brechas: el corazón */}
        <div className="mt-16 grid items-center gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/escucha/eco/iconos/brecha.webp" alt="" aria-hidden className="h-[150px] w-auto" loading="lazy" />
            <h3 className="eco-h3 mt-6">Brechas de contenido</h3>
            <p className="mt-3 max-w-md text-[16px] leading-relaxed text-[#4a5488]">
              Las preguntas donde la IA no te nombra, quién ocupa tu lugar y qué fuente le dio esa respuesta. Cada brecha viene con lo que habría que publicar para cerrarla.
            </p>
            <p className="eco-stat eco-stat--sm eco-stat--mag mt-8">{pct(ECO_REAL.noNombradaConCompetidor, ECO_REAL.noNombrada)}<span>%</span></p>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-[#4a5488]">de las respuestas sin la marca recomiendan a un competidor. Esas son brechas que alguien más está aprovechando.</p>
            <p className="mt-2 text-[13px] text-[#858eb4]">{FUENTE}</p>
          </div>
          <div className="border-t border-[#0e1745]">
            <div className="hidden grid-cols-[minmax(0,1fr)_86px_130px] gap-4 border-b border-[#e3e5f1] py-3 text-[12px] sm:grid font-semibold uppercase tracking-[0.1em] text-[#858eb4] [font-family:var(--font-figtree)]">
              <span>Pregunta</span>
              <span>Tu marca</span>
              <span>En tu lugar</span>
            </div>
            {PREGUNTAS_EJEMPLO.map((x, i) => (
              <motion.div
                key={x.q}
                initial={{ opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease, delay: i * 0.07 }}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 border-b border-[#e3e5f1] py-4 text-[15px] sm:grid-cols-[minmax(0,1fr)_86px_130px]"
              >
                <span className="col-span-2 text-[#0e1745] sm:col-span-1">{x.q}</span>
                <span className={x.tu ? "font-semibold text-[#1534dc]" : "font-semibold text-[#f540ff]"}>{x.tu ? "Aparece" : "Brecha"}</span>
                <span className="text-[#4a5488]"><span className="sm:hidden">En tu lugar: </span>{x.otro || "Nadie"}</span>
              </motion.div>
            ))}
            <p className="mt-3 text-[13px] text-[#858eb4]">Ejemplo del módulo de brechas. En Eco son cientos de preguntas, medidas cada semana en las 7 IA.</p>
          </div>
        </div>

        {/* El resto del producto */}
        <ul className="mt-24 grid gap-x-14 border-t border-[#e3e5f1] md:grid-cols-2">
          {MODULOS.map((m) => (
            <li key={m.t} className="grid grid-cols-[88px_minmax(0,1fr)] items-start gap-5 border-b border-[#e3e5f1] py-7">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/escucha/eco/iconos/${m.i}.webp`} alt="" aria-hidden className="h-[80px] w-[88px] object-contain" loading="lazy" />
              <div>
                <h3 className="text-[19px] font-bold text-[#0e1745] [font-family:var(--font-figtree)]">{m.t}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed text-[#4a5488]">{m.d}</p>
                {m.cifra && (
                  <p className="mt-3 text-[14px] text-[#4a5488]">
                    <b className="text-[22px] font-extrabold text-[#0e1745] [font-family:var(--font-figtree)]">{m.cifra()}</b> {m.pie}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-[#858eb4]">Cifras sobre {ECO_REAL.respuestasTotales.toLocaleString("es-CR")} respuestas de IA en {ECO_REAL.marcas} marcas de la región · {FUENTE}</p>
      </div>
    </section>
  );
}

function PorQueImporta() {
  const casas = Object.entries(ECO_REAL.porCasa)
    .filter(([k]) => k !== "grok")
    .map(([k, v]) => ({ k, t: v.nombrada / v.total }))
    .sort((a, b) => b.t - a.t);
  const ej = EJEMPLO_MEMORIA_VS_BUSQUEDA;
  return (
    <section className="eco-section" aria-labelledby="pq">
      <div className="eco-wrap">
        <p className="eco-kicker">Por qué importa</p>
        <h2 id="pq" className="eco-h2 mt-4 max-w-4xl">La IA es la nueva vitrina. La gente pregunta qué marca elegir, lee la respuesta y no hace clic.</h2>

        <div className="mt-16 grid gap-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="eco-stat">{pct(ECO_REAL.nombrada, ECO_REAL.respuestas)}<span>%</span></p>
            <p className="mt-4 max-w-lg text-[19px] leading-relaxed text-[#0e1745]">
              de las respuestas de IA nombran a la marca que medimos. En más de la mitad, la marca no está.
            </p>
            <p className="mt-3 text-[14px] text-[#858eb4]">
              {ECO_REAL.respuestas.toLocaleString("es-CR")} respuestas sobre {ECO_REAL.marcas} marcas de la región · {FUENTE}
            </p>
          </div>
          <div className="grid content-start gap-10 border-l-0 border-[#e3e5f1] lg:border-l lg:pl-12">
            <div>
              <p className="eco-stat eco-stat--sm">{pct(ECO_REAL.citada, ECO_REAL.respuestas)}<span>%</span></p>
              <p className="mt-2 text-[16px] leading-relaxed text-[#4a5488]">de las respuestas enlazan al sitio de la marca. El resto se queda en la conversación.</p>
            </div>
            <div>
              <p className="eco-stat eco-stat--sm eco-stat--mag">{pct(ECO_REAL.noNombradaConCompetidor, ECO_REAL.noNombrada)}<span>%</span></p>
              <p className="mt-2 text-[16px] leading-relaxed text-[#4a5488]">de las respuestas sin la marca nombran a un competidor en su lugar.</p>
            </div>
          </div>
        </div>

        <div className="mt-24 grid gap-14 lg:grid-cols-2">
          <div>
            <h3 className="eco-h3">Cada IA es un canal distinto</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#4a5488]">Parte de las respuestas que nombran a la marca, por IA. La misma marca puede estar fuerte en una y ausente en otra.</p>
            <ul className="mt-8 space-y-4">
              {casas.map((c, i) => (
                <li key={c.k} className="grid grid-cols-[130px_1fr_52px] items-center gap-3">
                  <span className="flex items-center gap-2 text-[14px] text-[#0e1745]">
                    <Logo k={c.k} size={16} /> {casa(c.k)?.nombre.replace(" (Llama)", "")}
                  </span>
                  <span className="h-[10px] bg-[#edeffb]">
                    <motion.span
                      className="block h-full bg-[#1534dc]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${c.t * 100}%` }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ duration: 1, ease, delay: i * 0.08 }}
                    />
                  </span>
                  <span className="text-right text-[14px] tabular-nums text-[#4a5488]">{Math.round(c.t * 100)}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] text-[#858eb4]">Grok queda fuera del gráfico por muestra chica. {FUENTE}.</p>
          </div>
          <div>
            <h3 className="eco-h3">De memoria se equivoca más</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#4a5488]">
              Con búsqueda web la IA nombra a la marca en el {pct(ECO_REAL.conBusqueda.nombrada, ECO_REAL.conBusqueda.total)}% de las respuestas; de memoria, en el {pct(ECO_REAL.deMemoria.nombrada, ECO_REAL.deMemoria.total)}%. Y los datos cambian.
            </p>
            <figure className="mt-8 border-t border-[#0e1745] pt-6">
              <figcaption className="flex items-center gap-2 text-[14px] text-[#4a5488]">
                <Logo k={ej.casa} size={18} /> Meta, sobre {ej.marca}, en el mismo día
              </figcaption>
              <div className="mt-5 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#858eb4] [font-family:var(--font-figtree)]">De memoria</p>
                  <p className="mt-1 text-[64px] font-bold leading-none text-[#c3c8dd] line-through decoration-[#f540ff] decoration-4 md:text-[84px] [font-family:var(--font-figtree)]">1942</p>
                </div>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#1534dc] [font-family:var(--font-figtree)]">Con búsqueda</p>
                  <p className="mt-1 text-[64px] font-bold leading-none text-[#0e1745] md:text-[84px] [font-family:var(--font-figtree)]">{ej.verdad}</p>
                </div>
              </div>
              <p className="mt-4 text-[14px] text-[#858eb4]">Año de fundación. El real es {ej.verdad}. {FUENTE}.</p>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}



export default function EcoEscucha() {
  const sol = useSolicitud("ia");
  const campo = useCampoMarca();
  const [cc, setCc] = useState("cr");
  const [correo, setCorreo] = useState("");
  useEffect(() => {
    const ini = escuchaInicial();
    const valido = ini ? PAISES.some((x) => x.cc === ini.cc) : false;
    setCc(valido && ini ? ini.cc : paisDelNavegador());
    if (ini?.desde === "url") campo.prellenar(ini.marca);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!campo.valido || sol.estado.fase === "enviando") return;
    void sol.pedir(campo.datos(), cc, correo);
  }
  // El radar gira mientras se pide y unos segundos después de confirmar: la escucha ya arrancó.
  const [girando, setGirando] = useState(false);
  useEffect(() => {
    if (sol.estado.fase === "enviando") setGirando(true);
    if (sol.estado.fase === "enviado") {
      const t = setTimeout(() => setGirando(false), 9000);
      return () => clearTimeout(t);
    }
    if (sol.estado.fase === "error") setGirando(false);
  }, [sol.estado.fase]);

  return (
    <div className="eco-page">
      {/* ---------- Hero + herramienta ---------- */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
        <div className="eco-wrap grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="flex items-center gap-3">
              <img src="/escucha/eco/eco-logo.svg" alt="Eco" className="h-7 w-auto" />
              <span className="eco-kicker">Reporte gratis de IA</span>
            </p>
            <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="eco-h1 mt-7">
              ¿Qué responde la IA cuando preguntan por <span className="text-[#1534dc]">tu marca</span>?
            </motion.h1>
            <p className="mt-6 max-w-xl text-[18px] leading-relaxed text-[#4a5488]">
              Preguntamos a siete inteligencias artificiales por ti. Te enviamos un reporte con cuántas te conocen, qué dicen, a quién recomiendan en tu lugar, en qué datos se equivocan y tus palabras calientes.
            </p>

            <form onSubmit={enviar} className="eco-form2 mt-9">
              <label className="eco-field">
                <span>{campo.etiqueta}</span>
                <input {...campo.inputProps} className="eco-input" />
              </label>
              <label className="eco-field">
                <span>País</span>
                <select value={cc} onChange={(e) => setCc(e.target.value)} className="eco-input">
                  {PAISES.map((p) => (
                    <option key={p.cc} value={p.cc}>{p.nombre}</option>
                  ))}
                </select>
              </label>
              <label className="eco-field eco-field--correo">
                <span>Correo de trabajo</span>
                <input type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@tuempresa.com" required className="eco-input" aria-invalid={sol.estado.campo === "correo"} />
              </label>
              <button type="submit" disabled={sol.estado.fase === "enviando"} className="eco-btn">
                {sol.estado.fase === "enviando" ? "Pidiendo…" : "Recibir mi reporte"}
              </button>
            </form>
            <button type="button" onClick={campo.alternar} className="mt-2 text-[13px] text-[#1534dc] underline underline-offset-2">{campo.textoAlternar}</button>
            <Confirmacion estado={sol.estado} tono="eco" onOtro={sol.reiniciar} />
            <p className="mt-3 text-[13px] text-[#858eb4]">Gratis y sin cuenta. Solo correos de empresa: te enviamos un enlace privado al reporte.</p>
          </div>
          <Radar fase={girando ? "corriendo" : "idle"} />
        </div>
      </section>

      <EcoPorDentro />

      <EscenaEco />
      <PorQueImporta />
      <Copiloto tema="eco" />

      {/* ---------- Preguntas y caminos ---------- */}
      <section className="eco-section border-t border-[#e3e5f1]" aria-labelledby="faq">
        <div className="eco-wrap grid gap-14 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 id="faq" className="eco-h2">Preguntas frecuentes</h2>
            <div className="mt-10 space-y-6">
              <Link href="/shift-lab/escucha-gratis" className="eco-route">
                <span>Escucha integral</span>
                IA, redes y medios en una sola escucha
              </Link>
              <Link href="/shift-lab/escucha-digital" className="eco-route">
                <span>Sentinel</span>
                Lo que dicen de ti en redes y medios
              </Link>
            </div>
          </div>
          <div>
            {FAQ_ECO.map(([q, r]) => (
              <details key={q} className="eco-faq group">
                <summary>
                  {q}
                  <span aria-hidden className="transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p>{r}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
