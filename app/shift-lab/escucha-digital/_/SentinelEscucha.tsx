"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEscuchaDigital, registrarLead, type Resumen } from "@/lib/escucha/cliente";
import { picoDeConversacion, redDominante } from "@/lib/escucha/lectura";
import { REDES } from "@/lib/escucha/redes";
import { MEDIOS } from "@/lib/escucha/medios";
import { PAISES, paisDelNavegador, paisPorCc } from "@/lib/escucha/paises";
import { SENTINEL_REAL, FECHA_DATOS } from "@/lib/escucha/datos-reales";

/* Tokens Sentinel */
const C = {
  fondo: "#0B0A10",
  ink: "#17171B",
  papel: "#F4F4F2",
  gris: "#7D7F87",
  linea: "rgba(244,244,242,0.10)",
  morado: "#4A1D6E",
  lila: "#C59AF0",
  rojo: "#D42A20",
  verde: "#1E874B",
  naranja: "#E0670F",
};

const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
const pct = (x: number) => `${Math.round(x * 100)} %`;
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fechaLarga = (iso: string) => {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return m && d ? `${d} de ${MESES[m - 1]}` : iso;
};
const fechaCorta = (iso: string) => {
  const [, m, d] = iso.slice(0, 10).split("-").map(Number);
  return m && d ? `${d} ${MESES[m - 1].slice(0, 3)}` : iso;
};

const rotulo = "text-[11px] uppercase tracking-[0.16em] [font-family:var(--font-plex-mono)]";
const ease = [0.22, 1, 0.36, 1] as const;

/* ------------------------------------------------------------------ */

export default function SentinelEscucha() {
  const [cc, setCc] = useState("cr");
  const [marca, setMarca] = useState("");
  const { estado, correr } = useEscuchaDigital();
  const pais = paisPorCc(cc);
  /* ?marca=X&pais=cc: prellena y corre sola (viene de la integral, en caché 24 h). */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const m = q.get("marca")?.trim().slice(0, 60);
    const p = q.get("pais")?.toLowerCase();
    const valido = p && PAISES.some((x) => x.cc === p);
    if (m) setMarca(m);
    setCc(valido ? p! : paisDelNavegador());
    if (m && valido) correr(m, p!);
  }, [correr]);
  const ocupado = estado.fase === "en_cola" || estado.fase === "corriendo";

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!marca.trim() || ocupado) return;
    correr(marca.trim(), cc);
  };

  useEffect(() => {
    if (estado.fase === "listo") document.getElementById("reporte")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [estado.fase]);

  return (
    <div className="overflow-x-clip text-[#F4F4F2] [font-family:var(--font-plex)]" style={{ background: C.fondo }}>
      {/* ---------- HERO + HERRAMIENTA ---------- */}
      <section className="relative isolate pt-28 pb-14 md:pt-36 md:pb-20">
        <Reticula />
        <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 md:px-10">
          <BarraMarca />
          <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease }}
                className="text-[40px] font-semibold leading-[1.02] tracking-[-0.025em] md:text-[64px]"
              >
                La conversación sobre tu marca no espera.
                <span className="block text-[#C59AF0]">Escúchala hoy.</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.8 }}
                className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-[#F4F4F2]/70"
              >
                Lo que se dice hoy en redes y medios decide tu reputación de mañana. Sentinel lee 30 días de conversación pública en {pais.nombre} y te dice cuánto se habla de ti, dónde, en qué tono y qué la encendió. Gratis, sin cuenta, en unos dos minutos.
              </motion.p>

              <form onSubmit={enviar} className="mt-9 max-w-[560px]">
                <label htmlFor="marca" className={`${rotulo} text-[#F4F4F2]/50`}>Tu marca</label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    id="marca"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Escribe el nombre de tu marca"
                    disabled={ocupado}
                    maxLength={60}
                    className="h-14 min-w-0 flex-1 rounded-[6px] border border-white/15 bg-white/[0.04] px-4 text-[17px] text-white outline-none transition placeholder:text-white/35 focus:border-[#C59AF0] disabled:opacity-60"
                  />
                  <select
                    aria-label="País"
                    value={cc}
                    onChange={(e) => setCc(e.target.value)}
                    disabled={ocupado}
                    className="h-14 rounded-[6px] border border-white/15 bg-[#17171B] px-3 text-[15px] text-white outline-none focus:border-[#C59AF0] sm:w-[170px]"
                  >
                    {PAISES.map((p) => (
                      <option key={p.cc} value={p.cc}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={ocupado || !marca.trim()}
                  className="mt-3 flex h-14 w-full items-center justify-center gap-3 rounded-[6px] bg-[#4A1D6E] text-[16px] font-semibold text-white transition hover:bg-[#5d2689] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C59AF0] opacity-70" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C59AF0]" />
                  </span>
                  {ocupado ? "Escuchando la conversación" : "Escuchar 30 días de mi marca"}
                </button>
                <p className="mt-3 text-[13px] text-white/45">Una escucha por marca. No pedimos correo para ver el resultado.</p>
              </form>
              <Estado fase={estado.fase} enCola={estado.enCola} />
            </div>

            <Radar ocupado={ocupado} resumen={estado.fase === "listo" ? estado.resumen : undefined} />
          </div>
        </div>
      </section>

      <FranjaMedios cc={cc} nombrePais={pais.nombre} />

      <AnimatePresence>
        {estado.fase === "listo" && estado.resumen && (
          <motion.div key="rep" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
            <Reporte r={estado.resumen} hub={pais.hub} nombrePais={pais.nombre} />
          </motion.div>
        )}
      </AnimatePresence>

      <Narrativa />
      <Producto />
      <Completo />
      <Preguntas />
      <Cierre hub={pais.hub} nombrePais={pais.nombre} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function BarraMarca() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex items-baseline gap-2">
        <span className="text-[17px] font-semibold tracking-[0.32em] text-[#C59AF0]">SENTINEL</span>
        <span className="text-[13px] text-white/50">by Shift</span>
        <span className="ml-3 hidden items-center gap-2 text-[12px] text-white/50 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#D42A20]" /> escucha digital gratis
        </span>
      </div>
      <nav className="flex gap-5 text-[13px] text-white/60">
        <Link href="/shift-lab/escucha-gratis" className="transition hover:text-white">Escucha integral</Link>
        <Link href="/shift-lab/escucha-ia" className="transition hover:text-white">Escucha de IA · Eco</Link>
      </nav>
    </div>
  );
}

function Reticula() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-0">
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(rgba(197,154,240,0.18) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black 0%, black 55%, transparent 100%)",
        }}
      />
      <div className="absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full bg-[#4A1D6E] opacity-30 blur-[140px]" />
    </div>
  );
}

