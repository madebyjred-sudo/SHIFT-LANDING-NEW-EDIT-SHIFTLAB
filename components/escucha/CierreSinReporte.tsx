"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { PAISES, paisDelNavegador } from "@/lib/escucha/paises";

/* Tarjeta de Fabiana (la misma del cierre del reporte) y el cierre de las
 * landings para quien llegó al final sin pedir el reporte: deja su correo de
 * trabajo y ventas le escribe (Oscar, Fabiana y Juanma reciben el aviso). */

export type TonoCierre = "eco" | "sentinel" | "integral";
const T: Record<TonoCierre, { fondo: string; tinta: string; suave: string; linea: string; acento: string; btn: string; btnTxt: string; campo: string; campoBorde: string; fuente: string; titular: string; radio: string }> = {
  eco: { fondo: "#0A0E27", tinta: "#ffffff", suave: "rgba(255,255,255,.68)", linea: "rgba(255,255,255,.14)", acento: "#9fb0ff", btn: "#ffffff", btnTxt: "#0e1745", campo: "rgba(255,255,255,.06)", campoBorde: "rgba(255,255,255,.22)", fuente: "var(--font-fira-sans)", titular: "var(--font-figtree)", radio: "4px" },
  sentinel: { fondo: "#17171B", tinta: "#F4F4F2", suave: "rgba(244,244,242,.66)", linea: "rgba(244,244,242,.14)", acento: "#B98AEB", btn: "#9244D8", btnTxt: "#ffffff", campo: "rgba(244,244,242,.06)", campoBorde: "rgba(244,244,242,.22)", fuente: "var(--font-plex)", titular: "var(--font-plex)", radio: "4px" },
  integral: { fondo: "#0E1438", tinta: "#ffffff", suave: "rgba(255,255,255,.68)", linea: "rgba(255,255,255,.14)", acento: "#5BE9FF", btn: "#1534DC", btnTxt: "#ffffff", campo: "#0A0E27", campoBorde: "rgba(255,255,255,.18)", fuente: "var(--font-figtree)", titular: "var(--font-figtree)", radio: "14px" },
};
export const temaCierre = T;

export function TarjetaFabiana({ tono, texto }: { tono: TonoCierre; texto: string }) {
  const t = T[tono];
  return (
    <div className="flex max-w-[520px] items-center gap-4 border-t pt-6" style={{ borderColor: t.linea }}>
      <span className="block h-16 w-16 shrink-0 overflow-hidden rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/images/aboutus/persona-11.jpg" alt="Fabiana Martínez" width={64} height={64} className="h-full w-full scale-[1.7] object-cover [transform-origin:50%_34%]" />
      </span>
      <p className="text-[14px] leading-snug" style={{ color: t.suave }}>
        <span className="block text-[15px] font-semibold" style={{ color: t.tinta }}>Fabiana Martínez</span>
        {texto}
      </p>
    </div>
  );
}

const TITULO: Record<TonoCierre, string> = {
  eco: "¿Prefieres que alguien te muestre qué dice la IA de tu marca?",
  sentinel: "Mañana se va a hablar de tu marca. Decide si te enteras a tiempo.",
  integral: "¿Prefieres verlo con alguien antes de pedir el reporte?",
};
const BAJADA: Record<TonoCierre, string> = {
  eco: "Déjanos tu correo de trabajo y te escribimos para recorrer Eco con tu marca, tus competidores y las preguntas de tu categoría.",
  sentinel: "Déjanos tu correo de trabajo y te escribimos para mostrarte Sentinel con tu marca, tus competidores y los medios de tu país.",
  integral: "Déjanos tu correo de trabajo y te escribimos para recorrer Eco y Sentinel con tu marca: lo que dice la IA y lo que dice la gente, juntos.",
};

export default function CierreSinReporte({ tono, conPie }: { tono: TonoCierre; conPie?: React.ReactNode }) {
  const t = T[tono];
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<{ fase: "no" | "enviando" | "ok" | "error"; msj?: string }>({ fase: "no" });

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (estado.fase === "enviando") return;
    setEstado({ fase: "enviando" });
    try {
      const cc = PAISES.some((p) => p.cc === paisDelNavegador()) ? paisDelNavegador() : "cr";
      const r = await fetch("/api/escucha/contacto", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ correo, tipo: tono === "eco" ? "ia" : tono === "sentinel" ? "digital" : "integral", cc }) });
      const j = await r.json().catch(() => ({}));
      setEstado(r.ok ? { fase: "ok" } : { fase: "error", msj: j.mensaje ?? "No pudimos enviarlo. Intenta de nuevo en un momento." });
    } catch {
      setEstado({ fase: "error", msj: "No pudimos enviarlo. Intenta de nuevo en un momento." });
    }
  }

  return (
    <section style={{ background: t.fondo, color: t.tinta, fontFamily: t.fuente }}>
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-6 py-16 md:px-10 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16">
        <div>
          <p className="text-[13px] font-semibold uppercase tracking-[0.16em]" style={{ color: t.acento }}>Hablemos</p>
          <h2 className="mt-5 max-w-[620px] text-[30px] font-bold leading-[1.08] tracking-[-0.02em] md:text-[44px]" style={{ fontFamily: t.titular }}>{TITULO[tono]}</h2>
          <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed" style={{ color: t.suave }}>{BAJADA[tono]}</p>
        </div>
        <div>
          <AnimatePresence mode="wait" initial={false}>
            {estado.fase === "ok" ? (
              <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-[520px]">
                <p className="text-[20px] font-semibold" style={{ fontFamily: t.titular }}>Listo. Te escribimos en las próximas 24 horas hábiles.</p>
                <p className="mt-2 text-[15px]" style={{ color: t.suave }}>Mientras tanto, puedes pedir tu reporte gratis arriba: llega en minutos.</p>
              </motion.div>
            ) : (
              <motion.form key="f" onSubmit={enviar} initial={false} exit={{ opacity: 0 }} className="flex max-w-[520px] flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="nombre@tuempresa.com"
                  aria-label="Correo de trabajo"
                  className="h-14 min-w-0 flex-1 border px-4 text-[16px] outline-none placeholder:opacity-50"
                  style={{ background: t.campo, borderColor: t.campoBorde, color: t.tinta, borderRadius: t.radio, height: 56, minHeight: 56, flex: "1 1 auto" }}
                />
                <button type="submit" disabled={estado.fase === "enviando"} className="h-14 whitespace-nowrap px-6 text-[16px] font-semibold disabled:opacity-70" style={{ background: t.btn, color: t.btnTxt, borderRadius: t.radio, fontFamily: t.titular }}>
                  {estado.fase === "enviando" ? "Enviando…" : "Que me escriban"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          {estado.fase === "error" && <p className="mt-3 text-[14px]" style={{ color: t.acento }}>{estado.msj}</p>}
          <div className="mt-8">
            <TarjetaFabiana tono={tono} texto="Directora de Desarrollo de Negocio, Shift Latam. Ella o alguien de su equipo te escribe con tu marca en la mano, no con una presentación genérica." />
          </div>
        </div>
      </div>
      {conPie}
    </section>
  );
}
