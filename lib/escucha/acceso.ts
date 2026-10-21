import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { resolveMx } from "node:dns/promises";

/* Acceso a la escucha gratis con correo de trabajo + código (como el AEO
 * Report de Profound). El correo se valida (dominio corporativo con MX), se
 * manda un código de 6 dígitos y, al verificarlo, se entrega un pase firmado
 * por 30 días. Las cuotas se cuentan por correo, no por IP: así una oficina
 * entera puede usarla y un bot no.
 *
 * Variables:
 *   ESCUCHA_REQUIERE_CORREO=1   activa la puerta (sin ella, todo sigue abierto)
 *   ESCUCHA_SECRETO             firma de los pases (obligatoria en producción)
 *   RESEND_API_KEY              envío del código
 *   ESCUCHA_CORREO_FROM         remitente («Shift LAB <escucha@dominio>»)
 *   ESCUCHA_DOMINIOS_EQUIPO     dominios sin cuota diaria (equipo de Shift)
 *   ESCUCHA_MARCAS_DIA          marcas distintas por correo al día (def. 3) */

export const requiereCorreo = () => process.env.ESCUCHA_REQUIERE_CORREO === "1";

// Correo personal o desechable: no cuenta como corporativo.
const LIBRES = new Set(
  "gmail.com googlemail.com hotmail.com hotmail.es outlook.com outlook.es live.com live.com.mx msn.com yahoo.com yahoo.es yahoo.com.mx ymail.com icloud.com me.com mac.com aol.com proton.me protonmail.com pm.me gmx.com gmx.net mail.com yandex.com zoho.com tutanota.com hey.com fastmail.com mailinator.com guerrillamail.com 10minutemail.com tempmail.com temp-mail.org yopmail.com sharklasers.com trashmail.com dispostable.com getnada.com".split(" "),
);

export type Revision = { ok: true; correo: string; dominio: string } | { ok: false; error: "formato" | "personal" | "dominio" };

export async function revisarCorreo(bruto: string): Promise<Revision> {
  const correo = bruto.trim().toLowerCase();
  if (!/^[^\s@]{1,64}@[a-z0-9.-]+\.[a-z]{2,}$/.test(correo) || correo.length > 120) return { ok: false, error: "formato" };
  const dominio = correo.split("@")[1];
  if (LIBRES.has(dominio)) return { ok: false, error: "personal" };
  try {
    const mx = await Promise.race([resolveMx(dominio), new Promise<never>((_, r) => setTimeout(() => r(new Error("t")), 4000))]);
    if (!mx.length) return { ok: false, error: "dominio" };
  } catch {
    return { ok: false, error: "dominio" };
  }
  return { ok: true, correo, dominio };
}

/* ---------- Códigos (memoria del proceso, 10 min, 5 intentos) ---------- */

type Pendiente = { hash: string; vence: number; intentos: number };
const g = globalThis as unknown as { __escuchaCodigos?: Map<string, Pendiente>; __escuchaUso?: Map<string, { dia: string; marcas: Set<string> }>; __escuchaSecreto?: string };
const codigos = (g.__escuchaCodigos ??= new Map());
const uso = (g.__escuchaUso ??= new Map());

function secreto(): string {
  const s = process.env.ESCUCHA_SECRETO;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("ESCUCHA_SECRETO no está configurado");
  return (g.__escuchaSecreto ??= String(Math.random()) + Date.now());
}
const h = (v: string) => createHmac("sha256", secreto()).update(v).digest("base64url");

export function nuevoCodigo(correo: string): string {
  const codigo = String(randomInt(0, 1_000_000)).padStart(6, "0");
  codigos.set(correo, { hash: h(`${correo}:${codigo}`), vence: Date.now() + 10 * 60e3, intentos: 0 });
  return codigo;
}

