"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { tokenHumano } from "@/lib/escucha/cliente";

/* Pedir el reporte por correo (las tres landings). La página no cambia:
 * debajo del formulario aparece la confirmación «te llega en X minutos». */

export type TipoReporte = "ia" | "digital" | "integral";
type Estado = { fase: "idle" | "enviando" | "enviado" | "error"; mensaje?: string; campo?: string; correo?: string; minutos?: string; repetido?: boolean; marca?: string; sitio?: string };

export function useSolicitud(tipo: TipoReporte) {
  const [estado, setEstado] = useState<Estado>({ fase: "idle" });
  const pedir = useCallback(
    async (quien: { marca?: string; sitio?: string }, cc: string, correo: string) => {
      setEstado({ fase: "enviando" });
      try {
        const token = await tokenHumano();
        const r = await fetch("/api/escucha/solicitud", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo, ...quien, cc, correo, token }) });
        const j = await r.json();
        if (!j.ok) return setEstado({ fase: "error", mensaje: j.mensaje ?? "No pudimos pedir el reporte.", campo: j.campo });
        setEstado({ fase: "enviado", correo: j.correo, minutos: j.minutos, repetido: j.repetido, marca: j.marca, sitio: j.sitio });
      } catch {
        setEstado({ fase: "error", mensaje: "No pudimos pedir el reporte. Revisa tu conexión." });
      }
    },
    [tipo],
  );
  return { estado, pedir, reiniciar: () => setEstado({ fase: "idle" }) };
}

type Tono = "eco" | "sentinel" | "integral";
const E: Record<Tono, { caja: string; titulo: string; texto: string; error: string; acento: string; icono: string }> = {
  eco: { caja: "border-[#e3e5f1] bg-white", titulo: "text-[#0e1745]", texto: "text-[#4a5488]", error: "text-[#d6246e]", acento: "text-[#1534dc]", icono: "#1534dc" },
  sentinel: { caja: "rounded-[6px] border-[#DCDCD6] bg-white", titulo: "text-[#17171B]", texto: "text-[#5F6068]", error: "text-[#D42A20]", acento: "text-[#9244D8]", icono: "#9244D8" },
  integral: { caja: "border-white/12 bg-[#0B1030]/90", titulo: "text-white", texto: "text-white/65", error: "text-[#FF7B9C]", acento: "text-[#5BE9FF]", icono: "#5BE9FF" },
};

export function Confirmacion({ estado, tono, onOtro }: { estado: Estado; tono: Tono; onOtro: () => void }) {
  const e = E[tono];
  return (
    <AnimatePresence initial={false}>
      {estado.fase === "enviado" && (
        <motion.div key="ok" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
          <div className={`mt-3 flex items-start gap-4 rounded-[14px] border p-4 md:p-5 ${e.caja}`} role="status">
            <motion.svg initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 16 }} viewBox="0 0 40 48" className="h-12 w-10 shrink-0" aria-hidden>
              <rect x="1" y="1" width="38" height="46" rx="6" fill="none" stroke={e.icono} strokeOpacity=".35" />
              <circle cx="20" cy="17" r="7" fill={e.icono} />
              <path d="M16.6 17.2l2.3 2.3 4.6-4.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <rect x="8" y="30" width="24" height="2.6" rx="1.3" fill={e.icono} opacity=".3" />
              <rect x="8" y="36" width="16" height="2.6" rx="1.3" fill={e.icono} opacity=".3" />
            </motion.svg>
            <div className="min-w-0">
              <p className={`text-[16px] font-semibold ${e.titulo}`}>{estado.repetido ? "Ya tenías este reporte: te lo reenviamos" : `El reporte de ${estado.marca ?? "tu marca"} va en camino`}</p>
              {estado.sitio && <p className={`text-[12px] ${e.texto}`}>Leído desde {estado.sitio}</p>}
              <p className={`mt-1 text-[14px] leading-relaxed ${e.texto}`}>
                {estado.repetido ? "Revisa tu correo en" : `Te llega en ${estado.minutos} minutos a`} <b className={e.titulo}>{estado.correo}</b>, con un enlace privado que dura 30 días. Si no aparece, mira en spam.
              </p>
              <button type="button" onClick={onOtro} className={`mt-2 text-[13px] underline ${e.acento}`}>Pedir otro reporte</button>
            </div>
          </div>
        </motion.div>
      )}
      {estado.fase === "error" && (
        <motion.p key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className={`mt-3 overflow-hidden text-[14px] ${e.error}`} role="alert">
          {estado.mensaje}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
