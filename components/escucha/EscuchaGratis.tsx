"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CASAS } from "@/lib/escucha/casas";
import { MEDIOS } from "@/lib/escucha/medios";
import { PAISES, paisDelNavegador, paisPorCc } from "@/lib/escucha/paises";
import { REDES } from "@/lib/escucha/redes";

/* Escucha gratis: la misma herramienta vive en /shift-lab (sección del dossier)
 * y en /shift-lab/escucha-gratis (la página para pauta). Todo pasa dentro de
 * paneles que se abren con animación: nada de pop-ups. */

type ResIA = { key: string; answer: string; error: boolean; conoce: boolean; nombra: boolean };
type Resumen = {
  total: number;
  muestra: number;
  porRed: Record<string, number>;
  tono: { positivo: number; neutral: number; negativo: number };
  medios: { nombre: string; n: number }[];
  titulares: { medio: string; titulo: string; url: string; fecha: string }[];
  porDia: { dia: string; n: number }[];
  alcance: number;
  interacciones: number;
};

type EstadoIA = { fase: "idle" | "corriendo" | "listo" | "usado" | "apagado" | "error"; resultados?: ResIA[]; crudo?: { key: string; answer: string }[] };
type EstadoDig = { fase: "idle" | "en_cola" | "corriendo" | "listo" | "tope" | "apagado" | "error"; enCola?: number; resumen?: Resumen };

const ECO_DOSSIER = process.env.NEXT_PUBLIC_ECO_DOSSIER_URL ?? "https://eco.shiftlabdev.space/dossier";
const nf = new Intl.NumberFormat("es");
const compacto = new Intl.NumberFormat("es", { notation: "compact", maximumFractionDigits: 1 });

const ease = [0.22, 1, 0.36, 1] as const;

