import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { ipDe } from "@/lib/escucha/humano";
import { pedirContactoHoy } from "@/lib/escucha/solicitudes";

/* Desde el cierre del reporte: «quiero hablar hoy». Avisa a ventas con prioridad. */
export const runtime = "nodejs";

export async function POST(req: Request) {
  let b: { id?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const id = String(b.id ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
  const ip = ipDe(req);
  if (!rateLimit(`escucha-contacto:${ip}`).ok) return NextResponse.json({ ok: false }, { status: 429 });
  const r = await pedirContactoHoy(id);
  return NextResponse.json({ ok: r !== "no", repetido: r === "repetido" }, { status: r === "no" ? 404 : 200 });
}
