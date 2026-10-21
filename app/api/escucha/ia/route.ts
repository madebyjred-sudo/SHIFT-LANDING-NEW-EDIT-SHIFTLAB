import { NextResponse } from "next/server";
import { limpiarMarca } from "@/lib/escucha/digital";
import { PAISES } from "@/lib/escucha/paises";

export const dynamic = "force-dynamic";
export const maxDuration = 90;

/* Escucha en IA gratis = el "dossier shot" de Eco (POST /api/dossier/shot):
 * una pregunta fija a seis IA con búsqueda web. Eco ya trae sus candados
 * (flag maestro, una prueba por IP, tope diario global); acá solo se le pasa
 * la IP real del visitante para que el límite sea por persona y no por la
 * landing entera. */
const ECO = process.env.ECO_BASE_URL ?? "https://eco.shiftlabdev.space";

/* Misma regla que el dossier de Eco: no te conoce solo si la respuesta ARRANCA
 * diciendo que no tiene información o que la marca no existe. */
function noLaConoce(answer: string): boolean {
  const a = (answer || "").trim();
  if (!a || a === "Sin respuesta.") return true;
  const head = a.slice(0, 95).toLowerCase();
  if (
    /^(lamentablemente\s+)?(no\s+(tengo|encuentro|dispongo|cuento con|hallo|conozco|reconozco|puedo (confirmar|encontrar|verificar|darte)|hay|existe|figura|me consta)|desconozco)/.test(head)
  )
    return true;
  return /no existe\s+(una|ninguna)?\s*(marca|empresa|compañía|compania|organización|organizacion)/i.test(a);
}

const sinAcentos = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export async function POST(req: Request) {
  let body: { marca?: string; cc?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "solicitud" }, { status: 400 });
  }
  const marca = limpiarMarca(String(body.marca ?? ""));
  const pais = PAISES.find((p) => p.cc === body.cc);
  if (marca.length < 2 || !pais) return NextResponse.json({ ok: false, error: "datos" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
  let res: Response;
  try {
    res = await fetch(`${ECO}/api/dossier/shot`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(ip ? { "X-Forwarded-For": ip } : {}) },
      body: JSON.stringify({ company: marca, country: pais.nombre }),
      signal: AbortSignal.timeout(85_000),
    });
  } catch {
    return NextResponse.json({ ok: false, error: "eco" }, { status: 502 });
  }
  if (res.status === 503) return NextResponse.json({ ok: false, error: "apagado" }, { status: 503 });
  if (res.status === 429) return NextResponse.json({ ok: false, error: "usado" }, { status: 429 });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; results?: { key: string; answer: string; error?: boolean }[] } | null;
  if (!data?.ok || !Array.isArray(data.results)) return NextResponse.json({ ok: false, error: "eco" }, { status: 502 });

  const m = sinAcentos(marca);
  const resultados = data.results.map((r) => {
    const conoce = !r.error && !noLaConoce(r.answer);
    return {
      key: r.key,
      answer: r.answer,
      error: Boolean(r.error),
      conoce,
      nombra: conoce && sinAcentos(r.answer).includes(m),
    };
  });
  return NextResponse.json({ ok: true, marca, pais: pais.nombre, resultados, crudo: data.results });
}
