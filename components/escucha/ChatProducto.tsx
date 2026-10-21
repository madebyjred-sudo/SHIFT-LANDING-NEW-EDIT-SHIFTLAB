"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { CASAS } from "@/lib/escucha/casas";
import { LOGO_NIKE } from "./MarcaEjemplo";
import { SentinelMarca } from "./SentinelMarca";

/* El chat de cada plataforma tal como se ve dentro, no un chat genérico.
 * Eco: calcado de apps/web/src/components/agent (ChatBubble, ThinkingIndicator,
 * Composer): pasos reales del agente en chips mono con ✓ (AGENT_TOOL_LABELS),
 * respuesta sin burbuja con tabla, acción propuesta y franja «memoria de eco».
 * Sentinel: calcado del Copilot del tablero (sentinel-demos/…/pages/Copilot.tsx):
 * cabecera SENTINEL AI, «Analizando la conversación medida…», tabla, cita con
 * fuente y chips de sugerencia. El ejemplo es Nike, igual que «por dentro». */

const ease = [0.22, 1, 0.36, 1] as const;

function useGuion(vivo: boolean, tiempos: number[]) {
  const [paso, setPaso] = useState(0);
  useEffect(() => {
    if (!vivo) return;
    setPaso(0);
    const ts = tiempos.map((t, i) => setTimeout(() => setPaso(i + 1), t));
    return () => ts.forEach(clearTimeout);
  }, [vivo]); // eslint-disable-line react-hooks/exhaustive-deps
  return paso;
}

const Entra = ({ children, k }: { children: ReactNode; k: string }) => (
  <motion.div key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
    {children}
  </motion.div>
);

function Ia({ k, s = 13, color }: { k: string; s?: number; color?: string }) {
  const c = CASAS.find((x) => x.key === k);
  if (!c) return null;
  return <span className="inline-grid shrink-0 place-items-center" style={{ width: s, height: s, color: color ?? (k === "gpt" || k === "grok" ? "#0e1745" : c.color) }} dangerouslySetInnerHTML={{ __html: c.svg }} />;
}

/* ================================================================== */
/* ECO                                                                 */
/* ================================================================== */
const E = { papel: "#FBFBFD", papel2: "#F1F3FA", regla: "#E3E5F1", tinta: "#0e1745", tinta2: "#4a5488", tinta3: "#858eb4", azul: "#1534dc", bien: "#12a150", mag: "#f540ff" };
const monoE = "[font-family:var(--font-fira-mono),ui-monospace,monospace]";

const PASOS_ECO = ["Revisando pregunta por pregunta", "Revisando dominios citados", "Buscando en la memoria"];
const FILAS_ECO = [
  { ia: "gpt", n: "ChatGPT", marca: "Asics Gel-Nimbus", fuente: "runrepeat.com", tuya: false },
  { ia: "claude", n: "Claude", marca: "Asics Novablast", fuente: "runnersworld.com", tuya: false },
  { ia: "perplexity", n: "Perplexity", marca: "Asics Gel-Nimbus", fuente: "reddit.com", tuya: false },
  { ia: "gemini", n: "Gemini", marca: "Nike Vaporfly", fuente: "nike.com", tuya: true },
  { ia: "meta", n: "Meta AI", marca: "Nike Vaporfly", fuente: "youtube.com", tuya: true },
];

