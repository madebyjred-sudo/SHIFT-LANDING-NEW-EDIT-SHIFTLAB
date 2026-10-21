"use client";

import { useCallback, useState } from "react";

/* Hooks compartidos por las tres landings (Eco, Sentinel y la integral).
 * Cada landing decide su diseño; la lógica de llamar y sondear vive aquí. */

export type ResIA = { key: string; answer: string; error: boolean; conoce: boolean; nombra: boolean };
export type EstadoIA = {
  fase: "idle" | "corriendo" | "listo" | "usado" | "apagado" | "error";
  resultados?: ResIA[];
  crudo?: { key: string; answer: string; error?: boolean }[];
};

export type Resumen = {
  marca: string;
  cc: string;
  desde: string;
  hasta: string;
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
export type EstadoDig = {
  fase: "idle" | "en_cola" | "corriendo" | "listo" | "tope" | "apagado" | "error";
  enCola?: number;
  resumen?: Resumen;
};

export function useEscuchaIA() {
  const [estado, setEstado] = useState<EstadoIA>({ fase: "idle" });
  const correr = useCallback(async (marca: string, cc: string) => {
    setEstado({ fase: "corriendo" });
    try {
      const r = await fetch("/api/escucha/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marca, cc }),
      });
      if (r.status === 429) return setEstado({ fase: "usado" });
      if (r.status === 503) return setEstado({ fase: "apagado" });
      const j = await r.json();
      if (!j.ok) return setEstado({ fase: "error" });
      setEstado({ fase: "listo", resultados: j.resultados, crudo: j.crudo });
    } catch {
      setEstado({ fase: "error" });
    }
  }, []);
  return { estado, correr };
}

export function useEscuchaDigital() {
  const [estado, setEstado] = useState<EstadoDig>({ fase: "idle" });
  const correr = useCallback(async (marca: string, cc: string) => {
    setEstado({ fase: "en_cola" });
    try {
      const r = await fetch("/api/escucha/digital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marca, cc }),
      });
      if (r.status === 503) return setEstado({ fase: "apagado" });
      if (r.status === 429) return setEstado({ fase: "tope" });
      const j = await r.json();
      if (!j.ok) return setEstado({ fase: "error" });
      for (let i = 0; i < 120; i++) {
        const s = await (await fetch(`/api/escucha/digital?id=${j.id}`)).json();
        if (s.estado === "listo") return setEstado({ fase: "listo", resumen: s.resumen });
        if (s.estado === "error") return setEstado({ fase: "error" });
        setEstado({ fase: s.estado, enCola: s.enCola });
        await new Promise((res) => setTimeout(res, 4000));
      }
      setEstado({ fase: "error" });
    } catch {
      setEstado({ fase: "error" });
    }
  }, []);
  return { estado, correr };
}

/** Enlace al dossier de Eco ya personalizado con las respuestas (#shot=, no viaja al servidor). */
export function enlaceDossier(marca: string, pais: string, crudo?: EstadoIA["crudo"]): string {
  const base = process.env.NEXT_PUBLIC_ECO_DOSSIER_URL ?? "https://eco.shiftlabdev.space/dossier";
  if (!crudo) return base;
  const payload = JSON.stringify({ company: marca, country: pais, results: crudo });
  const b64 = btoa(unescape(encodeURIComponent(payload))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${base}#shot=${b64}`;
}

/** Registra el lead en el formulario de contacto que ya existe (HubSpot + GM del país). */
export async function registrarLead(hub: string, correo: string, idea: string): Promise<boolean> {
  try {
    const r = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hub, email: correo, idea, bot_trap: "" }),
    });
    return r.ok;
  } catch {
    return false;
  }
}
