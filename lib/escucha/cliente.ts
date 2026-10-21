"use client";

import { useCallback, useState } from "react";

/* Hooks compartidos por las tres landings (Eco, Sentinel y la integral).
 * Cada landing decide su diseño; la lógica de llamar, sondear, guardar en el
 * navegador y pasar la verificación anti-bots vive aquí.
 *
 * Persistencia: cada resultado se guarda en localStorage 24 h por marca+país
 * («escucha:v1:<tipo>:<marca>|<cc>»), y la última escucha queda anotada para
 * restaurarla al refrescar. Una escucha repetida en el día no vuelve a pegarle
 * al servidor ni gasta cupo (el servidor también cachea 24 h).
 *
 * Verificación: Cloudflare Turnstile invisible. Si no hay site key
 * (NEXT_PUBLIC_TURNSTILE_SITE_KEY) se omite y el servidor decide (fail-open
 * mientras no haya secreto). */

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

/* ---------------- Persistencia en el navegador ---------------- */

const TTL = 24 * 3600e3;
const clave = (tipo: "ia" | "dig", marca: string, cc: string) => `escucha:v1:${tipo}:${marca.trim().toLowerCase()}|${cc}`;

function leer<T>(k: string): T | null {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw) as { t: number; v: T };
    if (Date.now() - t > TTL) {
      localStorage.removeItem(k);
      return null;
    }
    return v;
  } catch {
    return null;
  }
}
function guardar(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify({ t: Date.now(), v }));
  } catch {
    /* modo privado o sin espacio: se sigue sin caché */
  }
}

/** Última escucha hecha en este navegador (para restaurarla al refrescar). */
export function ultimaEscucha(): { marca: string; cc: string } | null {
  return leer<{ marca: string; cc: string }>("escucha:v1:ultima");
}
export function anotarUltima(marca: string, cc: string) {
  guardar("escucha:v1:ultima", { marca: marca.trim(), cc });
}
export function olvidarUltima() {
  try {
    localStorage.removeItem("escucha:v1:ultima");
  } catch {
    /* nada */
  }
}

/** Marca y país con que debe arrancar la página: la URL manda; si no, la última escucha guardada. */
export function escuchaInicial(): { marca: string; cc: string; desde: "url" | "guardada" } | null {
  try {
    const q = new URLSearchParams(window.location.search);
    const m = q.get("marca")?.trim().slice(0, 60);
    const p = q.get("pais")?.toLowerCase();
    if (m && p) return { marca: m, cc: p, desde: "url" };
  } catch {
    /* sin window */
  }
  const u = ultimaEscucha();
  return u ? { ...u, desde: "guardada" } : null;
}

/* ---------------- Verificación anti-bots (Turnstile invisible) ---------------- */

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
type TurnstileApi = {
  render: (el: HTMLElement, o: Record<string, unknown>) => string;
  execute: (id: string) => void;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
let cargaScript: Promise<TurnstileApi | null> | null = null;

function turnstile(): Promise<TurnstileApi | null> {
  if (!SITE_KEY || typeof window === "undefined") return Promise.resolve(null);
  const w = window as unknown as { turnstile?: TurnstileApi };
  if (w.turnstile) return Promise.resolve(w.turnstile);
  cargaScript ??= new Promise((res) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => res(w.turnstile ?? null);
    s.onerror = () => res(null);
    document.head.appendChild(s);
  });
  return cargaScript;
}

/** Un token fresco por llamada. Sin site key o si falla el script, devuelve "" y el servidor decide. */
export async function tokenHumano(): Promise<string> {
  const ts = await turnstile();
  if (!ts) return "";
  return new Promise((res) => {
    const el = document.createElement("div");
    el.style.cssText = "position:fixed;bottom:0;left:0;width:0;height:0;overflow:hidden";
    document.body.appendChild(el);
    let id = "";
    const fin = (t: string) => {
      res(t);
      setTimeout(() => {
        try {
          ts.remove(id);
        } catch {
          /* nada */
        }
        el.remove();
      }, 0);
    };
    const reloj = setTimeout(() => fin(""), 12000);
    id = ts.render(el, {
      sitekey: SITE_KEY,
      size: "invisible",
      appearance: "interaction-only",
      callback: (t: string) => {
        clearTimeout(reloj);
        fin(t);
      },
      "error-callback": () => {
        clearTimeout(reloj);
        fin("");
      },
    });
  });
}

/* ---------------- Hooks ---------------- */

export function useEscuchaIA() {
  const [estado, setEstado] = useState<EstadoIA>({ fase: "idle" });
  const correr = useCallback(async (marca: string, cc: string) => {
    const k = clave("ia", marca, cc);
    const guardado = leer<EstadoIA>(k);
    if (guardado) return setEstado(guardado);
    setEstado({ fase: "corriendo" });
    try {
      const token = await tokenHumano();
      const r = await fetch("/api/escucha/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marca, cc, token }),
      });
      if (r.status === 429) return setEstado({ fase: "usado" });
      if (r.status === 503) return setEstado({ fase: "apagado" });
      const j = await r.json();
      if (!j.ok) return setEstado({ fase: "error" });
      const listo: EstadoIA = { fase: "listo", resultados: j.resultados, crudo: j.crudo };
      guardar(k, listo);
      setEstado(listo);
    } catch {
      setEstado({ fase: "error" });
    }
  }, []);
  const reiniciar = useCallback(() => setEstado({ fase: "idle" }), []);
  return { estado, correr, reiniciar };
}

export function useEscuchaDigital() {
  const [estado, setEstado] = useState<EstadoDig>({ fase: "idle" });
  const correr = useCallback(async (marca: string, cc: string) => {
    const k = clave("dig", marca, cc);
    const guardado = leer<EstadoDig>(k);
    if (guardado) return setEstado(guardado);
    setEstado({ fase: "en_cola" });
    try {
      const token = await tokenHumano();
      const r = await fetch("/api/escucha/digital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marca, cc, token }),
      });
      if (r.status === 503) return setEstado({ fase: "apagado" });
      if (r.status === 429) return setEstado({ fase: "tope" });
      const j = await r.json();
      if (!j.ok) return setEstado({ fase: "error" });
      for (let i = 0; i < 120; i++) {
        const s = await (await fetch(`/api/escucha/digital?id=${j.id}`)).json();
        if (s.estado === "listo") {
          const listo: EstadoDig = { fase: "listo", resumen: s.resumen };
          guardar(k, listo);
          return setEstado(listo);
        }
        if (s.estado === "error") return setEstado({ fase: "error" });
        setEstado({ fase: s.estado, enCola: s.enCola });
        await new Promise((res) => setTimeout(res, 4000));
      }
      setEstado({ fase: "error" });
    } catch {
      setEstado({ fase: "error" });
    }
  }, []);
  const reiniciar = useCallback(() => setEstado({ fase: "idle" }), []);
  return { estado, correr, reiniciar };
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