const Chip = ({ t, ok = true }: { t: string; ok?: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-1 text-[10.5px] ${monoE}`} style={{ background: E.papel2, borderColor: E.regla }}>
    <span style={{ color: E.tinta2 }}>{t}</span>
    <span style={{ color: ok ? E.bien : "#e5484d" }}>{ok ? "✓" : "✕"}</span>
  </span>
);

export function ChatEco({ vivo }: { vivo: boolean }) {
  // 1 pregunta · 2-4 pasos · 5 respuesta · 6 tabla · 7 acción · 8 memoria
  const paso = useGuion(vivo, [500, 1300, 1900, 2500, 3200, 3900, 4900, 5800]);
  const pasosVistos = Math.max(0, Math.min(3, paso - 1));
  return (
    <div className="flex overflow-hidden rounded-[18px] border bg-white shadow-[0_1px_2px_rgba(14,23,69,.04),0_24px_60px_-30px_rgba(14,23,69,.28)]" style={{ borderColor: E.regla, color: E.tinta, fontFamily: "var(--font-fira-sans)" }}>
      <div className="flex min-h-[600px] min-w-0 flex-1 flex-col">
        {/* Cabecera como en la app */}
        <div className="flex items-center gap-2.5 border-b px-5 py-3" style={{ borderColor: E.regla }}>
          <img src="/escucha/eco/eco-logo.svg" alt="Shift Eco" className="h-[15px] w-auto" />
          <span className="h-4 w-px" style={{ background: E.regla }} />
          <img src={LOGO_NIKE} alt="Nike" className="h-3 w-auto" />
          <span className={`ml-1 text-[10.5px] uppercase tracking-[0.12em] ${monoE}`} style={{ color: E.tinta3 }}>Pregúntale a Eco</span>
          <span className={`ml-auto hidden text-[10.5px] sm:block ${monoE}`} style={{ color: E.tinta3 }}>Corrida del 20 oct · 7 IA · 140 preguntas</span>
        </div>

        <div className="flex flex-1 flex-col justify-end gap-4 px-5 py-5">
          <AnimatePresence>
            {paso >= 1 && (
              <Entra key="u" k="u">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-[10px] border px-4 py-3 text-[14px] leading-[1.55]" style={{ background: E.papel2, borderColor: E.regla }}>
                    ¿En qué preguntas de maratón nos gana Asics y por qué?
                  </p>
                </div>
              </Entra>
            )}
            {paso >= 2 && (
              <Entra key="pasos" k="pasos">
                <div className="flex flex-wrap items-center gap-2">
                  {PASOS_ECO.slice(0, pasosVistos).map((t) => (
                    <motion.span key={t} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
                      <Chip t={t} />
                    </motion.span>
                  ))}
                  {paso < 5 && (
                    <span className={`inline-flex items-center gap-2.5 rounded-[8px] border px-3 py-2 text-[11.5px] ${monoE}`} style={{ background: E.papel2, borderColor: E.regla, color: E.tinta2 }}>
                      <motion.span className="block h-[11px] w-[11px] rounded-full border-[1.5px]" style={{ borderColor: E.regla, borderTopColor: E.azul }} animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }} />
                      {pasosVistos ? "Analizando…" : "Consultando tus datos…"}
                    </span>
                  )}
                </div>
              </Entra>
            )}
            {paso >= 5 && (
              <Entra key="r" k="r">
                <div className="max-w-[94%] text-[14px] leading-[1.6]">
                  <p>
                    En <b>3 de 5 IA</b>, la pregunta «zapatillas para maratón con buena amortiguación» responde con <b>Asics</b>. Solo Gemini y Meta AI nombran la Vaporfly.
                  </p>
                  {paso >= 6 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 overflow-hidden rounded-[8px] border" style={{ borderColor: E.regla }}>
                      <table className="w-full border-collapse text-[12.5px]">
                        <thead>
                          <tr style={{ background: E.papel2 }}>
                            {["IA", "Recomienda", "Fuente que cita"].map((h, j) => (
                              <th key={h} className={`${j === 2 ? "hidden sm:table-cell " : ""}px-3 py-2 text-left text-[10px] font-normal uppercase tracking-[0.1em] ${monoE}`} style={{ color: E.tinta3 }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {FILAS_ECO.map((f, i) => (
                            <motion.tr key={f.ia} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} className="border-t" style={{ borderColor: E.regla }}>
                              <td className="px-3 py-2"><span className="flex items-center gap-2"><Ia k={f.ia} />{f.n}</span></td>
                              <td className="whitespace-nowrap px-3 py-2 font-semibold" style={{ color: f.tuya ? E.bien : E.mag }}>{f.marca}</td>
                              <td className={`hidden px-3 py-2 text-[11.5px] sm:table-cell ${monoE}`} style={{ color: E.tinta2 }}>{f.fuente}</td>
                            </motion.tr>
                          ))}
                        </tbody>
                      </table>
                    </motion.div>
                  )}
                  {paso >= 6 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-3">
                      El patrón: las tres que te dejan fuera citan reseñas que ponen a la Vaporfly en <b>velocidad</b>, no en <b>amortiguación</b>. Tu sitio no tiene una página que la compare en esa categoría.
                    </motion.p>
                  )}
                </div>
              </Entra>
            )}
            {paso >= 7 && (
              <Entra key="accion" k="accion">
                <div className="max-w-[94%] rounded-[10px] border px-4 py-3" style={{ borderColor: E.regla }}>
                  <p className={`text-[10px] uppercase tracking-[0.12em] ${monoE}`} style={{ color: E.azul }}>Acción propuesta · contenido</p>
                  <p className="mt-1 text-[14px] font-semibold leading-snug">Publica una comparativa de amortiguación con la Vaporfly y la Pegasus</p>
                  <p className="mt-0.5 text-[12.5px]" style={{ color: E.tinta2 }}>Cierra la brecha en 3 IA. Las fuentes a cubrir: runrepeat.com y runnersworld.com.</p>
                  <div className="mt-2.5 flex gap-2">
                    <span className="rounded-[6px] px-2.5 py-1 text-[11.5px] font-semibold text-white" style={{ background: E.azul }}>Empezar</span>
                    <span className="rounded-[6px] border px-2.5 py-1 text-[11.5px]" style={{ borderColor: E.regla, color: E.tinta2 }}>Descartar</span>
                  </div>
                </div>
              </Entra>
            )}
            {paso >= 8 && (
              <Entra key="mem" k="mem">
                <Chip t="Guardando un aprendizaje" />
              </Entra>
            )}
          </AnimatePresence>
        </div>

        {/* Composer como en la app */}
        <div className="border-t px-4 py-3" style={{ borderColor: E.regla }}>
          <div className="mb-2 flex gap-2 overflow-hidden">
            {["¿Qué IA dice mal mi año de fundación?", "Compárame con Adidas", "¿Qué publico primero?"].map((s) => (
              <span key={s} className={`shrink-0 whitespace-nowrap rounded-[6px] border px-2.5 py-1 text-[11px] ${monoE}`} style={{ borderColor: E.regla, color: E.tinta2 }}>{s}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-[10px] border px-3.5 py-2.5" style={{ borderColor: E.regla, background: E.papel }}>
            <span className="flex-1 text-[14px]" style={{ color: E.tinta3 }}>Pregúntale a Eco sobre Nike</span>
            <span className="grid h-7 w-7 place-items-center rounded-[7px] text-white" style={{ background: E.azul }} aria-hidden>↑</span>
          </div>
        </div>
      </div>

      {/* Franja «memoria de eco», plegada como en la app */}
      <div className="hidden w-[44px] shrink-0 flex-col items-center justify-center gap-4 border-l sm:flex" style={{ borderColor: E.regla, background: E.papel, color: E.tinta3 }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden><path d="M11 3l-5 5 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span className={`text-[10px] uppercase tracking-[0.14em] ${monoE}`} style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>memoria de eco · 38 notas</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/* SENTINEL                                                            */
/* ================================================================== */
const S = { papel: "#F4F4F2", inf: "#ECECE8", linea: "#DCDCD6", tinta: "#17171B", tinta2: "#5F6068", tinta3: "#8A8B92", morado: "#9244D8", verde: "#1E874B", rojo: "#D42A20" };
const monoS = "tabular-nums [font-family:var(--font-plex-mono),ui-monospace,monospace]";
const SERIE = [6, 7, 5, 8, 6, 7, 9, 8, 7, 10, 12, 24, 41, 38];
const FUENTES_S = [
  { f: "Instagram", n: "1.212", t: "Positivo", c: S.verde },
  { f: "TikTok", n: "486", t: "Positivo", c: S.verde },
  { f: "X", n: "274", t: "Mixto", c: S.tinta3 },
  { f: "Medios digitales", n: "61", t: "Neutral", c: S.tinta3 },
];

export function ChatSentinel({ vivo }: { vivo: boolean }) {
  // 1 pregunta · 2 analizando · 3 respuesta · 4 gráfico · 5 tabla · 6 cita · 7 alerta
  const paso = useGuion(vivo, [500, 1200, 2600, 3200, 3900, 4700, 5400]);
  const max = Math.max(...SERIE);
  return (
    <div className="flex min-h-[600px] flex-col overflow-hidden rounded-[8px] border bg-white shadow-[0_24px_60px_-36px_rgba(23,23,27,0.45)]" style={{ borderColor: S.linea, color: S.tinta, fontFamily: "var(--font-plex)" }}>
      {/* Cabecera como en el tablero */}
      <header className="flex items-center gap-3 border-b px-4 py-3" style={{ borderColor: S.linea }}>
        <span className="grid h-8 w-8 place-items-center rounded-[6px]" style={{ background: "#F1E7FB" }}>
          <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: S.morado }} />
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-[13.5px] font-semibold leading-none">Copiloto <SentinelMarca className="text-[11px]" /></p>
          <p className={`mt-[5px] flex items-center gap-1.5 text-[9.5px] uppercase tracking-[0.08em] ${monoS}`} style={{ color: S.tinta3 }}>
            Sentinel AI · <img src={LOGO_NIKE} alt="Nike" className="h-[8px] w-auto opacity-70" /> · Costa Rica
          </p>
        </div>
        <span className={`ml-auto inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] ${monoS}`} style={{ color: S.verde }}>
          <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: S.verde }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
          En vivo
        </span>
      </header>

      <div className="flex flex-1 flex-col justify-end gap-4 px-4 py-5">
        <AnimatePresence>
          {paso >= 1 && (
            <Entra key="u" k="u">
              <div className="flex justify-end">
                <p className="max-w-[82%] rounded-[8px] rounded-tr-[3px] px-[15px] py-[11px] text-[13.5px] leading-[1.5]" style={{ background: S.inf, color: S.tinta2 }}>
                  ¿Qué está moviendo la conversación de la camiseta de la Selección?
                </p>
              </div>
            </Entra>
          )}
          {paso === 2 && (
            <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5" style={{ color: S.tinta3 }}>
              <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: S.morado }} animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
              <span className={`text-[11px] tracking-[0.04em] ${monoS}`}>Analizando la conversación medida…</span>
            </motion.div>
          )}
          {paso >= 3 && (
            <Entra key="r" k="r">
              <div className="max-w-[94%] text-[13.5px] leading-[1.6]">
                <p>
                  Desde las 06:00 la conversación subió <b>+340 %</b>. El <b>58 %</b> viene de Instagram y el tono es <b style={{ color: S.verde }}>71 % positivo</b>. Lo negativo se concentra en un solo tema: <b>el precio</b>.
                </p>
                {paso >= 4 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    <div className="flex h-[56px] items-end gap-[3px]">
                      {SERIE.map((n, i) => (
                        <motion.span key={i} initial={{ height: 0 }} animate={{ height: `${Math.round((n / max) * 100)}%` }} transition={{ delay: i * 0.035, duration: 0.45, ease }} className="flex-1 rounded-t-[2px]" style={{ backgroundColor: i >= 11 ? S.morado : "#D9D9D3" }} />
                      ))}
                    </div>
                    <p className={`mt-1 flex justify-between text-[10px] ${monoS}`} style={{ color: S.tinta3 }}><span>06:00</span><span>menciones por hora</span><span>ahora</span></p>
                  </motion.div>
                )}
                {paso >= 5 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 overflow-hidden rounded-[6px] border" style={{ borderColor: S.linea }}>
                    <table className="w-full border-collapse text-[12.5px]">
                      <thead style={{ background: S.inf }}>
                        <tr>
                          {["Fuente", "Menciones", "Tono"].map((h) => (
                            <th key={h} className="whitespace-nowrap px-3 py-2 text-left font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {FUENTES_S.map((r) => (
                          <tr key={r.f} className="border-t" style={{ borderColor: S.linea }}>
                            <td className="px-3 py-2" style={{ color: S.tinta2 }}>{r.f}</td>
                            <td className={`px-3 py-2 ${monoS}`}>{r.n}</td>
                            <td className="px-3 py-2 font-medium" style={{ color: r.c }}>{r.t}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}
                {paso >= 6 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 border-l-2 pl-3" style={{ borderColor: S.morado }}>
                    Lo que más se comparte: «Está preciosa, pero ¿en serio cuesta eso? La compro igual.» <span style={{ color: S.tinta3 }}>· Instagram · 3.100 interacciones</span>
                  </motion.p>
                )}
                {paso >= 7 && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3" style={{ color: S.tinta2 }}>
                    Te avisé a las 09:14, cuando cruzó el umbral. ¿Quieres que lo compare con el lanzamiento de la camiseta anterior?
                  </motion.p>
                )}
              </div>
            </Entra>
          )}
        </AnimatePresence>
      </div>

      {/* Composer como en el tablero */}
      <div className="space-y-2.5 border-t p-3" style={{ borderColor: S.linea }}>
        <div className="flex gap-2 overflow-hidden">
          {["¿Qué medios lo retomaron?", "Compara con el lanzamiento anterior", "¿Quién lo amplificó?"].map((s) => (
            <span key={s} className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[10.5px] ${monoS}`} style={{ background: S.inf, color: S.tinta2 }}>{s}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 rounded-[8px] py-1.5 pl-3.5 pr-1.5" style={{ background: S.inf }}>
          <span className="flex-1 text-[13.5px]" style={{ color: S.tinta3 }}>Consulta sobre Nike</span>
          <span className="grid h-8 w-8 place-items-center rounded-[6px] text-white" style={{ background: S.morado }} aria-hidden>↑</span>
        </div>
        <p className={`text-center text-[9.5px] uppercase tracking-[0.1em] ${monoS}`} style={{ color: S.tinta3 }}>Responde con fuente, no inventa</p>
      </div>
    </div>
  );
}
