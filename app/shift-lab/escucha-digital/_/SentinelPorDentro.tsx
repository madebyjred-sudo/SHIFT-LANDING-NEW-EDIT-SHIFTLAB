"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EJEMPLO_SENTINEL as EJ } from "@/components/escucha/MarcaEjemplo";
import { FECHA_DATOS, SENTINEL_REAL } from "@/lib/escucha/datos-reales";

/* Sentinel por dentro, con una marca que todos reconocen y que además es el
 * caso perfecto para la compuerta: «Amazon» también es un río y una selva.
 * Interfaz dibujada con los tokens del tablero y ampliada (no son capturas). */

const ease = [0.22, 1, 0.36, 1] as const;
const S = { tinta: "#17171B", suave: "#5F6068", tenue: "#8A8B92", linea: "#DCDCD6", fina: "#ECECE8", papel: "#F4F4F2", morado: "#9244D8", rojo: "#D42A20", verde: "#1E874B" };
const mono = "tabular-nums [font-family:var(--font-plex-mono)]";
const ancho = "mx-auto w-full max-w-[1200px] px-5 md:px-10";

function Ventana({ titulo, estado, children }: { titulo: string; estado?: ReactNode; children: ReactNode }) {
  return (
    <div className="sen-zoom">
      <div className="overflow-hidden rounded-[6px] border bg-white shadow-[0_30px_70px_-45px_rgba(23,23,27,0.5)]" style={{ borderColor: S.linea }}>
        <div className="flex items-center justify-between border-b px-4 py-2.5" style={{ borderColor: S.linea }}>
          <span className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: S.tinta }}>
            <span className="h-2 w-2 rounded-[2px]" style={{ background: S.morado }} />
            Sentinel <span className="font-normal" style={{ color: S.tenue }}>· {EJ.marca} · {titulo}</span>
          </span>
          {estado}
        </div>
        {children}
      </div>
    </div>
  );
}

const Vivo = () => (
  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: S.verde }}>
    <motion.span className="h-1.5 w-1.5 rounded-full" style={{ background: S.verde }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />
    En vivo
  </span>
);

/* 1 · La compuerta: cada mención se lee y se decide. */
const MENCIONES = [
  { t: "Amazon abre nuevas plazas en su centro de servicio en Heredia", f: "Prensa digital", entra: true, por: "Habla de la empresa" },
  { t: "Incendios en la Amazonía alcanzan su peor septiembre en una década", f: "Prensa digital", entra: false, por: "Homónimo: la selva" },
  { t: "Mi pedido de Amazon llegó en 3 días a Cartago, sin pagar aduana extra", f: "X", entra: true, por: "Experiencia de cliente" },
  { t: "Tour por el río Amazonas desde Iquitos, 40% de descuento", f: "Facebook", entra: false, por: "Homónimo y publicidad" },
  { t: "¿Alguien sabe si Amazon Prime Video sube de precio en diciembre?", f: "Reddit", entra: true, por: "Producto de la marca" },
];
function PantallaCompuerta() {
  return (
    <Ventana titulo="Compuerta" estado={<Vivo />}>
      <div className="grid grid-cols-2 border-b" style={{ borderColor: S.linea }}>
        <div className="border-r px-4 py-3" style={{ borderColor: S.linea }}>
          <p className="text-[11px]" style={{ color: S.tenue }}>Leídas hoy</p>
          <p className={`text-[22px] font-semibold ${mono}`} style={{ color: S.tinta }}>18.420</p>
        </div>
        <div className="px-4 py-3">
          <p className="text-[11px]" style={{ color: S.tenue }}>Son de la marca</p>
          <p className={`text-[22px] font-semibold ${mono}`} style={{ color: S.morado }}>4.912 <span className="text-[12px] font-normal" style={{ color: S.tenue }}>27 %</span></p>
        </div>
      </div>
      <ul>
        {MENCIONES.map((m, i) => (
          <motion.li key={m.t} initial={{ opacity: 0, y: -8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.12, ease }} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b px-4 py-2.5 last:border-0" style={{ borderColor: S.fina }}>
            <span className="min-w-0">
              <span className="block text-[13px] leading-snug" style={{ color: m.entra ? S.tinta : S.tenue, textDecoration: m.entra ? "none" : "line-through", textDecorationColor: "#C9C9C3" }}>{m.t}</span>
              <span className="mt-0.5 block text-[11px]" style={{ color: S.tenue }}>{m.f} · {m.por}</span>
            </span>
            <motion.span initial={{ scale: 0.6, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.45 + i * 0.12, type: "spring", stiffness: 300, damping: 18 }} className="rounded-[3px] px-2 py-0.5 text-[11px] font-medium" style={m.entra ? { background: "#F1E7FB", color: S.morado } : { background: S.papel, color: S.tenue }}>
              {m.entra ? "Entra" : "Fuera"}
            </motion.span>
          </motion.li>
        ))}
      </ul>
    </Ventana>
  );
}

