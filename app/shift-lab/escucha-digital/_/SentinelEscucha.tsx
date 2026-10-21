"use client";

import SentinelPorDentro from "./SentinelPorDentro";
import { FAQ_SENTINEL } from "@/lib/escucha/faq";
import EscenaSentinel from "./EscenaSentinel";
import Copiloto from "@/components/escucha/Copiloto";
import Peaje from "./Peaje";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Confirmacion, useSolicitud } from "@/components/escucha/PedirReporte";
import { useCampoMarca } from "@/components/escucha/CampoMarca";
import { SentinelMarca } from "@/components/escucha/SentinelMarca";
import { SelectorPais } from "@/components/escucha/SelectorPais";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { escuchaInicial, registrarLead, type Resumen } from "@/lib/escucha/cliente";
import { picoDeConversacion, redDominante } from "@/lib/escucha/lectura";
import { REDES } from "@/lib/escucha/redes";
import { MEDIOS } from "@/lib/escucha/medios";
import { PAISES, paisDelNavegador, paisPorCc } from "@/lib/escucha/paises";
import { SENTINEL_REAL, FECHA_DATOS } from "@/lib/escucha/datos-reales";


/* Tokens del producto Sentinel (tablero real): papel claro, tarjetas blancas, un solo acento. */
const C = {
  papel: "#F4F4F2",
  papel2: "#ECECE8",
  ink: "#17171B",
  gris: "#5F6068",
  gris2: "#8A8B92",
  linea: "#DCDCD6",
  morado: "#9244D8",
  rojo: "#D42A20",
  verde: "#1E874B",
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

const ease = [0.22, 1, 0.36, 1] as const;
const ancho = "mx-auto w-full max-w-[1200px] px-5 md:px-10";
const tarjeta = "rounded-[6px] border border-[#DCDCD6] bg-white";
const etiqueta = "text-[13px] font-medium text-[#5F6068]";
const num = "tabular-nums [font-family:var(--font-plex-mono)]";
const btn = "inline-flex h-12 items-center justify-center rounded-[4px] bg-[#9244D8] px-5 text-[15px] font-medium text-white transition-colors hover:bg-[#3A1657] disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------------------------------------------ */

export default function SentinelEscucha() {
  const [cc, setCc] = useState("cr");
  const campoMarca = useCampoMarca();
  const [correo, setCorreo] = useState("");
  const sol = useSolicitud("digital");
  const pais = paisPorCc(cc);
  useEffect(() => {
    const ini = escuchaInicial();
    const valido = ini ? PAISES.some((x) => x.cc === ini.cc) : false;
    setCc(valido && ini ? ini.cc : paisDelNavegador());
    if (ini?.desde === "url") campoMarca.prellenar(ini.marca);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Los píxeles caen rápido y sin orden mientras se pide y unos segundos después: la escucha ya arrancó.
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    if (sol.estado.fase === "enviando") setOcupado(true);
    if (sol.estado.fase === "enviado") {
      const t = setTimeout(() => setOcupado(false), 9000);
      return () => clearTimeout(t);
    }
    if (sol.estado.fase === "error") setOcupado(false);
  }, [sol.estado.fase]);

  const enviar = (e: FormEvent) => {
    e.preventDefault();
    if (!campoMarca.valido || sol.estado.fase === "enviando") return;
    void sol.pedir(campoMarca.datos(), cc, correo);
  };
  const campo = "mt-1.5 h-12 w-full rounded-[4px] border border-[#CFCFC9] bg-white px-3.5 text-[16px] outline-none transition-colors placeholder:text-[#8A8B92] focus:border-[#9244D8]";

  return (
    <div className="overflow-x-clip text-[#17171B] [font-family:var(--font-plex)]" style={{ background: C.papel }}>
      <BarraMarca />

      {/* ---------- HERO + HERRAMIENTA ---------- */}
      <section className="relative isolate pt-12 pb-20 md:pt-16 md:pb-28">
        <Peaje ocupado={ocupado} />
        <div className={`relative z-10 ${ancho} grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14`}>
          <div>
            <p className={etiqueta}>Reporte gratis · redes y medios de {pais.nombre}</p>
            <h1 className="mt-3 max-w-[600px] text-[30px] font-semibold leading-[1.08] tracking-[-0.02em] sm:mt-4 sm:text-[36px] md:text-[52px]">
              La conversación sobre tu marca no espera. Escúchala hoy.
            </h1>
            <p className="mt-4 max-w-[540px] text-[15px] leading-relaxed text-[#5F6068] sm:mt-5 sm:text-[17px]">
              Sentinel lee 30 días de conversación pública en {pais.nombre} y te envía un reporte: cuánto se habla de ti, dónde, en qué tono, qué la encendió y qué palabras están subiendo.
            </p>

            <form onSubmit={enviar} className={`${tarjeta} mt-6 max-w-[560px] p-4 sm:mt-8 md:p-5`}>
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_170px]">
                <div className="min-w-0">
                  <label htmlFor="marca" className={etiqueta}>{campoMarca.etiqueta}</label>
                  <input id="marca" {...campoMarca.inputProps} className={campo} />
                  <button type="button" onClick={campoMarca.alternar} className="mt-1.5 text-[12px] text-[#9244D8] underline underline-offset-2">{campoMarca.textoAlternar}</button>
                </div>
                <div>
                  <span className={etiqueta}>País</span>
                  <SelectorPais cc={cc} onCc={setCc} tono="sentinel" className="mt-1.5 h-12 rounded-[4px] border border-[#CFCFC9] bg-white px-3 text-[15px] outline-none transition-colors focus-visible:border-[#9244D8] aria-expanded:border-[#9244D8]" />
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor="correo" className={etiqueta}>Correo de trabajo</label>
                <input id="correo" type="email" autoComplete="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="nombre@tuempresa.com" required className={campo} aria-invalid={sol.estado.campo === "correo"} />
              </div>
              <div className="mt-4 flex flex-col gap-2.5">
                <button type="submit" disabled={sol.estado.fase === "enviando" || !campoMarca.valido} className={`${btn} w-full whitespace-nowrap`}>
                  {sol.estado.fase === "enviando" ? "Pidiendo el reporte" : "Recibir mi reporte"}
                </button>
                <p className="text-[13px] text-[#8A8B92]">Gratis y sin cuenta. Solo correos de empresa: te enviamos un enlace privado al reporte.</p>
              </div>
            </form>
            <div className="max-w-[560px]"><Confirmacion estado={sol.estado} tono="sentinel" onOtro={sol.reiniciar} /></div>
          </div>

          <Superficies ocupado={ocupado} />
        </div>
      </section>

      <FranjaMedios cc={cc} nombrePais={pais.nombre} />

      {/* Por dentro y el resto: siempre visibles. El reporte llega por correo. */}
      <SentinelPorDentro />
      <EscenaSentinel pais={pais.nombre} />
      <Copiloto tema="sentinel" />
      <Completo />
      <Preguntas />
      <Cierre hub={pais.hub} nombrePais={pais.nombre} />
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Wordmark() {
  return (
    <span className="flex items-baseline gap-1.5">
      <SentinelMarca className="text-[19px]" />
      <span className="text-[13px] text-[#8A8B92]">by Shift</span>
    </span>
  );
}

function BarraMarca() {
  return (
    <header className="border-b border-[#DCDCD6] bg-[#F4F4F2]">
      <div className={`${ancho} flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-24 pb-4 md:pt-28`}>
        <Wordmark />
        <nav className="flex gap-5 text-[14px] text-[#5F6068]">
          <Link href="/shift-lab/escucha-gratis" className="transition-colors hover:text-[#17171B]">Escucha integral</Link>
          <Link href="/shift-lab/escucha-ia" className="transition-colors hover:text-[#17171B]">Escucha de IA · Eco</Link>
        </nav>
      </div>
    </header>
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
  const alerta = fase === "error" || fase === "tope";
  return (
    <AnimatePresence mode="wait">
      {t[fase] && (
        <motion.p
          key={fase}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={`mt-4 max-w-[560px] overflow-hidden border-l-2 pl-3.5 text-[14px] leading-relaxed text-[#5F6068] ${alerta ? "border-[#D42A20]" : "border-[#9244D8]"}`}
        >
          {t[fase]}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/* Tabla de superficies: las 11 siempre visibles. Con reporte muestra la muestra por superficie. */
function Superficies({ ocupado, resumen }: { ocupado: boolean; resumen?: Resumen }) {
  const total = resumen ? Math.max(1, Object.values(resumen.porRed).reduce((a, b) => a + b, 0)) : 1;
  const estado = ocupado ? "Leyendo" : resumen ? "Listo" : "En espera";
  return (
    <div className={`${tarjeta} self-start`}>
      <div className="flex items-baseline justify-between border-b border-[#DCDCD6] px-5 py-3.5">
        <h2 className="text-[15px] font-semibold">Dónde escucha Sentinel</h2>
        <span className={`text-[13px] ${resumen ? "text-[#1E874B]" : "text-[#8A8B92]"}`}>{estado}</span>
      </div>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] border-b border-[#ECECE8] px-5 py-2 text-[12px] text-[#8A8B92]">
        <span>Superficie</span>
        <span>{resumen ? "Menciones en la muestra" : "Cobertura"}</span>
      </div>
      <ul>
        {REDES.map((r) => {
          const n = resumen?.porRed[r.key] ?? 0;
          return (
            <li key={r.key} className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#ECECE8] px-5 py-[9px] last:border-0">
              {r.icono ? (
                <Image src={r.icono} alt="" width={16} height={16} className="h-4 w-4 opacity-70 [filter:brightness(0)]" />
              ) : (
                <span className="h-1.5 w-1.5 justify-self-center rounded-full bg-[#8A8B92]" />
              )}
              <span className={`truncate text-[14px] ${r.soloCompleto ? "text-[#8A8B92]" : ""}`}>{r.nombre}</span>
              {r.soloCompleto ? (
                <span className="text-right text-[13px] text-[#9244D8]">Entra en el monitoreo completo</span>
              ) : resumen ? (
                <span className="flex items-baseline gap-3 text-right">
                  <span className={`${num} text-[14px]`}>{fmt(n)}</span>
                  <span className={`${num} w-10 text-[12px] text-[#8A8B92]`}>{n ? pct(n / total) : "0 %"}</span>
                </span>
              ) : (
                <span className="text-right text-[13px] text-[#8A8B92]">{ocupado ? "leyendo" : "incluida"}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="border-t border-[#DCDCD6] bg-[#FAFAF8] px-5 py-3 text-[12px] leading-relaxed text-[#8A8B92]">
        {resumen ? `Conteo sobre una muestra de ${fmt(resumen.muestra)} menciones.` : "Las 11 superficies, siempre. Radio y TV entran en el monitoreo completo."}
      </p>
    </div>
  );
}

function FranjaMedios({ cc, nombrePais }: { cc: string; nombrePais: string }) {
  const lista = MEDIOS[cc] ?? [];
  if (!lista.length) return null;
  return (
    <section className="border-b border-[#DCDCD6] bg-white py-6">
      <div className={`${ancho} flex flex-col gap-4 md:flex-row md:items-center md:gap-10`}>
        <p className="shrink-0 text-[13px] text-[#5F6068]">Medios que escuchamos en {nombrePais}</p>
        <AnimatePresence mode="wait">
          <motion.div
            key={cc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]"
          >
            <motion.ul className="flex w-max flex-nowrap items-center gap-x-10" animate={{ x: ["0%", "-50%"] }} transition={{ duration: Math.max(18, lista.length * 3), repeat: Infinity, ease: "linear" }}>
              {[...lista, ...lista].map((m, i) => (
                <li key={m.dominio + i} className="flex h-7 shrink-0 items-center whitespace-nowrap" title={m.nombre} aria-hidden={i >= lista.length}>
                  {m.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.logo} alt={m.nombre} className="h-5 w-auto max-w-[120px] opacity-55 [filter:grayscale(1)_brightness(0)]" />
                  ) : (
                    <span className="text-[15px] font-semibold tracking-tight text-[#5F6068]">{m.nombre}</span>
                  )}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* EL REPORTE                                                          */

export function Reporte({ r, hub, nombrePais }: { r: Resumen; hub: string; nombrePais: string }) {
  const pico = picoDeConversacion(r);
  const dom = redDominante(r);
  const nomRed = (k: string) => REDES.find((x) => x.key === k)?.nombre ?? k;
  const tonoTot = r.tono.positivo + r.tono.neutral + r.tono.negativo || 1;
  const tonos = [
    { k: "Positivo", v: r.tono.positivo, c: C.verde },
    { k: "Neutral", v: r.tono.neutral, c: "#B9B9B3" },
    { k: "Negativo", v: r.tono.negativo, c: C.rojo },
  ];
  const cercaPico = pico
    ? r.titulares.filter((t) => Math.abs(new Date(t.fecha).getTime() - new Date(pico.dia).getTime()) <= 2 * 864e5)
    : [];
  const titulares = cercaPico.length ? cercaPico : r.titulares;
  const maxMedio = Math.max(1, ...r.medios.map((m) => m.n));
  const datos = [
    dom && { t: "Donde más se habla", v: nomRed(dom.key), n: `${pct(dom.parte)} de la muestra`, texto: true },
    r.alcance > 0 && { t: "Alcance estimado", v: fmt(r.alcance), n: "personas que pudieron verlo" },
    r.interacciones > 0 && { t: "Interacciones", v: fmt(r.interacciones), n: "reacciones, comentarios y compartidos" },
    { t: "Muestra leída", v: fmt(r.muestra), n: "menciones clasificadas una por una" },
  ].filter(Boolean) as { t: string; v: string; n: string; texto?: boolean }[];

  return (
    <section id="reporte" className="scroll-mt-20 py-14 md:py-20">
      <div className={ancho}>
        <div className={tarjeta}>
          {/* Encabezado del informe */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[#DCDCD6] px-5 py-4 md:px-8">
            <h2 className="text-[18px] font-semibold md:text-[20px]">Reporte de escucha · {r.marca} · {nombrePais}</h2>
            <p className="text-[13px] text-[#5F6068]">{fechaLarga(r.desde)} al {fechaLarga(r.hasta)}</p>
          </div>

          {/* Total: el único número grande */}
          <div className="grid gap-8 px-5 pt-8 pb-8 md:px-8 lg:grid-cols-[1fr_1.15fr] lg:items-end">
            <div>
              <p className={etiqueta}>Menciones públicas, últimos 30 días</p>
              <p className="mt-2 text-[76px] font-semibold leading-[0.95] tracking-[-0.035em] tabular-nums md:text-[128px]">{fmt(r.total)}</p>
              <p className="mt-3 max-w-[460px] text-[16px] leading-snug text-[#5F6068]">
                veces que se nombró a <strong className="font-semibold text-[#17171B]">{r.marca}</strong> en redes, medios y blogs de {nombrePais}.
              </p>
            </div>
            <dl className="grid grid-cols-2 border-t border-[#DCDCD6] lg:border-t-0">
              {datos.map((d, i) => (
                <div key={d.t} className={`min-w-0 border-[#DCDCD6] py-4 ${i % 2 ? "pl-5" : "pr-5"} ${i % 2 === 1 ? "border-l" : ""} ${i >= 2 ? "border-t" : ""}`}>
                  <dt className="text-[13px] text-[#5F6068]">{d.t}</dt>
                  <dd className={`mt-1 break-words text-[20px] font-semibold leading-tight md:text-[26px] ${d.texto ? "" : "tabular-nums"}`}>{d.v}</dd>
                  <dd className="mt-0.5 text-[12px] leading-snug text-[#8A8B92]">{d.n}</dd>
                </div>
              ))}
            </dl>
          </div>

          {r.porDia.length > 1 && <Serie dias={r.porDia} pico={pico?.dia} />}

          {/* Pico y titulares */}
          {pico && (
            <div className="grid gap-8 border-t border-[#DCDCD6] px-5 py-8 md:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
              <div>
                <p className={etiqueta}>Día pico</p>
                <p className="mt-2 text-[32px] font-semibold leading-none tracking-tight md:text-[40px]">{fechaLarga(pico.dia)}</p>
                <p className="mt-4 max-w-[380px] text-[15px] leading-relaxed text-[#5F6068]">
                  Ese día se concentró el {pct(pico.parte)} de la muestra: {fmt(pico.n)} menciones en 24 horas. Un pico así es la primera señal de que algo se está moviendo.
                </p>
              </div>
              {titulares.length > 0 && (
                <div>
                  <p className={etiqueta}>{cercaPico.length ? "Lo que lo detonó" : "Lo que publicaron los medios"}</p>
                  <ul className="mt-2 border-t border-[#DCDCD6]">
                    {titulares.slice(0, 4).map((t) => (
                      <li key={t.url} className="border-b border-[#ECECE8]">
                        <a href={t.url} target="_blank" rel="noopener noreferrer" className="group grid gap-1 py-3.5 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-4">
                          <span className="text-[13px] text-[#8A8B92]">{t.medio} · {fechaCorta(t.fecha)}</span>
                          <span className="text-[16px] leading-snug group-hover:text-[#9244D8] group-hover:underline">{t.titulo}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tono + amplificadores */}
          <div className="grid border-t border-[#DCDCD6] lg:grid-cols-2">
            <div className="px-5 py-8 md:px-8">
              <p className={etiqueta}>Tono de la conversación</p>
              <div className="mt-4 flex h-2.5 overflow-hidden rounded-[2px] bg-[#ECECE8]">
                {tonos.map((t) => (
                  <span key={t.k} style={{ width: `${(t.v / tonoTot) * 100}%`, background: t.c }} />
                ))}
              </div>
              <dl className="mt-4 grid grid-cols-3 gap-4">
                {tonos.map((t) => (
                  <div key={t.k}>
                    <dt className="flex items-center gap-2 text-[13px] text-[#5F6068]">
                      <span className="h-2 w-2 rounded-[1px]" style={{ background: t.c }} />
                      {t.k}
                    </dt>
                    <dd className="mt-1 text-[24px] font-semibold tabular-nums">{pct(t.v / tonoTot)}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-[13px] leading-relaxed text-[#8A8B92]">
                Clasificado sobre la muestra. Sentinel completo lee cada comentario con el contexto de tu marca y de tu categoría.
              </p>
            </div>
            {r.medios.length > 0 && (
              <div className="border-t border-[#DCDCD6] px-5 py-8 md:px-8 lg:border-t-0 lg:border-l">
                <p className={etiqueta}>Quién te amplifica</p>
                <ul className="mt-3">
                  {r.medios.slice(0, 6).map((m) => (
                    <li key={m.nombre} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] items-center gap-4 border-b border-[#ECECE8] py-2.5">
                      <span className="truncate text-[14px]">{m.nombre}</span>
                      <span className="h-1.5 bg-[#ECECE8]">
                        <span className="block h-full bg-[#9244D8]" style={{ width: `${(m.n / maxMedio) * 100}%` }} />
                      </span>
                      <span className={`${num} text-right text-[13px] text-[#5F6068]`}>{m.n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Lo que haría Sentinel completo */}
          <div className="grid gap-6 border-t border-[#DCDCD6] bg-[#FAFAF8] px-5 py-8 md:px-8 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-12">
            <div>
              <p className="text-[20px] font-semibold leading-snug md:text-[22px]">Esto es una foto. Sentinel completo es la película.</p>
              <p className="mt-2 max-w-[480px] text-[15px] leading-relaxed text-[#5F6068]">
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

function Serie({ dias, pico }: { dias: { dia: string; n: number }[]; pico?: string }) {
  const W = 1000;
  const H = 200;
  const max = Math.max(1, ...dias.map((d) => d.n));
  const pts = dias.map((d, i) => [(i / (dias.length - 1)) * W, H - (d.n / max) * (H - 12)] as const);
  const linea = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${linea} L${W},${H} L0,${H} Z`;
  const ip = pico ? dias.findIndex((d) => d.dia === pico) : -1;
  const xp = ip >= 0 ? (ip / (dias.length - 1)) * 100 : 0;
  return (
    <div className="border-t border-[#DCDCD6] px-5 py-8 md:px-8">
      <div className="flex items-baseline justify-between">
        <p className={etiqueta}>Menciones por día</p>
        <p className={`${num} text-[12px] text-[#8A8B92]`}>máx. {fmt(max)}</p>
      </div>
      <div className="relative mt-5 h-[160px] md:h-[220px]">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          {[0, 0.5].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f + 6} y2={H * f + 6} stroke="#ECECE8" vectorEffect="non-scaling-stroke" />
          ))}
          <line x1="0" x2={W} y1={H} y2={H} stroke="#CFCFC9" vectorEffect="non-scaling-stroke" />
          <path d={area} fill="#9244D8" fillOpacity={0.06} />
          <motion.path
            d={linea}
            fill="none"
            stroke="#9244D8"
            strokeWidth={1.75}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease }}
          />
        </svg>
        {ip >= 0 && (
          <div className="absolute top-0 bottom-0" style={{ left: `${xp}%` }}>
            <span className="absolute bottom-0 top-0 w-px bg-[#D42A20]" />
            <span
              className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#D42A20]"
              style={{ top: `${(pts[ip][1] / H) * 100}%` }}
            />
            <span className={`absolute -top-1 whitespace-nowrap text-[12px] font-medium text-[#D42A20] ${xp > 70 ? "right-2" : "left-2"}`}>
              Pico · {fechaCorta(dias[ip].dia)} · {fmt(dias[ip].n)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 flex justify-between text-[12px] text-[#8A8B92]">
        <span>{fechaCorta(dias[0].dia)}</span>
        <span>{fechaCorta(dias[dias.length - 1].dia)}</span>
      </div>
    </div>
  );
}

/* Panel inline (sin modal): botón que despliega el formulario de correo. */
function PanelDemo({ hub, idea, oscuro }: { hub: string; idea: string; oscuro?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [correo, setCorreo] = useState("");
  const [fase, setFase] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const id = oscuro ? "correo-c" : "correo-r";
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
        <button onClick={() => setAbierto(true)} className={`${btn} w-full sm:w-auto`}>
          Ver demo completa
        </button>
      )}
      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="overflow-hidden"
          >
            <div className="rounded-[6px] border border-[#DCDCD6] bg-white p-4 md:p-5">
              {fase === "ok" ? (
                <div>
                  <p className="text-[17px] font-semibold">Listo, recibimos tu correo.</p>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-[#5F6068]">
                    El equipo de Shift en tu país te escribe para mostrarte tu tablero de Sentinel con tu marca y tus competidores.
                  </p>
                </div>
              ) : (
                <form onSubmit={enviar}>
                  <label htmlFor={id} className={etiqueta}>¿A qué correo te escribimos?</label>
                  <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
                    <input
                      id={id}
                      type="email"
                      required
                      autoFocus
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="tu@empresa.com"
                      className="h-12 min-w-0 flex-1 rounded-[4px] border border-[#CFCFC9] bg-white px-3.5 text-[16px] text-[#17171B] outline-none placeholder:text-[#8A8B92] focus:border-[#9244D8]"
                    />
                    <button disabled={fase === "enviando"} className={btn}>
                      {fase === "enviando" ? "Enviando" : "Pedir demo"}
                    </button>
                  </div>
                  <p className={`mt-2.5 text-[12px] ${fase === "error" ? "text-[#D42A20]" : "text-[#8A8B92]"}`}>
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
/* NARRATIVA CON DATOS REALES (la única franja oscura)                 */

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
    <section className="bg-[#17171B] py-16 text-[#F4F4F2] md:py-24">
      <div className={`${ancho} grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20`}>
        <div>
          <h2 className="max-w-[520px] text-[30px] font-semibold leading-[1.12] tracking-[-0.015em] md:text-[40px]">
            Escuchar todo el ruido no sirve. Hay que separar lo que es de tu marca.
          </h2>
          <p className="mt-5 max-w-[500px] text-[16px] leading-relaxed text-white/65">
            Cada mención que entra a Sentinel pasa por una compuerta de pertinencia: si no habla de tu marca, no cuenta. Lo que queda es conversación real, con su fuente y su fecha, lista para decidir.
          </p>
          <div className="mt-10 border-t border-white/15 pt-6">
            <p className="text-[56px] font-semibold leading-none tracking-[-0.03em] tabular-nums md:text-[72px]">{fmt(s.menciones)}</p>
            <p className="mt-2 max-w-[440px] text-[15px] leading-snug text-white/65">
              menciones curadas desde {s.desde}, después de la compuerta, en 12 fuentes distintas.
            </p>
          </div>
          <dl className="mt-8 grid grid-cols-3 border-t border-white/15">
            {[
              ["alertas enviadas", s.alertasEnviadas],
              ["mensajes de canales propios", s.mensajesDeCanal],
              ["comentarios leídos", s.comentariosLeidos],
            ].map(([t, v], i) => (
              <div key={t as string} className={`py-4 ${i ? "border-l border-white/15 pl-4" : "pr-4"}`}>
                <dd className={`${num} text-[20px] md:text-[24px]`}>{fmt(v as number)}</dd>
                <dt className="mt-1 text-[12px] leading-snug text-white/55">{t}</dt>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="text-[13px] font-medium text-white/60">Dónde ocurrió la conversación curada</p>
          <ul className="mt-3 border-t border-white/15">
            {FUENTES.map(([k, nombre]) => (
              <li key={k} className="grid grid-cols-[92px_minmax(0,1fr)_56px] items-center gap-4 border-b border-white/10 py-2.5">
                <span className="text-[14px] text-white/85">{nombre}</span>
                <span className="h-1.5 bg-white/[0.07]">
                  <span className="block h-full bg-[#F4F4F2]/80" style={{ width: `${(s.porFuente[k] / max) * 100}%` }} />
                </span>
                <span className={`${num} text-right text-[13px] text-white/70`}>{fmt(s.porFuente[k])}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[460px] text-[14px] leading-relaxed text-white/60">
            La fuente más grande es TikTok, justo la que una escucha rápida no alcanza. Por eso el monitoreo completo suma fuentes que la herramienta gratis no tiene, como TikTok, LinkedIn y radio.
          </p>
          <p className="mt-5 text-[12px] text-white/40">Fuente: base de Sentinel, medido en {FECHA_DATOS}. Datos agregados de las marcas que escuchamos, sin nombrar a ninguna.</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */


const COMPLETO = [
  { i: "escucha", t: "Escucha continua", d: "Todos los días, no una foto de 30 días. Ves cómo cambia la conversación semana a semana." },
  { i: "compuerta", t: "Compuerta de pertinencia", d: "Separa el ruido de tu marca: homónimos, direcciones, spam y menciones sueltas quedan fuera del conteo." },
  { i: "alerta", t: "Alertas en el momento", d: "Cuando sube lo negativo o aparece un término sensible, la alerta llega con la mención y su alcance." },
  { i: "redes", t: "Tus competidores al lado", d: "Cuánto de la conversación de tu categoría es tuya y cuánto de ellos, en la misma ventana." },
  { i: "medios", t: "Medios, radio y TV", d: "Lo que se publica y lo que se dice al aire, transcrito y clasificado junto con las redes." },
  { i: "tono", t: "Tono que se explica", d: "No solo positivo o negativo: qué tema lo mueve, quién lo empuja y desde cuándo." },
  { i: "canales", t: "Tus canales propios", d: "Comentarios, mensajes y casos de servicio de tus cuentas, leídos y agrupados por lo que reclaman." },
  { i: "memoria", t: "Un copiloto que recuerda", d: "Todo lo que entra queda en su memoria con fuente y fecha, listo para responderte." },
];


function Completo() {
  return (
    <section className="border-y border-[#DCDCD6] bg-white py-16 md:py-24">
      <div className={`${ancho} grid gap-10 lg:grid-cols-[0.55fr_1.45fr] lg:gap-14`}>
        <div>
          <h2 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.015em] md:text-[40px]">Lo que suma el monitoreo completo.</h2>
          <p className="mt-4 max-w-[400px] text-[16px] leading-relaxed text-[#5F6068]">
            La herramienta gratis te muestra la conversación. Sentinel completo la vigila por ti y te avisa antes de que crezca.
          </p>
        </div>
        <ul className="grid gap-x-10 border-t border-[#17171B] sm:grid-cols-2">
          {COMPLETO.map((x) => (
            <li key={x.t} className="grid grid-cols-[72px_minmax(0,1fr)] items-start gap-4 border-b border-[#DCDCD6] py-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/escucha/sentinel/iconos/${x.i}.svg`} alt="" aria-hidden className="h-[72px] w-[72px] object-contain" loading="lazy" />
              <div>
                <h3 className="text-[16px] font-semibold">{x.t}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-[#5F6068]">{x.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}




function Preguntas() {
  const [abierta, setAbierta] = useState<number | null>(0);
  return (
    <section className="py-16 md:py-24">
      <div className={`${ancho} grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14`}>
        <h2 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.015em] md:text-[40px]">Preguntas frecuentes</h2>
        <ul className="border-t border-[#17171B]">
          {FAQ_SENTINEL.map((q, i) => (
            <li key={q.p} className="border-b border-[#DCDCD6]">
              <button
                onClick={() => setAbierta(abierta === i ? null : i)}
                aria-expanded={abierta === i}
                className="flex w-full items-center justify-between gap-6 py-4 text-left text-[17px] font-medium"
              >
                {q.p}
                <span aria-hidden className="text-[20px] font-light text-[#5F6068]">{abierta === i ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {abierta === i && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                    className="overflow-hidden pr-10 text-[15px] leading-relaxed text-[#5F6068]"
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
    <section className="border-t border-[#DCDCD6] bg-[#ECECE8] pt-14 pb-8 md:pt-20">
      <div className={`${ancho} grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-14`}>
        <h2 className="max-w-[620px] text-[30px] font-semibold leading-[1.12] tracking-[-0.015em] md:text-[40px]">
          Mañana se va a hablar de tu marca. Decide si te enteras a tiempo.
        </h2>
        <div>
          <p className="mb-4 text-[16px] leading-relaxed text-[#5F6068]">El equipo de Shift en {nombrePais} te muestra Sentinel con tu marca, tus competidores y tus canales.</p>
          <PanelDemo hub={hub} idea={idea} oscuro />
        </div>
      </div>
      <div className={`${ancho} mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-[#CFCFC9] pt-5 text-[13px] text-[#5F6068]`}>
        <Wordmark />
        <span className="flex gap-5">
          <Link href="/shift-lab/escucha-gratis" className="hover:text-[#17171B]">Escucha integral</Link>
          <Link href="/shift-lab/escucha-ia" className="hover:text-[#17171B]">Escucha de IA · Eco</Link>
        </span>
      </div>
    </section>
  );
}
