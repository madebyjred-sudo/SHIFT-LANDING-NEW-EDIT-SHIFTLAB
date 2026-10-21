import { NextResponse } from "next/server";
import { esHumano, ipDe } from "@/lib/escucha/humano";
import { leerPase, puerta } from "@/lib/escucha/acceso";
import { iniciar, consultar, limpiarMarca } from "@/lib/escucha/digital";
import { PAISES } from "@/lib/escucha/paises";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function ip(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "?";
}

/** POST {marca, cc} → {id}. Arranca (o reusa) la escucha digital de 30 días. */
export async function POST(req: Request) {
  let body: { marca?: string; cc?: string; token?: string; pase?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "solicitud" }, { status: 400 });
  }
  const marca = limpiarMarca(String(body.marca ?? ""));
  const cc = String(body.cc ?? "");
  if (marca.length < 2 || !PAISES.some((p) => p.cc === cc)) {
    return NextResponse.json({ ok: false, error: "datos" }, { status: 400 });
  }
  // Con pase verificado, la cuota es por correo; sin pase, por IP.
  if (!leerPase(body.pase) && !rateLimit(`escucha-digital:${ip(req)}`).ok) return NextResponse.json({ ok: false, error: "limite" }, { status: 429 });
  const acceso = puerta(body.pase, `${marca.toLowerCase()}|${cc}`);
  if (!acceso.ok) return NextResponse.json({ ok: false, error: acceso.error }, { status: acceso.status });
  if (!acceso.correo && !(await esHumano(body.token, ipDe(req)))) return NextResponse.json({ ok: false, error: "verificacion" }, { status: 403 });
  const r = iniciar(marca, cc);
  if (!r.ok) return NextResponse.json(r, { status: r.error === "apagado" ? 503 : 429 });
  return NextResponse.json(r);
}

/** GET ?id= → estado del trabajo y, al terminar, el resumen agregado. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  const t = consultar(id);
  if (!t) return NextResponse.json({ ok: false, error: "no_existe" }, { status: 404 });
  return NextResponse.json({ ok: true, ...t });
}
