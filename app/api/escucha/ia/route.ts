import { NextResponse } from "next/server";
import { esHumano, ipDe } from "@/lib/escucha/humano";
import { puerta } from "@/lib/escucha/acceso";
import { limpiarMarca } from "@/lib/escucha/digital";
import { escucharIA } from "@/lib/escucha/ia";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

/* Escucha en IA en vivo (la usan las páginas cuando no hay reporte por correo). La lógica vive en lib/escucha/ia. */
const STATUS = { datos: 400, eco: 502, apagado: 503, usado: 429 } as const;

export async function POST(req: Request) {
  let body: { marca?: string; cc?: string; token?: string; pase?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "solicitud" }, { status: 400 });
  }
  const marca = limpiarMarca(String(body.marca ?? ""));
  const cc = String(body.cc ?? "");
  const acceso = puerta(body.pase, `${marca.toLowerCase()}|${cc}`);
  if (!acceso.ok) return NextResponse.json({ ok: false, error: acceso.error }, { status: acceso.status });
  if (!acceso.correo && !(await esHumano(body.token, ipDe(req)))) return NextResponse.json({ ok: false, error: "verificacion" }, { status: 403 });
  const r = await escucharIA(marca, cc, ipDe(req));
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: STATUS[r.error] });
  return NextResponse.json({ ok: true, marca, pais: r.pais, resultados: r.resultados, crudo: r.crudo });
}