function Estado({ fase, enCola }: { fase: string; enCola?: number }) {
  const t: Record<string, string> = {
    en_cola: enCola ? `En fila: hay ${enCola} escucha${enCola > 1 ? "s" : ""} antes de la tuya.` : "Preparando la escucha.",
    corriendo: "Leyendo redes, medios y blogs de los últimos 30 días. Tarda unos dos minutos; puedes seguir bajando.",
    tope: "Llegamos al tope de escuchas gratis de hoy. Vuelve mañana o pide la demo completa abajo.",
    apagado: "La escucha gratis está en pausa en este momento. Pide la demo completa y te mostramos tu marca.",
    error: "No pudimos terminar la escucha. Intenta de nuevo en un momento.",
  };
  return (
    <AnimatePresence mode="wait">
      {t[fase] && (
        <motion.p
          key={fase}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`mt-5 max-w-[560px] overflow-hidden border-l-2 pl-4 text-[14px] leading-relaxed ${fase === "error" || fase === "tope" ? "border-[#E0670F] text-[#F4F4F2]/80" : "border-[#C59AF0] text-[#F4F4F2]/75"}`}
        >
          {t[fase]}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* Panel de canales: todas las redes, con señal animada. En reposo late; al correr barre; con reporte muestra la muestra por red. */
function Radar({ ocupado, resumen }: { ocupado: boolean; resumen?: Resumen }) {
  const max = resumen ? Math.max(1, ...Object.values(resumen.porRed)) : 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.9, ease }}
      className="relative rounded-[10px] border border-white/10 bg-[#17171B]/80"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
        <span className={`${rotulo} text-white/55`}>Dónde escucha Sentinel</span>
        <span className={`${rotulo} flex items-center gap-2 ${ocupado ? "text-[#C59AF0]" : "text-white/40"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${ocupado ? "animate-pulse bg-[#C59AF0]" : resumen ? "bg-[#1E874B]" : "bg-white/30"}`} />
          {ocupado ? "escuchando" : resumen ? "listo" : "en espera"}
        </span>
      </div>
      <ul>
        {REDES.map((r, i) => {
          const n = resumen?.porRed[r.key] ?? 0;
          return (
            <li key={r.key} className="grid grid-cols-[22px_minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-3 border-b border-white/[0.06] px-5 py-[11px] last:border-0">
              {r.icono ? (
                <Image src={r.icono} alt="" width={16} height={16} className="h-4 w-4 opacity-80" />
              ) : (
                <span className="h-2 w-2 justify-self-center rounded-[2px] bg-[#C59AF0]/70" />
              )}
              <span className="truncate text-[14px] text-white/85">{r.nombre}</span>
              {r.soloCompleto ? (
                <span className="truncate text-right text-[12px] text-[#C59AF0]/80">Entra en el monitoreo completo</span>
              ) : (
                <span className="relative h-[18px] overflow-hidden">
                  <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                  {resumen ? (
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${(n / max) * 82}%` }}
                      transition={{ delay: i * 0.05, duration: 0.9, ease }}
                      className="absolute left-0 top-1/2 h-[6px] -translate-y-1/2 rounded-[2px] bg-[#C59AF0]"
                    />
                  ) : (
                    <motion.span
                      className="absolute top-1/2 h-[6px] w-10 -translate-y-1/2 rounded-[2px]"
                      style={{ background: "linear-gradient(90deg, transparent, #C59AF0)" }}
                      animate={{ left: ["-15%", "105%"] }}
                      transition={{ duration: ocupado ? 1.1 : 3.6, repeat: Infinity, delay: (i * 0.37) % 2.4, ease: "linear" }}
                    />
                  )}
                  {resumen && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[12px] tabular-nums text-white/70">{fmt(n)}</span>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="border-t border-white/10 px-5 py-3 text-[12px] leading-relaxed text-white/45">
        {resumen ? `Conteo sobre una muestra de ${fmt(resumen.muestra)} menciones.` : "Las 11 superficies, siempre. Radio y TV entran en el monitoreo completo."}
      </p>
    </motion.div>
  );
}

function FranjaMedios({ cc, nombrePais }: { cc: string; nombrePais: string }) {
  const lista = MEDIOS[cc] ?? [];
  if (!lista.length) return null;
  return (
    <section className="border-y border-white/10 bg-[#0E0D14] py-7">
      <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-5 md:flex-row md:items-center md:gap-10 md:px-10">
        <p className={`${rotulo} shrink-0 text-white/45`}>Medios que escuchamos en {nombrePais}</p>
        <AnimatePresence mode="wait">
          <motion.ul
            key={cc}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            {lista.slice(0, 9).map((m) => (
              <li key={m.dominio} className="flex h-7 items-center" title={m.nombre}>
                {m.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.logo} alt={m.nombre} className="h-5 w-auto max-w-[120px] opacity-60 [filter:brightness(0)_invert(1)]" />
                ) : (
                  <span className="text-[15px] font-semibold tracking-tight text-white/55">{m.nombre}</span>
                )}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* EL REPORTE                                                          */

function Reporte({ r, hub, nombrePais }: { r: Resumen; hub: string; nombrePais: string }) {
  const pico = picoDeConversacion(r);
  const dom = redDominante(r);
  const nomRed = (k: string) => REDES.find((x) => x.key === k)?.nombre ?? k;
  const tonoTot = r.tono.positivo + r.tono.neutral + r.tono.negativo || 1;
  const tonos = [
    { k: "Positivo", v: r.tono.positivo, c: C.verde },
    { k: "Neutral", v: r.tono.neutral, c: "#55565C" },
    { k: "Negativo", v: r.tono.negativo, c: C.rojo },
  ];
  const cercaPico = pico
    ? r.titulares.filter((t) => Math.abs(new Date(t.fecha).getTime() - new Date(pico.dia).getTime()) <= 2 * 864e5)
    : [];
  const titulares = cercaPico.length ? cercaPico : r.titulares;
  const maxMedio = Math.max(1, ...r.medios.map((m) => m.n));

  return (
    <section id="reporte" className="relative scroll-mt-24 border-b border-white/10 py-16 md:py-24">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className={`${rotulo} text-[#C59AF0]`}>Reporte Sentinel · {r.marca} · {nombrePais}</p>
          <p className={`${rotulo} text-white/40`}>{fechaLarga(r.desde)} al {fechaLarga(r.hasta)}</p>
        </div>

        {/* Volumen */}
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="text-[84px] font-semibold leading-[0.9] tracking-[-0.04em] tabular-nums md:text-[156px]"
            >
              {fmt(r.total)}
            </motion.p>
            <p className="mt-4 max-w-[520px] text-[19px] leading-snug text-white/80">
              menciones públicas de <strong className="font-semibold text-white">{r.marca}</strong> en {nombrePais} en los últimos 30 días.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
            {dom && (
              <Dato titulo="Donde más se habla" valor={nomRed(dom.key)} nota={`${pct(dom.parte)} de la muestra`} />
            )}
            {r.alcance > 0 && <Dato titulo="Alcance estimado" valor={fmt(r.alcance)} nota="personas que pudieron verlo" />}
            {r.interacciones > 0 && <Dato titulo="Interacciones" valor={fmt(r.interacciones)} nota="reacciones, comentarios y compartidos" />}
            <Dato titulo="Muestra leída" valor={fmt(r.muestra)} nota="menciones clasificadas una por una" />
          </div>
        </div>

        {/* Serie diaria sobre el fondo */}
        {r.porDia.length > 1 && <Serie dias={r.porDia} pico={pico?.dia} />}

        {/* Pico */}
        {pico && (
          <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className={`${rotulo} text-white/45`}>Día pico</p>
              <p className="mt-3 text-[40px] font-semibold leading-none tracking-tight md:text-[52px]">{fechaLarga(pico.dia)}</p>
              <p className="mt-4 max-w-[380px] text-[16px] leading-relaxed text-white/70">
                Ese día se concentró el {pct(pico.parte)} de la muestra: {fmt(pico.n)} menciones en 24 horas. Un pico así es la primera señal de que algo se está moviendo.
              </p>
            </div>
            {titulares.length > 0 && (
              <div>
                <p className={`${rotulo} text-white/45`}>{cercaPico.length ? "Lo que lo detonó" : "Lo que publicaron los medios"}</p>
                <ul className="mt-3">
                  {titulares.slice(0, 4).map((t) => (
                    <li key={t.url} className="border-b border-white/10 py-4 first:pt-2">
                      <a href={t.url} target="_blank" rel="noopener noreferrer" className="group block">
                        <span className="text-[12px] text-[#C59AF0]">{t.medio} · {fechaCorta(t.fecha)}</span>
                        <span className="mt-1 block text-[17px] leading-snug text-white/90 transition group-hover:text-white">{t.titulo}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Tono + amplificadores */}
        <div className="mt-14 grid gap-12 border-t border-white/10 pt-10 lg:grid-cols-2">
          <div>
            <p className={`${rotulo} text-white/45`}>Tono de la conversación</p>
            <div className="mt-5 flex h-3 overflow-hidden rounded-[2px]">
              {tonos.map((t, i) => (
                <motion.span
                  key={t.k}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(t.v / tonoTot) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.9, ease }}
                  style={{ background: t.c }}
                />
              ))}
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-4">
              {tonos.map((t) => (
                <div key={t.k}>
                  <dt className="flex items-center gap-2 text-[13px] text-white/55">
                    <span className="h-2 w-2 rounded-[2px]" style={{ background: t.c }} />
                    {t.k}
                  </dt>
                  <dd className="mt-1 text-[28px] font-semibold tabular-nums">{pct(t.v / tonoTot)}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 text-[14px] leading-relaxed text-white/55">
              Clasificado sobre la muestra. Sentinel completo lee cada comentario con el contexto de tu marca y de tu categoría.
            </p>
          </div>
          {r.medios.length > 0 && (
            <div>
              <p className={`${rotulo} text-white/45`}>Quién te amplifica</p>
              <ul className="mt-4">
                {r.medios.slice(0, 6).map((m) => (
                  <li key={m.nombre} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_40px] items-center gap-4 border-b border-white/[0.07] py-2.5">
                    <span className="truncate text-[15px] text-white/85">{m.nombre}</span>
                    <span className="h-[5px] rounded-[2px] bg-white/[0.06]">
                      <motion.span
                        className="block h-full rounded-[2px] bg-[#C59AF0]"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${(m.n / maxMedio) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease }}
                      />
                    </span>
                    <span className="text-right text-[13px] tabular-nums text-white/60">{m.n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Lo que haría Sentinel completo */}
        <div className="mt-16 rounded-[10px] border border-[#C59AF0]/25 bg-[#4A1D6E]/20 p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <p className="text-[26px] font-semibold leading-tight tracking-tight md:text-[32px]">
                Esto es una foto. Sentinel completo es la película.
              </p>
              <p className="mt-4 text-[16px] leading-relaxed text-white/70">
                Con la escucha continua, {r.marca} tendría esta lectura todos los días, al lado de sus competidores, y la alerta llegaría el mismo día del pico, no un mes después.
              </p>
            </div>
            <PanelDemo hub={hub} idea={`Escucha digital gratis (Sentinel): ${r.marca}, ${nombrePais}. ${r.total} menciones en 30 días${pico ? `, pico el ${pico.dia}` : ""}. Pide la demo completa.`} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Dato({ titulo, valor, nota }: { titulo: string; valor: string; nota: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-white/45">{titulo}</p>
      <p className="mt-1 text-[21px] font-semibold leading-tight tracking-tight tabular-nums md:text-[26px]">{valor}</p>
      <p className="mt-0.5 text-[12px] leading-snug text-white/45">{nota}</p>
    </div>
  );
}

function Serie({ dias, pico }: { dias: { dia: string; n: number }[]; pico?: string }) {
  const W = 1000;
  const H = 220;
  const max = Math.max(1, ...dias.map((d) => d.n));
  const pts = dias.map((d, i) => [(i / (dias.length - 1)) * W, H - (d.n / max) * (H - 16)] as const);
  const linea = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${linea} L${W},${H} L0,${H} Z`;
  const ip = pico ? dias.findIndex((d) => d.dia === pico) : -1;
  return (
    <div className="relative mt-14">
      <div className="flex items-baseline justify-between">
        <p className={`${rotulo} text-white/45`}>Menciones por día</p>
        <p className="text-[12px] text-white/40">máximo {fmt(max)}</p>
      </div>
      <div className="relative mt-4 h-[180px] md:h-[240px]">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <linearGradient id="sv-area" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#C59AF0" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#C59AF0" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="rgba(255,255,255,0.06)" vectorEffect="non-scaling-stroke" />
          ))}
          <motion.path d={area} fill="url(#sv-area)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.2 }} />
          <motion.path
            d={linea}
            fill="none"
            stroke="#C59AF0"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease }}
          />
        </svg>
        {ip >= 0 && (
          <div className="absolute top-0 bottom-0" style={{ left: `${(ip / (dias.length - 1)) * 100}%` }}>
            <span className="absolute bottom-0 top-0 w-px bg-[#D42A20]/70" />
            <span
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D42A20] ring-4 ring-[#D42A20]/25"
              style={{ top: `${(pts[ip][1] / H) * 100}%` }}
            />
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-white/40">
        <span>{fechaCorta(dias[0].dia)}</span>
        <span>{fechaCorta(dias[dias.length - 1].dia)}</span>
      </div>
    </div>
  );
}

/* Panel inline (sin modal): botón que despliega el formulario de correo. */
function PanelDemo({ hub, idea, claro }: { hub: string; idea: string; claro?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [correo, setCorreo] = useState("");
  const [fase, setFase] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(correo)) return;
    setFase("enviando");
    const ok = await registrarLead(hub, correo, idea);
    setFase(ok ? "ok" : "error");
  };
  return (
    <div>
      {!abierto && (
        <button
          onClick={() => setAbierto(true)}
          className={`flex h-14 w-full items-center justify-between rounded-[6px] px-5 text-[16px] font-semibold transition ${claro ? "bg-[#17171B] text-white hover:bg-black" : "bg-[#C59AF0] text-[#17171B] hover:bg-[#d4b3f5]"}`}
        >
          Ver demo completa <span aria-hidden>→</span>
        </button>
      )}
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease }}
            className="overflow-hidden"
          >
            <div className={`rounded-[8px] border p-5 ${claro ? "border-black/10 bg-white" : "border-white/15 bg-[#0B0A10]/70"}`}>
              {fase === "ok" ? (
                <div>
                  <p className="text-[18px] font-semibold">Listo, recibimos tu correo.</p>
                  <p className={`mt-2 text-[15px] leading-relaxed ${claro ? "text-[#55565C]" : "text-white/70"}`}>
                    El equipo de Shift en tu país te escribe para mostrarte tu tablero de Sentinel con tu marca y tus competidores.
                  </p>
                </div>
              ) : (
                <form onSubmit={enviar}>
                  <label htmlFor={claro ? "correo-c" : "correo-r"} className={`text-[14px] ${claro ? "text-[#55565C]" : "text-white/70"}`}>
                    ¿A qué correo te escribimos?
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id={claro ? "correo-c" : "correo-r"}
                      type="email"
                      required
                      autoFocus
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="tu@empresa.com"
                      className={`h-12 min-w-0 flex-1 rounded-[6px] border px-4 text-[16px] outline-none focus:border-[#C59AF0] ${claro ? "border-black/15 bg-[#F6F6F4] text-[#17171B]" : "border-white/15 bg-white/[0.04] text-white placeholder:text-white/35"}`}
                    />
                    <button
                      disabled={fase === "enviando"}
                      className="h-12 rounded-[6px] bg-[#4A1D6E] px-5 text-[15px] font-semibold text-white transition hover:bg-[#5d2689] disabled:opacity-60"
                    >
                      {fase === "enviando" ? "Enviando" : "Pedir demo"}
                    </button>
                  </div>
                  <p className={`mt-3 text-[12px] ${claro ? "text-[#7D7F87]" : "text-white/45"}`}>
                    {fase === "error" ? "No se pudo enviar. Intenta otra vez." : "Solo lo usa el equipo de Shift en tu país, una vez. Sin listas de correo."}
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* NARRATIVA CON DATOS REALES                                          */

const FUENTES: [string, string][] = [
  ["tiktok", "TikTok"],
  ["twitter", "X"],
  ["facebook", "Facebook"],
  ["news", "Noticias"],
  ["instagram", "Instagram"],
  ["reddit", "Reddit"],
  ["blog", "Blogs"],
  ["youtube", "YouTube"],
  ["radio", "Radio"],
];

function Narrativa() {
  const s = SENTINEL_REAL;
  const max = s.porFuente.tiktok;
  return (
    <section className="relative border-b border-white/10 py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <h2 className="text-[34px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[50px]">
              Escuchar todo el ruido no sirve. Hay que separar lo que es de tu marca.
            </h2>
            <p className="mt-6 max-w-[500px] text-[17px] leading-relaxed text-white/70">
              Cada mención que entra a Sentinel pasa por una compuerta de pertinencia: si no habla de tu marca, no cuenta. Lo que queda es conversación real, con su fuente y su fecha, lista para decidir.
            </p>
            <div className="mt-12">
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease }}
                className="text-[72px] font-semibold leading-none tracking-[-0.04em] text-[#C59AF0] tabular-nums md:text-[112px]"
              >
                {fmt(s.menciones)}
              </motion.p>
              <p className="mt-3 max-w-[440px] text-[16px] leading-snug text-white/75">
                menciones curadas desde {s.desde}, después de la compuerta, en 12 fuentes distintas.
              </p>
            </div>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-white/10 pt-6">
              <div>
                <dt className="text-[12px] leading-snug text-white/45">alertas enviadas</dt>
                <dd className="mt-1 text-[26px] font-semibold tabular-nums md:text-[32px]">{fmt(s.alertasEnviadas)}</dd>
              </div>
              <div>
                <dt className="text-[12px] leading-snug text-white/45">mensajes de canales propios</dt>
                <dd className="mt-1 text-[26px] font-semibold tabular-nums md:text-[32px]">{fmt(s.mensajesDeCanal)}</dd>
              </div>
              <div>
                <dt className="text-[12px] leading-snug text-white/45">comentarios leídos</dt>
                <dd className="mt-1 text-[26px] font-semibold tabular-nums md:text-[32px]">{fmt(s.comentariosLeidos)}</dd>
              </div>
            </dl>
          </div>

          <div className="lg:pt-3">
            <p className={`${rotulo} text-white/45`}>Dónde ocurrió la conversación curada</p>
            <ul className="mt-5">
              {FUENTES.map(([k, nombre], i) => (
                <li key={k} className="grid grid-cols-[92px_minmax(0,1fr)_56px] items-center gap-4 border-b border-white/[0.07] py-3">
                  <span className="text-[15px] text-white/85">{nombre}</span>
                  <span className="h-[8px] rounded-[2px] bg-white/[0.05]">
                    <motion.span
                      className="block h-full rounded-[2px]"
                      style={{ background: i === 0 ? "#C59AF0" : "rgba(197,154,240,0.55)" }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(s.porFuente[k] / max) * 100}%` }}
                      viewport={{ once: true, margin: "-60px" }}
                      transition={{ delay: i * 0.06, duration: 0.9, ease }}
                    />
                  </span>
                  <span className="text-right text-[14px] tabular-nums text-white/70">{fmt(s.porFuente[k])}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 max-w-[460px] text-[15px] leading-relaxed text-white/60">
              La fuente más grande es TikTok, justo la que una escucha rápida no alcanza. Por eso el monitoreo completo suma fuentes que la herramienta gratis no tiene, como TikTok, LinkedIn y radio.
            </p>
            <p className="mt-6 text-[12px] text-white/40">Medido por Sentinel, {FECHA_DATOS}. Datos agregados de las marcas que escuchamos, sin nombrar a ninguna.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Producto() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 py-20 md:py-28">
      <div className="mx-auto w-full max-w-[1240px] px-5 md:px-10">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <h2 className="text-[34px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[50px]">El pulso de tu marca, ahora mismo.</h2>
          <p className="max-w-[560px] text-[17px] leading-relaxed text-white/70 lg:justify-self-end">
            Así se ve Sentinel por dentro: el radar en vivo avisa cuando el tono gira, cuando aparece una fuente nueva o cuando un competidor acelera. El tablero junta tus canales propios con lo que se dice afuera.
          </p>
        </div>
        <div className="relative mt-12 md:mt-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease }}
            className="relative w-full overflow-hidden rounded-[10px] border border-white/10 shadow-[0_40px_120px_-30px_rgba(74,29,110,0.7)] md:w-[78%]"
          >
            <Image src="/escucha/sentinel/vivo.webp" alt="Radar en vivo de Sentinel con giro de sentimiento y señales tempranas" width={1920} height={1200} className="h-auto w-full" sizes="(min-width: 768px) 78vw, 100vw" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ delay: 0.2, duration: 1.1, ease }}
            className="relative -mt-10 ml-auto hidden w-[46%] overflow-hidden rounded-[10px] border border-white/15 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] md:-mt-[22%] md:block"
          >
            <Image src="/escucha/sentinel/inicio.webp" alt="Tablero de Sentinel con canales propios, volumen, sentimiento y share of voice" width={1920} height={1200} className="h-auto w-full" sizes="46vw" />
          </motion.div>
        </div>
        <p className="mt-6 text-[12px] text-white/40">Capturas reales de Sentinel con datos anonimizados: «Su marca» y «Competidor A».</p>
      </div>
    </section>
  );
}

const COMPLETO = [
  { t: "Escucha continua", d: "Todos los días, no una foto de 30 días. Ves cómo cambia la conversación semana a semana." },
  { t: "Tus competidores al lado", d: "Share of voice medido: cuánto de la conversación de tu categoría es tuya y cuánto de ellos." },
  { t: "Alertas en el momento", d: "Cuando sube lo negativo o aparece un término sensible, la alerta llega con la mención y su alcance." },
  { t: "Radio y TV", d: "Lo que se dice al aire también entra, transcrito y clasificado junto con redes y medios." },
  { t: "Tus canales propios", d: "Comentarios, mensajes y casos de servicio de tus cuentas, leídos y agrupados por lo que reclaman." },
  { t: "Compuerta de pertinencia", d: "Separa el ruido de tu marca: homónimos, spam y menciones sueltas quedan fuera del conteo." },
];

function Completo() {
  return (
    <section className="border-b border-white/10 bg-[#F4F4F2] py-20 text-[#17171B] md:py-28">
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[17px] font-semibold tracking-[0.32em] text-[#4A1D6E]">SENTINEL</p>
          <h2 className="mt-5 text-[34px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[46px]">Lo que suma el monitoreo completo.</h2>
          <p className="mt-5 max-w-[400px] text-[16px] leading-relaxed text-[#55565C]">
            La herramienta gratis te muestra la conversación. Sentinel completo la vigila por ti y te avisa antes de que crezca.
          </p>
        </div>
        <dl className="grid gap-x-12 sm:grid-cols-2">
          {COMPLETO.map((x, i) => (
            <motion.div
              key={x.t}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 2) * 0.08, duration: 0.6, ease }}
              className="border-t border-[#BDBDB7] py-6"
            >
              <dt className="text-[19px] font-semibold">{x.t}</dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-[#55565C]">{x.d}</dd>
            </motion.div>
          ))}
        </dl>
      </div>
    </section>
  );
}

const PREGUNTAS = [
  { p: "¿De verdad es gratis?", r: "Sí. Una escucha por marca, sin cuenta y sin tarjeta. Si quieres seguir la conversación todos los días, la demo completa te muestra cómo se ve Sentinel con tu marca." },
  { p: "¿De dónde salen los datos?", r: "De la misma escucha que Sentinel usa con marcas de la región: menciones públicas en redes sociales, medios digitales, blogs y foros de tu país en los últimos 30 días." },
  { p: "¿Por qué el total y la muestra son distintos?", r: "El total cuenta todas las menciones exactas de tu marca. Para el tono, las redes y los medios leemos una muestra, que alcanza para ver la forma de la conversación." },
  { p: "¿Por qué TikTok y LinkedIn dicen «monitoreo completo»?", r: "Porque esas redes no entran en la escucha rápida. En el monitoreo completo las sumamos con otra fuente, igual que radio y TV." },
  { p: "¿Qué hacen con mi correo?", r: "Solo lo usamos si pides la demo completa: le llega al equipo de Shift en tu país, que te escribe una vez. No entra a ninguna lista de correo." },
];

function Preguntas() {
  const [abierta, setAbierta] = useState<number | null>(0);
  return (
    <section className="border-b border-white/10 py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-[1240px] gap-12 px-5 md:px-10 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="text-[34px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[46px]">Preguntas frecuentes</h2>
        <ul>
          {PREGUNTAS.map((q, i) => (
            <li key={q.p} className="border-b border-white/10">
              <button
                onClick={() => setAbierta(abierta === i ? null : i)}
                aria-expanded={abierta === i}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-[18px] font-medium"
              >
                {q.p}
                <motion.span animate={{ rotate: abierta === i ? 45 : 0 }} className="text-[22px] font-light text-[#C59AF0]">+</motion.span>
              </button>
              <AnimatePresence initial={false}>
                {abierta === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease }}
                    className="overflow-hidden pr-10 text-[15px] leading-relaxed text-white/65"
                  >
                    <span className="block pb-5">{q.r}</span>
                  </motion.p>
                )}
              </AnimatePresence>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Cierre({ hub, nombrePais }: { hub: string; nombrePais: string }) {
  const idea = useMemo(() => `Demo completa de Sentinel desde la escucha digital gratis (${nombrePais}).`, [nombrePais]);
  return (
    <section className="relative isolate overflow-hidden py-20 md:py-28">
      <div aria-hidden className="absolute bottom-[-40%] left-1/2 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#4A1D6E] opacity-40 blur-[150px]" />
      <div className="mx-auto grid w-full max-w-[1240px] gap-10 px-5 md:px-10 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <h2 className="text-[36px] font-semibold leading-[1.04] tracking-[-0.025em] md:text-[56px]">
          Mañana se va a hablar de tu marca. Decide si te enteras a tiempo.
        </h2>
        <div>
          <p className="mb-5 text-[16px] leading-relaxed text-white/70">El equipo de Shift en {nombrePais} te muestra Sentinel con tu marca, tus competidores y tus canales.</p>
          <PanelDemo hub={hub} idea={idea} />
        </div>
      </div>
      <div className="mx-auto mt-16 flex w-full max-w-[1240px] flex-wrap items-center justify-between gap-4 border-t border-white/10 px-5 pt-6 text-[13px] text-white/45 md:px-10">
        <span><span className="font-semibold tracking-[0.32em] text-[#C59AF0]">SENTINEL</span> by Shift</span>
        <span className="flex gap-5">
          <Link href="/shift-lab/escucha-gratis" className="hover:text-white">Escucha integral</Link>
          <Link href="/shift-lab/escucha-ia" className="hover:text-white">Escucha de IA · Eco</Link>
        </span>
      </div>
    </section>
  );
}