export default function EscuchaGratis({ variante = "pagina" }: { variante?: "pagina" | "seccion" }) {
  const [marca, setMarca] = useState("");
  const [cc, setCc] = useState("cr");
  const [enviada, setEnviada] = useState<{ marca: string; cc: string } | null>(null);
  const [ia, setIa] = useState<EstadoIA>({ fase: "idle" });
  const [dig, setDig] = useState<EstadoDig>({ fase: "idle" });
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const p = q.get("pais");
    setCc(p && PAISES.some((x) => x.cc === p) ? p : paisDelNavegador());
    const m = q.get("marca");
    if (m) setMarca(m.slice(0, 60));
  }, []);

  const pais = paisPorCc(cc);
  const medios = MEDIOS[cc] ?? [];
  const corriendo = ia.fase === "corriendo" || dig.fase === "en_cola" || dig.fase === "corriendo";

  async function escuchar(e: React.FormEvent) {
    e.preventDefault();
    const m = marca.trim();
    if (m.length < 2 || corriendo) return;
    setEnviada({ marca: m, cc });
    setIa({ fase: "corriendo" });
    setDig({ fase: "en_cola" });
    setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);

    // IA (unos 35 s) y redes (unos 2 min) corren en paralelo.
    void (async () => {
      try {
        const r = await fetch("/api/escucha/ia", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marca: m, cc }) });
        if (r.status === 429) return setIa({ fase: "usado" });
        if (r.status === 503) return setIa({ fase: "apagado" });
        const j = await r.json();
        if (!j.ok) return setIa({ fase: "error" });
        setIa({ fase: "listo", resultados: j.resultados, crudo: j.crudo });
      } catch {
        setIa({ fase: "error" });
      }
    })();

    void (async () => {
      try {
        const r = await fetch("/api/escucha/digital", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marca: m, cc }) });
        if (r.status === 503) return setDig({ fase: "apagado" });
        if (r.status === 429) return setDig({ fase: "tope" });
        const j = await r.json();
        if (!j.ok) return setDig({ fase: "error" });
        const id = j.id as string;
        for (let i = 0; i < 120; i++) {
          const s = await (await fetch(`/api/escucha/digital?id=${id}`)).json();
          if (s.estado === "listo") return setDig({ fase: "listo", resumen: s.resumen });
          if (s.estado === "error") return setDig({ fase: "error" });
          setDig({ fase: s.estado, enCola: s.enCola });
          await new Promise((res) => setTimeout(res, 4000));
        }
        setDig({ fase: "error" });
      } catch {
        setDig({ fase: "error" });
      }
    })();
  }

  return (
    <div className={variante === "pagina" ? "" : "mx-auto w-full max-w-[1380px]"}>
      {/* ---------- Formulario ---------- */}
      <form onSubmit={escuchar} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 md:p-5 backdrop-blur-sm">
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
          Gratis y sin tarjeta. Consultamos seis IA y los últimos 30 días de redes y medios de {pais.nombre}. Tarda unos dos minutos.
        </p>
      </form>

      {/* ---------- Qué escuchamos ---------- */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Franja titulo="Seis inteligencias artificiales">
          <div className="flex flex-wrap gap-2.5">
            {CASAS.map((c) => (
              <ChipCasa key={c.key} k={c.key} conNombre />
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

      {/* ---------- Resultados ---------- */}
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
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                <PanelIA marca={enviada.marca} pais={paisPorCc(enviada.cc).nombre} estado={ia} />
                <PanelDigital marca={enviada.marca} pais={paisPorCc(enviada.cc).nombre} estado={dig} />
              </div>
              <DemoCompleta marca={enviada.marca} cc={enviada.cc} ia={ia} dig={dig} />
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

function ChipCasa({ k, conNombre = false }: { k: string; conNombre?: boolean }) {
  const c = CASAS.find((x) => x.key === k)!;
  return (
    <span className="inline-flex items-center gap-2" title={c.nombre}>
      <span
        className="grid h-[26px] w-[26px] place-items-center rounded-[7px] p-[5px]"
        style={{ background: c.fondo, color: c.tinta }}
        dangerouslySetInnerHTML={{ __html: c.svg }}
      />
      {conNombre && <span className="text-[13px] text-white/75 [font-family:var(--font-figtree)]">{c.nombre}</span>}
    </span>
  );
}

function Panel({ titulo, sub, children }: { titulo: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] border border-white/10 bg-[#0E1438] p-6 md:p-7">
      <h3 className="text-[22px] font-bold leading-tight text-white [font-family:var(--font-zilla-slab)]">{titulo}</h3>
      <p className="mt-1 text-[13px] text-white/55">{sub}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Pensando({ texto }: { texto: string }) {
  return (
    <div className="flex items-center gap-3 py-2 text-[14px] text-white/70">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#F540FF] opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#F540FF]" />
      </span>
      {texto}
    </div>
  );
}

function Aviso({ texto }: { texto: string }) {
  return <p className="rounded-[14px] border border-white/10 bg-white/[0.03] p-4 text-[14px] leading-relaxed text-white/75">{texto}</p>;
}

function PanelIA({ marca, pais, estado }: { marca: string; pais: string; estado: EstadoIA }) {
  const r = estado.resultados ?? [];
  const conocen = r.filter((x) => x.conoce).length;
  return (
    <Panel titulo={`Lo que dice la IA de ${marca}`} sub={`Le preguntamos a cada una qué ofrece ${marca} en ${pais}, qué tan recomendada es y qué alternativas existen. Con búsqueda web.`}>
      {estado.fase === "corriendo" && (
        <div className="space-y-3">
          <Pensando texto="Preguntando a las seis IA al mismo tiempo…" />
          {CASAS.map((c, i) => (
            <motion.div key={c.key} initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }} className="flex items-center gap-3">
              <ChipCasa k={c.key} />
              <span className="h-2 flex-1 rounded-full bg-white/10" />
            </motion.div>
          ))}
        </div>
      )}
      {estado.fase === "usado" && <Aviso texto="Ya hiciste tu escucha gratis en IA hoy. Pide la demo completa y la corremos con tu equipo." />}
      {estado.fase === "apagado" && <Aviso texto="La escucha en IA está en mantenimiento por unos minutos. La parte de redes y medios sigue corriendo." />}
      {estado.fase === "error" && <Aviso texto="Una de las IA no respondió a tiempo. Vuelve a intentarlo en un minuto." />}
      {estado.fase === "listo" && (
        <div>
          <div className="mb-5 flex items-baseline gap-3">
            <span className="text-[56px] font-bold leading-none text-white [font-family:var(--font-zilla-slab)]">{conocen}</span>
            <span className="text-[16px] text-white/75">de 6 IA conocen a {marca}</span>
          </div>
          <ul className="space-y-3">
            {r.map((x, i) => (
              <motion.li key={x.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.4, ease }} className="grid grid-cols-[26px_1fr] gap-3">
                <ChipCasa k={x.key} />
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] [font-family:var(--font-figtree)]" style={{ color: x.error ? "#ffffff80" : x.conoce ? "#5BE9FF" : "#F540FF" }}>
                    {x.error ? "No respondió" : x.conoce ? (x.nombra ? "Te conoce y te nombra" : "Te conoce") : "No te conoce"}
                  </p>
                  {!x.error && <p className="mt-1 text-[14px] leading-relaxed text-white/80">{recorte(x.answer, 210)}</p>}
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}

function PanelDigital({ marca, pais, estado }: { marca: string; pais: string; estado: EstadoDig }) {
  const s = estado.resumen;
  const maxRed = s ? Math.max(1, ...Object.values(s.porRed)) : 1;
  const tonoTotal = s ? s.tono.positivo + s.tono.neutral + s.tono.negativo || 1 : 1;
  return (
    <Panel titulo={`Lo que se dice de ${marca} en ${pais}`} sub="Redes sociales, medios, blogs y foros de los últimos 30 días.">
      {(estado.fase === "en_cola" || estado.fase === "corriendo") && (
        <div className="space-y-4">
          <Pensando texto={estado.fase === "en_cola" && (estado.enCola ?? 0) > 1 ? `Hay ${estado.enCola! - 1} escucha antes que la tuya. Ya casi.` : "Escuchando redes y medios. Esto toma unos dos minutos…"} />
          {REDES.map((r, i) => (
            <motion.div key={r.key} initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.12 }} className="flex items-center gap-3">
              <IconoRed k={r.key} />
              <span className="h-2 flex-1 rounded-full bg-white/10" />
            </motion.div>
          ))}
        </div>
      )}
      {estado.fase === "tope" && <Aviso texto="Hoy ya llegamos al máximo de escuchas gratis. Pide la demo completa y te la mandamos mañana a primera hora." />}
      {estado.fase === "apagado" && <Aviso texto="La escucha de redes y medios se activa pronto. Pide la demo completa y te la corremos con tu equipo." />}
      {estado.fase === "error" && <Aviso texto="La escucha de redes no terminó a tiempo. Vuelve a intentarlo en unos minutos." />}
      {estado.fase === "listo" && s && (
        <div>
          <div className="mb-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-[56px] font-bold leading-none text-white [font-family:var(--font-zilla-slab)]">{nf.format(s.total)}</span>
              <span className="text-[16px] text-white/75">menciones en 30 días</span>
            </div>
            {s.interacciones > 0 && <span className="text-[14px] text-white/60">{compacto.format(s.interacciones)} interacciones en la muestra</span>}
          </div>
          {s.total === 0 ? (
            <Aviso texto={`No encontramos conversación pública de ${marca} en ${pais} en los últimos 30 días. Eso también es un dato: nadie está hablando de tu marca donde se ve.`} />
          ) : (
            <>
              <ul className="space-y-2.5">
                {REDES.map((r) => {
                  const n = s.porRed[r.key] ?? 0;
                  return (
                    <li key={r.key} className="grid grid-cols-[22px_120px_1fr_auto] items-center gap-3 text-[13px]">
                      <IconoRed k={r.key} />
                      <span className="text-white/80">{r.nombre}</span>
                      {r.soloCompleto ? (
                        <span className="col-span-2 text-white/45">Entra en el monitoreo completo</span>
                      ) : (
                        <>
                          <span className="h-2 rounded-full bg-white/10">
                            <motion.span initial={{ width: 0 }} animate={{ width: `${(n / maxRed) * 100}%` }} transition={{ duration: 0.9, ease }} className="block h-2 rounded-full bg-[#5BE9FF]" />
                          </span>
                          <span className="w-10 text-right tabular-nums text-white/80">{n}</span>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-[12px] text-white/45">Desglose sobre una muestra de {nf.format(s.muestra)} menciones.</p>

              <div className="mt-6">
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/55 [font-family:var(--font-figtree)]">Tono</p>
                <div className="flex h-3 overflow-hidden rounded-full">
                  <span style={{ width: `${(s.tono.positivo / tonoTotal) * 100}%` }} className="bg-[#5BE9FF]" />
                  <span style={{ width: `${(s.tono.neutral / tonoTotal) * 100}%` }} className="bg-white/25" />
                  <span style={{ width: `${(s.tono.negativo / tonoTotal) * 100}%` }} className="bg-[#F540FF]" />
                </div>
                <div className="mt-2 flex gap-5 text-[13px] text-white/70">
                  <span>Positivo {pct(s.tono.positivo, tonoTotal)}</span>
                  <span>Neutral {pct(s.tono.neutral, tonoTotal)}</span>
                  <span>Negativo {pct(s.tono.negativo, tonoTotal)}</span>
                </div>
              </div>

              {s.medios.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/55 [font-family:var(--font-figtree)]">Medios y blogs que más te mencionan</p>
                  <p className="text-[14px] leading-relaxed text-white/80">{s.medios.map((m) => `${m.nombre} (${m.n})`).join(" · ")}</p>
                </div>
              )}
              {s.titulares.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/55 [font-family:var(--font-figtree)]">Titulares recientes</p>
                  {s.titulares.map((t) => (
                    <a key={t.url} href={t.url} target="_blank" rel="noopener noreferrer" className="block text-[14px] leading-snug text-white/85 underline-offset-4 hover:underline">
                      {t.titulo} <span className="text-white/45">· {t.medio}</span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </Panel>
  );
}

function IconoRed({ k }: { k: string }) {
  const r = REDES.find((x) => x.key === k)!;
  if (r.icono) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={r.icono} alt="" className="h-[18px] w-[18px] opacity-85" />;
  }
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] text-white/85" fill="none" stroke="currentColor" strokeWidth="1.8">
      {k === "medios" ? (
        <path d="M4 5h13v14H6a2 2 0 0 1-2-2V5Zm13 4h3v8a2 2 0 0 1-2 2M8 9h5M8 13h5M8 16h3" />
      ) : (
        <path d="M5 5h14v10H9l-4 4V5Zm4 4h6M9 12h4" />
      )}
    </svg>
  );
}

function DemoCompleta({ marca, cc, ia, dig }: { marca: string; cc: string; ia: EstadoIA; dig: EstadoDig }) {
  const [abierta, setAbierta] = useState(false);
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<"idle" | "enviando" | "listo" | "error">("idle");
  const pais = paisPorCc(cc);
  const listo = ia.fase !== "corriendo" && dig.fase !== "en_cola" && dig.fase !== "corriendo";

  const enlaceDossier = useMemo(() => {
    if (ia.fase !== "listo" || !ia.crudo) return ECO_DOSSIER;
    const payload = JSON.stringify({ company: marca, country: pais.nombre, results: ia.crudo });
    const b64 = btoa(unescape(encodeURIComponent(payload))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `${ECO_DOSSIER}#shot=${b64}`;
  }, [ia, marca, pais.nombre]);

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo) || estado === "enviando") return;
    setEstado("enviando");
    const conocen = ia.resultados?.filter((x) => x.conoce).length;
    const idea = [
      `Escucha gratis (landing Shift Lab): ${marca} en ${pais.nombre}.`,
      conocen !== undefined ? `IA: ${conocen} de 6 la conocen.` : "IA: sin resultado.",
      dig.resumen ? `Redes y medios: ${dig.resumen.total} menciones en 30 días.` : "Redes y medios: sin resultado.",
      "Pidió la demo completa.",
    ].join("\n");
    // La ventana se abre en el mismo clic (si espera al fetch, el navegador la bloquea).
    // Si el registro del correo falla, el visitante igual ve su dossier.
    window.open(enlaceDossier, "_blank", "noopener");
    try {
      const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hub: pais.hub, email: correo, idea, bot_trap: "" }) });
      setEstado(r.ok ? "listo" : "error");
    } catch {
      setEstado("error");
    }
  }

  return (
    <motion.section layout className="mt-6 overflow-hidden rounded-[22px] border border-[#F540FF]/30 bg-gradient-to-br from-[#1534DC]/25 to-[#F540FF]/10 p-6 md:p-8">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h3 className="text-[26px] font-bold leading-tight text-white [font-family:var(--font-zilla-slab)]">Esto es una muestra. La demo completa es tu dossier.</h3>
          <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/75">
            Con tu marca y tu categoría: en cuántas preguntas te recomienda cada IA, qué dice mal de ti, a qué competidores prefiere y qué fuentes la convencen. Más la conversación de redes y medios con tus competidores al lado.
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
            {estado === "listo" || estado === "error" ? (
              <p className="mt-6 text-[15px] leading-relaxed text-white/85">
                {estado === "listo"
                  ? `Listo. Abrimos tu dossier en otra pestaña y el equipo de Shift en ${pais.nombre} te escribe a ${correo}. `
                  : "Abrimos tu dossier en otra pestaña. "}
                <a href={enlaceDossier} target="_blank" rel="noopener" className="font-semibold text-[#5BE9FF] underline-offset-4 hover:underline">
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

function recorte(s: string, n: number) {
  if (s.length <= n) return s;
  const c = s.slice(0, n);
  return c.slice(0, c.lastIndexOf(" ")) + "…";
}
function pct(a: number, t: number) {
  return `${Math.round((a / t) * 100)}%`;
}
