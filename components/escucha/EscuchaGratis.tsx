"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import FondoGlobo from "./FondoGlobo";
import { CASAS } from "@/lib/escucha/casas";
import { anotarUltima, enlaceDossier, escuchaInicial, registrarLead, useEscuchaDigital, useEscuchaIA, type EstadoDig, type EstadoIA } from "@/lib/escucha/cliente";
import { avisarFase } from "./Esqueleto";
import { alternativasNombradas, cuadrante, loQueLaIANoSabe, picoDeConversacion } from "@/lib/escucha/lectura";
import { MEDIOS } from "@/lib/escucha/medios";
import { PAISES, paisDelNavegador, paisPorCc } from "@/lib/escucha/paises";
import { REDES } from "@/lib/escucha/redes";

/* Escucha integral: Eco (IA) + Sentinel (redes y medios) en una sola corrida,
 * y una lectura que solo existe cuando las dos están activas a la vez.
 * Vive en /shift-lab (sección del dossier) y en /shift-lab/escucha-gratis.
 * Cada herramienta tiene además su propia landing con su reporte a fondo. */

const nf = new Intl.NumberFormat("es");
const ease = [0.22, 1, 0.36, 1] as const;
const TOTAL_CASAS = CASAS.length;

export default function EscuchaGratis({ variante = "pagina" }: { variante?: "pagina" | "seccion" }) {
  const [marca, setMarca] = useState("");
  const [cc, setCc] = useState("cr");
  const [enviada, setEnviada] = useState<{ marca: string; cc: string } | null>(null);
  const ia = useEscuchaIA();
  const dig = useEscuchaDigital();
  const panelRef = useRef<HTMLDivElement>(null);
  // En la página integral el globo vive en el fondo del hero y comparte el país con el formulario.
  const [slotGlobo, setSlotGlobo] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (variante === "pagina") setSlotGlobo(document.getElementById("globo-integral"));
  }, [variante]);

  useEffect(() => {
    const ini = escuchaInicial();
    const valido = ini ? PAISES.some((x) => x.cc === ini.cc) : false;
    setCc(valido && ini ? ini.cc : paisDelNavegador());
    // En la página integral se restaura la última escucha (refrescar no la borra; viene de caché).
    if (ini && valido && variante === "pagina") {
      setMarca(ini.marca);
      setEnviada({ marca: ini.marca, cc: ini.cc });
      void ia.correr(ini.marca, ini.cc);
      void dig.correr(ini.marca, ini.cc);
    } else if (ini?.desde === "url") setMarca(ini.marca);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const pais = paisPorCc(cc);
  const medios = MEDIOS[cc] ?? [];
  const corriendo = ia.estado.fase === "corriendo" || dig.estado.fase === "en_cola" || dig.estado.fase === "corriendo";

  // Avisa al resto de la página: nada antes de lanzar, todo cuando las dos escuchas terminaron.
  const terminoIA = enviada && ia.estado.fase !== "corriendo" && ia.estado.fase !== "idle";
  const terminoDig = enviada && !["idle", "en_cola", "corriendo"].includes(dig.estado.fase);
  useEffect(() => {
    if (variante !== "pagina") return;
    avisarFase(!enviada ? "idle" : terminoIA && terminoDig ? "listo" : "corriendo");
  }, [variante, enviada, terminoIA, terminoDig]);

  function escuchar(e: React.FormEvent) {
    e.preventDefault();
    const m = marca.trim();
    if (m.length < 2 || corriendo) return;
    setEnviada({ marca: m, cc });
    anotarUltima(m, cc);
    void ia.correr(m, cc);
    void dig.correr(m, cc);
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  }

  return (
    <div className={variante === "pagina" ? "" : "mx-auto w-full max-w-[1380px]"}>
      {slotGlobo && createPortal(<FondoGlobo cc={cc} onCc={setCc} corriendo={corriendo} />, slotGlobo)}
      <form onSubmit={escuchar} className="relative rounded-[22px] border border-white/10 bg-[#0B1030]/90 p-4 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] md:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="block">
            <span className="sr-only">Tu marca</span>
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              maxLength={60}
              placeholder="Tu marca, por ejemplo Dos Pinos"
              className="h-14 w-full rounded-[14px] border border-white/15 bg-[#0A0E27] px-5 text-[16px] text-white placeholder:text-white/40 outline-none transition focus:border-[#5BE9FF]/70 [font-family:var(--font-figtree)]"
            />
          </label>
          <label className="block">
            <span className="sr-only">País</span>
            <select
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="h-14 w-full rounded-[14px] border border-white/15 bg-[#0A0E27] px-4 text-[15px] text-white outline-none focus:border-[#5BE9FF]/70 [font-family:var(--font-figtree)]"
            >
              {PAISES.map((p) => (
                <option key={p.cc} value={p.cc}>
                  {p.nombre}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={corriendo || marca.trim().length < 2}
            className="h-14 rounded-[14px] bg-[#1534DC] px-7 text-[16px] font-semibold text-white transition hover:bg-[#2a47f0] disabled:opacity-50 [font-family:var(--font-figtree)]"
          >
            {corriendo ? "Escuchando…" : "Escuchar gratis"}
          </button>
        </div>
        <p className="mt-3 px-1 text-[13px] text-white/55">
          Gratis y sin tarjeta. Consultamos {TOTAL_CASAS} IA y los últimos 30 días de redes y medios de {pais.nombre}. Tarda unos dos minutos.
          {slotGlobo && <span className="hidden md:inline"> También puedes elegir tu país en el globo.</span>}
        </p>
      </form>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Franja titulo={`${TOTAL_CASAS} inteligencias artificiales`}>
          <div className="flex flex-wrap gap-x-4 gap-y-3">
            {CASAS.map((c) => (
              <LogoCasa key={c.key} k={c.key} conNombre />
            ))}
          </div>
        </Franja>
        <Franja titulo="Todas las redes sociales">
          <div className="flex flex-wrap items-center gap-4">
            {REDES.filter((r) => r.icono).map((r) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={r.key} src={r.icono!} alt={r.nombre} title={r.nombre} className="h-[22px] w-[22px] opacity-80" />
            ))}
          </div>
        </Franja>
        <Franja titulo={`Medios de ${pais.nombre}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={cc}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.35, ease }}
              className="flex flex-wrap items-center gap-x-5 gap-y-3"
            >
              {medios.map((m) =>
                m.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={m.dominio} src={m.logo} alt={m.nombre} title={m.nombre} className="h-[20px] w-auto max-w-[120px] object-contain opacity-80 [filter:brightness(0)_invert(1)]" />
                ) : (
                  <span key={m.dominio} className="text-[14px] font-semibold text-white/75 [font-family:var(--font-figtree)]">
                    {m.nombre}
                  </span>
                ),
              )}
            </motion.div>
          </AnimatePresence>
        </Franja>
      </div>

      <div ref={panelRef} className="scroll-mt-28">
        <AnimatePresence>
          {enviada && (
            <motion.div
              key={enviada.marca + enviada.cc}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease }}
              className="overflow-hidden"
            >
              <LecturaIntegral marca={enviada.marca} cc={enviada.cc} ia={ia.estado} dig={dig.estado} />
              <DemoCompleta marca={enviada.marca} cc={enviada.cc} ia={ia.estado} dig={dig.estado} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Franja({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#5BE9FF] [font-family:var(--font-figtree)]">{titulo}</p>
      {children}
    </div>
  );
}

export function LogoCasa({ k, conNombre = false, tam = 22 }: { k: string; conNombre?: boolean; tam?: number }) {
  const c = CASAS.find((x) => x.key === k);
  if (!c) return null;
  return (
    <span className="inline-flex items-center gap-2" title={c.nombre}>
      <span className="grid place-items-center" style={{ color: c.color, width: tam, height: tam }} dangerouslySetInnerHTML={{ __html: c.svg }} />
      {conNombre && <span className="text-[13px] text-white/75 [font-family:var(--font-figtree)]">{c.nombre}</span>}
    </span>
  );
}

function Pulso({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 text-[14px] text-white/70">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F540FF] opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#F540FF]" />
      </span>
      {texto}
    </div>
  );
}

/* ---------------- La lectura integral ---------------- */

function LecturaIntegral({ marca, cc, ia, dig }: { marca: string; cc: string; ia: EstadoIA; dig: EstadoDig }) {
  const pais = paisPorCc(cc);
  const r = ia.resultados ?? [];
  const validas = r.filter((x) => !x.error);
  const conocen = validas.filter((x) => x.conoce).length;
  const s = dig.resumen;
  const iaLista = ia.fase === "listo";
  const digLista = dig.fase === "listo" && !!s;
  const ambas = iaLista && digLista;
  const q = ambas ? cuadrante(s!.total, conocen, validas.length || TOTAL_CASAS) : null;
  const noSabe = ambas ? loQueLaIANoSabe(s!, validas, marca) : [];
  const alternativas = iaLista ? alternativasNombradas(validas, marca) : [];
  const pico = digLista ? picoDeConversacion(s!) : null;
  const tonoTotal = s ? s.tono.positivo + s.tono.neutral + s.tono.negativo || 1 : 1;
  const qs = `?marca=${encodeURIComponent(marca)}&pais=${cc}`;

  return (
    <div className="mt-12">
      <div className="grid gap-px overflow-hidden rounded-[22px] border border-white/10 bg-white/10 md:grid-cols-2">
        <Medidor
          etiqueta="Lo que responde la IA"
          listo={iaLista}
          cargando={ia.fase === "corriendo" ? `Preguntando a las ${TOTAL_CASAS} IA al mismo tiempo…` : avisoIA(ia.fase)}
          numero={`${conocen}`}
          sufijo={`de ${validas.length || TOTAL_CASAS} IA conocen a ${marca}`}
          pie={
            <div className="flex flex-wrap gap-x-3 gap-y-2">
              {r.map((x) => (
                <span key={x.key} className={`inline-flex items-center gap-1.5 text-[12px] ${x.error ? "opacity-30" : x.conoce ? "" : "opacity-45"}`}>
                  <LogoCasa k={x.key} tam={16} />
                  <span className="text-white/70">{x.error ? "sin respuesta" : x.conoce ? "te conoce" : "no te conoce"}</span>
                </span>
              ))}
            </div>
          }
          enlace={{ href: `/shift-lab/escucha-ia${qs}`, texto: "Reporte completo de IA, por Eco" }}
          color="#5BE9FF"
        />
        <Medidor
          etiqueta={`Lo que se dice en ${pais.nombre}`}
          listo={digLista}
          cargando={
            dig.fase === "en_cola" || dig.fase === "corriendo"
              ? (dig.enCola ?? 0) > 1
                ? `Hay ${dig.enCola! - 1} escucha antes que la tuya. Ya casi.`
                : "Escuchando redes y medios. Unos dos minutos…"
              : avisoDig(dig.fase)
          }
          numero={s ? nf.format(s.total) : ""}
          sufijo="menciones en 30 días"
          pie={
            s ? (
              <div>
                <div className="flex h-2.5 overflow-hidden rounded-full">
                  <span style={{ width: `${(s.tono.positivo / tonoTotal) * 100}%` }} className="bg-[#5BE9FF]" />
                  <span style={{ width: `${(s.tono.neutral / tonoTotal) * 100}%` }} className="bg-white/25" />
                  <span style={{ width: `${(s.tono.negativo / tonoTotal) * 100}%` }} className="bg-[#F540FF]" />
                </div>
                <div className="mt-2 flex gap-4 text-[12px] text-white/60">
                  <span>Positivo {pct(s.tono.positivo, tonoTotal)}</span>
                  <span>Neutral {pct(s.tono.neutral, tonoTotal)}</span>
                  <span>Negativo {pct(s.tono.negativo, tonoTotal)}</span>
                </div>
              </div>
            ) : null
          }
          enlace={{ href: `/shift-lab/escucha-digital${qs}`, texto: "Reporte completo de conversación, por Sentinel" }}
          color="#F540FF"
        />
      </div>

      <AnimatePresence>
        {ambas && q && (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }} className="mt-14">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#5BE9FF] [font-family:var(--font-figtree)]">Lo que solo se ve con las dos escuchas a la vez</p>
            <div className="mt-5 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
              <div>
                <h3 className="text-[34px] font-bold leading-[1.05] text-white md:text-[46px] [font-family:var(--font-zilla-slab)]">{q.titulo}</h3>
                <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/75">{q.texto}</p>
              </div>
              <Cuadrante clave={q.clave} marca={marca} />
            </div>

            <div className="mt-16 grid gap-10 lg:grid-cols-3">
              <Hallazgo titulo="Lo que pasó y la IA todavía no sabe">
                {noSabe.length ? (
                  <ul className="space-y-4">
                    {noSabe.map((n) => (
                      <li key={n.titulo}>
                        <p className="text-[15px] leading-snug text-white/90">
                          «{n.titulo}» <span className="text-white/45">· {n.medio}</span>
                        </p>
                        <p className="mt-1 text-[13px] text-white/55">
                          Ninguna de las {validas.length} IA menciona <b className="text-[#F540FF]">{n.tema}</b>.
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[15px] leading-relaxed text-white/70">Los titulares del mes no traen temas que la IA ignore: la conversación y las respuestas van al mismo ritmo.</p>
                )}
              </Hallazgo>

              <Hallazgo titulo="Dónde se habla de ti y a quién recomienda la IA">
                {pico && (
                  <p className="text-[15px] leading-relaxed text-white/80">
                    El día más fuerte fue el {fecha(pico.dia)}, con {Math.round(pico.parte * 100)}% de la conversación de la muestra.
                  </p>
                )}
                {s!.medios.length > 0 && (
                  <p className="mt-3 text-[15px] leading-relaxed text-white/80">Te amplifican {s!.medios.slice(0, 3).map((m) => m.nombre).join(", ")}.</p>
                )}
                {alternativas.length > 0 ? (
                  <p className="mt-3 text-[15px] leading-relaxed text-white/80">
                    Mientras tanto, la IA recomienda en tu lugar a <b className="text-white">{alternativas.slice(0, 4).map((a) => a.nombre).join(", ")}</b>.
                  </p>
                ) : (
                  <p className="mt-3 text-[15px] leading-relaxed text-white/60">Ninguna alternativa se repite en dos o más IA.</p>
                )}
              </Hallazgo>

              <Hallazgo titulo="El tono que la IA va a aprender">
                <p className="text-[15px] leading-relaxed text-white/80">
                  {pct(s!.tono.negativo, tonoTotal)} de la conversación sobre {marca} es negativa y {pct(s!.tono.positivo, tonoTotal)} positiva.
                </p>
                <p className="mt-3 text-[15px] leading-relaxed text-white/70">
                  Las IA que buscan en internet leen esa misma conversación antes de responder. Lo que hoy se dice en redes y medios es la materia prima de la respuesta de mañana.
                </p>
              </Hallazgo>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function Medidor(props: {
  etiqueta: string;
  listo: boolean;
  cargando: string;
  numero: string;
  sufijo: string;
  pie: React.ReactNode;
  enlace: { href: string; texto: string };
  color: string;
}) {
  return (
    <section className="flex min-h-[260px] flex-col bg-[#0B1030] p-7 md:p-9">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] [font-family:var(--font-figtree)]" style={{ color: props.color }}>
        {props.etiqueta}
      </p>
      {props.listo ? (
        <>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-3">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="text-[72px] font-bold leading-none text-white [font-family:var(--font-zilla-slab)]">
              {props.numero}
            </motion.span>
            <span className="text-[16px] text-white/75">{props.sufijo}</span>
          </div>
          <div className="mt-6">{props.pie}</div>
          <a href={props.enlace.href} className="mt-auto pt-7 text-[14px] font-semibold text-white/85 underline-offset-4 hover:text-white hover:underline [font-family:var(--font-figtree)]">
            {props.enlace.texto} →
          </a>
        </>
      ) : (
        <div className="mt-6">
          <Pulso texto={props.cargando} />
        </div>
      )}
    </section>
  );
}

function Cuadrante({ clave, marca }: { clave: string; marca: string }) {
  const pos: Record<string, { x: number; y: number }> = {
    alineada: { x: 75, y: 25 },
    brecha: { x: 75, y: 75 },
    memoria: { x: 25, y: 25 },
    silencio: { x: 25, y: 75 },
  };
  const p = pos[clave] ?? pos.silencio;
  const celdas: [string, string][] = [
    ["memoria", "La IA te recuerda"],
    ["alineada", "Presente en los dos"],
    ["silencio", "Silencio"],
    ["brecha", "No llega a la IA"],
  ];
  return (
    <div className="pl-7 pb-8">
      <div className="relative aspect-[16/10] w-full">
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          {celdas.map(([k]) => (
            <div key={k} className={`border border-white/10 transition-colors ${k === clave ? "bg-white/[0.07]" : ""}`} />
          ))}
        </div>
        {celdas.map(([k, t], i) => (
          <span key={k} className={`absolute text-[13px] [font-family:var(--font-figtree)] ${k === clave ? "text-white" : "text-white/35"}`} style={{ left: i % 2 ? "53%" : "3%", top: i < 2 ? "5%" : "55%" }}>
            {t}
          </span>
        ))}
        <span className="absolute -bottom-7 left-0 right-0 text-center text-[11px] uppercase tracking-[0.12em] text-white/45 [font-family:var(--font-figtree)]">Más conversación en redes y medios →</span>
        <span className="absolute left-[-18px] top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[11px] uppercase tracking-[0.12em] text-white/45 [font-family:var(--font-figtree)]">
          Más IA te conocen →
        </span>
        <motion.div initial={{ left: "50%", top: "50%", scale: 0 }} animate={{ left: `${p.x}%`, top: `${p.y}%`, scale: 1 }} transition={{ duration: 0.9, ease }} className="absolute -translate-x-1/2 -translate-y-1/2">
          <span className="absolute -inset-5 animate-ping rounded-full bg-[#F540FF]/25" />
          <span className="relative block h-4 w-4 rounded-full bg-[#F540FF] shadow-[0_0_24px_#F540FF]" />
          <span className={`absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[14px] font-semibold text-white [font-family:var(--font-figtree)] ${p.x > 50 ? "right-6" : "left-6"}`}>{marca}</span>
        </motion.div>
      </div>
    </div>
  );
}

function Hallazgo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-white/15 pt-5">
      <h4 className="mb-4 text-[19px] font-bold leading-snug text-white [font-family:var(--font-figtree)]">{titulo}</h4>
      {children}
    </div>
  );
}

function DemoCompleta({ marca, cc, ia, dig }: { marca: string; cc: string; ia: EstadoIA; dig: EstadoDig }) {
  const [abierta, setAbierta] = useState(false);
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo" | "fallo">("idle");
  const pais = paisPorCc(cc);
  const listo = ia.fase !== "corriendo" && dig.fase !== "en_cola" && dig.fase !== "corriendo";
  const enlace = enlaceDossier(marca, pais.nombre, ia.fase === "listo" ? ia.crudo : undefined);

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || estado === "enviando") return;
    setEstado("enviando");
    // La pestaña se abre en el mismo clic (si espera al fetch, el navegador la bloquea).
    window.open(enlace, "_blank", "noopener");
    const conocen = ia.resultados?.filter((x) => x.conoce).length;
    const idea = [
      `Escucha integral gratis (Shift LAB): ${marca} en ${pais.nombre}.`,
      conocen !== undefined ? `IA: ${conocen} de ${ia.resultados?.length} la conocen.` : "IA: sin resultado.",
      dig.resumen ? `Redes y medios: ${dig.resumen.total} menciones en 30 días.` : "Redes y medios: sin resultado.",
      "Pidió la demo completa (Eco + Sentinel).",
    ].join("\n");
    setEstado((await registrarLead(pais.hub, correo, idea)) ? "listo" : "fallo");
  }

  return (
    <motion.section layout className="mt-16 overflow-hidden rounded-[22px] border border-[#F540FF]/30 bg-gradient-to-br from-[#1534DC]/25 to-[#F540FF]/10 p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h3 className="text-[26px] font-bold leading-tight text-white [font-family:var(--font-zilla-slab)]">Esto es una muestra. La demo completa es tu dossier.</h3>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/75">
            Con tu categoría y tus competidores: en cuántas preguntas te recomienda cada IA y qué dice mal de ti, junto a la conversación de redes, medios y radio que la alimenta, con alertas en el momento.
          </p>
        </div>
        {!abierta && (
          <button
            type="button"
            disabled={!listo}
            onClick={() => setAbierta(true)}
            className="h-14 rounded-[14px] bg-white px-7 text-[16px] font-semibold text-[#0A0E27] transition hover:bg-white/90 disabled:opacity-40 [font-family:var(--font-figtree)]"
          >
            Ver demo completa
          </button>
        )}
      </div>
      <AnimatePresence>
        {abierta && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease }} className="overflow-hidden">
            {estado === "listo" || estado === "fallo" ? (
              <p className="mt-6 text-[15px] leading-relaxed text-white/85">
                {estado === "listo" ? `Listo. Abrimos tu dossier en otra pestaña y el equipo de Shift en ${pais.nombre} te escribe a ${correo}. ` : "Abrimos tu dossier en otra pestaña. "}
                <a href={enlace} target="_blank" rel="noopener" className="font-semibold text-[#5BE9FF] underline-offset-4 hover:underline">
                  Abrir el dossier de nuevo
                </a>
              </p>
            ) : (
              <form onSubmit={pedir} className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]">
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="Tu correo de trabajo"
                  className="h-14 rounded-[14px] border border-white/20 bg-[#0A0E27] px-5 text-[16px] text-white placeholder:text-white/40 outline-none focus:border-[#5BE9FF]/70"
                />
                <button type="submit" disabled={estado === "enviando"} className="h-14 rounded-[14px] bg-[#1534DC] px-7 text-[16px] font-semibold text-white hover:bg-[#2a47f0] disabled:opacity-60 [font-family:var(--font-figtree)]">
                  {estado === "enviando" ? "Abriendo…" : "Abrir mi dossier"}
                </button>
                <p className="text-[12px] text-white/50 md:col-span-2">Te escribe una persona del equipo de Shift en {pais.nombre}. Nada de listas de correo.</p>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function avisoIA(f: EstadoIA["fase"]) {
  if (f === "usado") return "Ya hiciste tu escucha gratis en IA hoy. Pide la demo completa y la corremos con tu equipo.";
  if (f === "apagado") return "La escucha en IA está en mantenimiento por unos minutos.";
  if (f === "error") return "Una de las IA no respondió a tiempo. Vuelve a intentarlo en un minuto.";
  return "";
}
function avisoDig(f: EstadoDig["fase"]) {
  if (f === "tope") return "Hoy ya llegamos al máximo de escuchas gratis. Pide la demo completa y te la mandamos mañana.";
  if (f === "apagado") return "La escucha de redes y medios se activa pronto.";
  if (f === "error") return "La escucha de redes no terminó a tiempo. Vuelve a intentarlo en unos minutos.";
  return "";
}
function pct(a: number, t: number) {
  return `${Math.round((a / t) * 100)}%`;
}
function fecha(dia: string) {
  return new Date(dia + "T12:00:00").toLocaleDateString("es", { day: "numeric", month: "long" });
}