/* 2 · La alerta que llega en el momento, con la razón y el alcance. */
function PantallaAlerta() {
  const serie = [6, 7, 5, 8, 6, 7, 9, 8, 7, 10, 12, 24, 41, 38];
  const max = Math.max(...serie);
  return (
    <Ventana titulo="Alertas" estado={<span className="text-[11px]" style={{ color: S.rojo }}>Hace 4 min</span>}>
      <div className="border-l-[3px] px-4 py-4" style={{ borderColor: S.rojo }}>
        <p className="text-[11px] font-medium uppercase tracking-[0.08em]" style={{ color: S.rojo }}>Sube la conversación negativa</p>
        <p className="mt-1.5 text-[17px] font-semibold leading-snug" style={{ color: S.tinta }}>Quejas por pedidos retrasados en la semana del Black Friday</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[["Variación", "+340 %", "en 3 horas"], ["Alcance", "1,2 M", "personas"], ["Fuente", "X", "62 % del total"]].map(([k, v, p]) => (
            <div key={k}>
              <p className="text-[11px]" style={{ color: S.tenue }}>{k}</p>
              <p className={`text-[18px] font-semibold ${mono}`} style={{ color: k === "Variación" ? S.rojo : S.tinta }}>{v}</p>
              <p className="text-[11px]" style={{ color: S.tenue }}>{p}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex h-[64px] items-end gap-[3px]">
          {serie.map((n, i) => (
            <motion.span key={i} initial={{ height: 0 }} whileInView={{ height: `${(n / max) * 100}%` }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.04, duration: 0.5, ease }} className="flex-1 rounded-t-[2px]" style={{ background: i >= 11 ? S.rojo : "#D9D9D3" }} />
          ))}
        </div>
        <p className={`mt-1 flex justify-between text-[10px] ${mono}`} style={{ color: S.tenue }}><span>06:00</span><span>ahora</span></p>
      </div>
      <div className="border-t px-4 py-3" style={{ borderColor: S.linea }}>
        <p className="text-[11px]" style={{ color: S.tenue }}>Lo que más se comparte</p>
        <p className="mt-1 text-[13px] leading-snug" style={{ color: S.tinta }}>«Compré el 24 y todavía dice “en preparación”. Nadie responde en el chat.» <span style={{ color: S.tenue }}>· X · 3.100 interacciones</span></p>
      </div>
    </Ventana>
  );
}

/* 3 · Radio, TV y prensa junto a las redes, transcritos y clasificados. */
const MEDIOS = [
  { tipo: "Radio", donde: "Noticiero de la mañana · 07:42", cita: "…y la empresa confirmó que ampliará su operación en el país, con énfasis en servicio al cliente bilingüe…", tono: "Positivo" },
  { tipo: "TV", donde: "Estelar de las 19:00 · min 12", cita: "…consumidores reportan atrasos en las entregas de la última semana; la compañía dice que se normalizará el lunes…", tono: "Negativo" },
  { tipo: "Prensa", donde: "Economía · edición digital", cita: "Las compras transfronterizas crecen en la región y la plataforma concentra la mitad de los envíos…", tono: "Neutral" },
];
function PantallaMedios() {
  const color = (t: string) => (t === "Positivo" ? S.verde : t === "Negativo" ? S.rojo : S.tenue);
  return (
    <Ventana titulo="Medios" estado={<span className="text-[11px]" style={{ color: S.tenue }}>Radio · TV · prensa · redes</span>}>
      {MEDIOS.map((m, i) => (
        <motion.div key={m.donde} initial={{ opacity: 0, x: 10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.12, ease }} className="border-b px-4 py-3 last:border-0" style={{ borderColor: S.fina }}>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-[12px]">
              <span className="rounded-[3px] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white" style={{ background: S.tinta }}>{m.tipo}</span>
              <span style={{ color: S.suave }}>{m.donde}</span>
            </span>
            <span className="text-[11px] font-medium" style={{ color: color(m.tono) }}>{m.tono}</span>
          </div>
          <p className="mt-1.5 text-[13px] italic leading-relaxed" style={{ color: S.tinta }}>
            {m.cita}
          </p>
          {m.tipo !== "Prensa" && (
            <div className="mt-2 flex h-[14px] items-center gap-[2px]" aria-hidden>
              {Array.from({ length: 46 }, (_, k) => (
                <span key={k} className="w-[3px] rounded-full" style={{ height: `${25 + Math.abs(Math.sin(k * 1.7 + i)) * 75}%`, background: k > 18 && k < 30 ? S.morado : "#D9D9D3" }} />
              ))}
            </div>
          )}
        </motion.div>
      ))}
    </Ventana>
  );
}

const FILAS = [
  { t: "Una compuerta que separa el ruido", d: "Contar todo lo que dice «Amazon» es contar la selva, el río y la publicidad. Sentinel lee cada mención y decide si habla de tu marca antes de sumarla. Por eso sus números se pueden presentar en una junta.", P: PantallaCompuerta },
  { t: "Alertas en el momento, con la razón", d: "No un correo diario con un gráfico. Cuando sube lo negativo o aparece un tema sensible, la alerta llega con qué pasó, cuánta gente lo ve, de dónde viene y lo que más se está compartiendo.", P: PantallaAlerta },
  { t: "Radio y televisión, no solo redes", d: "Lo que se dice al aire se transcribe y se clasifica junto con redes y prensa. Ves en una sola línea cómo una nota de TV de la noche se convierte en conversación al día siguiente.", P: PantallaMedios },
];

export default function SentinelPorDentro() {
  return (
    <section className="border-t py-16 md:py-24" style={{ borderColor: S.linea }}>
      <style>{`.sen-zoom{--z:1.1;zoom:var(--z)}@media(min-width:1024px){.sen-zoom{--z:1.4}}`}</style>
      <div className={ancho}>
        <div className="max-w-3xl">
          <p className="text-[13px] font-medium" style={{ color: S.morado }}>Sentinel por dentro</p>
          <h2 className="mt-3 text-[30px] font-semibold leading-[1.1] tracking-[-0.015em] md:text-[44px]">No solo cuántas menciones. Cuáles importan.</h2>
          <p className="mt-4 max-w-2xl text-[17px] leading-relaxed" style={{ color: S.suave }}>
            La mayoría de las herramientas de escucha te entrega un conteo. Sentinel te entrega la conversación que es tuya, te avisa cuando cambia y suma lo que se dice al aire.
          </p>
        </div>
        <div className="mt-12 border-t" style={{ borderColor: S.tinta }}>
          {FILAS.map(({ t, d, P }) => (
            <div key={t} className="grid gap-8 border-b py-12 md:py-16 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,1.38fr)] lg:gap-14" style={{ borderColor: S.linea }}>
              <div className="lg:pt-2">
                <h3 className="text-[22px] font-semibold leading-tight md:text-[26px]">{t}</h3>
                <p className="mt-3 max-w-md text-[16px] leading-relaxed" style={{ color: S.suave }}>{d}</p>
              </div>
              <P />
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12px]" style={{ color: S.tenue }}>
          {EJ.rotulo} Sentinel ha curado {SENTINEL_REAL.menciones.toLocaleString("es-CR")} menciones reales desde {SENTINEL_REAL.desde} ({FECHA_DATOS}).
        </p>
      </div>
    </section>
  );
}