export function comprobarCodigo(correo: string, codigo: string): "ok" | "vencido" | "malo" | "bloqueado" {
  const p = codigos.get(correo);
  if (!p || Date.now() > p.vence) return "vencido";
  if (p.intentos >= 5) return "bloqueado";
  p.intentos++;
  const a = Buffer.from(h(`${correo}:${codigo.trim()}`));
  const b = Buffer.from(p.hash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "malo";
  codigos.delete(correo);
  return "ok";
}

/* ---------- Pase firmado (30 días) ---------- */

export function firmarPase(correo: string): string {
  const cuerpo = Buffer.from(JSON.stringify({ c: correo, v: Date.now() + 30 * 86400e3 })).toString("base64url");
  return `${cuerpo}.${h(cuerpo)}`;
}

export function leerPase(pase: string | undefined): string | null {
  if (!pase || !pase.includes(".")) return null;
  const [cuerpo, firma] = pase.split(".");
  const a = Buffer.from(h(cuerpo));
  const b = Buffer.from(firma ?? "");
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const { c, v } = JSON.parse(Buffer.from(cuerpo, "base64url").toString()) as { c: string; v: number };
    return Date.now() < v ? c : null;
  } catch {
    return null;
  }
}

/* ---------- Cuota por correo ---------- */

export function esEquipo(correo: string): boolean {
  const dom = correo.split("@")[1] ?? "";
  return (process.env.ESCUCHA_DOMINIOS_EQUIPO ?? "shiftlatam.agency,shiftlatam.com").split(",").map((d) => d.trim()).includes(dom);
}

/** Registra la marca para el correo; false si ya agotó las marcas del día. Repetir una marca no gasta. */
export function cuotaMarca(correo: string, clave: string): boolean {
  if (esEquipo(correo)) return true;
  const hoy = new Date().toISOString().slice(0, 10);
  const u = uso.get(correo);
  const reg = u && u.dia === hoy ? u : { dia: hoy, marcas: new Set<string>() };
  if (reg.marcas.has(clave)) return true;
  if (reg.marcas.size >= Number(process.env.ESCUCHA_MARCAS_DIA ?? 3)) return false;
  reg.marcas.add(clave);
  uso.set(correo, reg);
  return true;
}

/** Puerta para las rutas de escucha: sin puerta activa, deja pasar. */
export function puerta(pase: string | undefined, clave: string): { ok: true; correo: string | null } | { ok: false; status: 401 | 429; error: string } {
  if (!requiereCorreo()) return { ok: true, correo: null };
  const correo = leerPase(pase);
  if (!correo) return { ok: false, status: 401, error: "acceso" };
  if (!cuotaMarca(correo, clave)) return { ok: false, status: 429, error: "cuota" };
  return { ok: true, correo };
}

/* ---------- Envío del código ---------- */

export async function enviarCodigo(correo: string, codigo: string): Promise<boolean> {
  const llave = process.env.RESEND_API_KEY;
  if (process.env.NODE_ENV !== "production") console.log(`[escucha] código para ${correo}: ${codigo} (solo dev)`);
  if (!llave) {
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
    return false;
  }
  const html = `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#0e1745">
  <p style="font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#f540ff;font-weight:700;margin:0">Shift LAB · escucha gratis</p>
  <h1 style="font-size:22px;margin:14px 0 8px">Tu código de acceso</h1>
  <p style="font-size:15px;color:#4a5488;margin:0 0 20px">Escríbelo en la página para lanzar tu escucha. Vence en 10 minutos.</p>
  <p style="font-size:34px;letter-spacing:10px;font-weight:700;margin:0 0 24px;color:#1534dc">${codigo}</p>
  <p style="font-size:12px;color:#858eb4;margin:0">Si no lo pediste, ignora este correo.</p></div>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: ["Bearer", llave].join(" "), "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.ESCUCHA_CORREO_FROM ?? "Shift LAB <escucha@eco.shiftlabdev.space>",
        to: [correo],
        subject: `${codigo} es tu código de Shift LAB`,
        html,
        text: `Tu código de acceso a la escucha gratis de Shift LAB: ${codigo}. Vence en 10 minutos.`,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return r.ok;
  } catch {
    return false;
  }
}
