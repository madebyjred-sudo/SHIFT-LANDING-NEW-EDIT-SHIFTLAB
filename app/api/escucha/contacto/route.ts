import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { ipDe } from "@/lib/escucha/humano";
import { revisarCorreo } from "@/lib/escucha/acceso";
import { paisPorCc, PAISES } from "@/lib/escucha/paises";
import { avisarVentasSinReporte, pedirContactoHoy, type Tipo } from "@/lib/escucha/solicitudes";
import { submitHubSpotPrimaryForm } from "@/lib/hubspot/submit-form";

/* Cierres de ventas.
 * { id }               desde el reporte: «prefiero hablar hoy» (aviso con prioridad).
 * { correo, tipo, cc } desde el final de una landing, sin reporte: «que me escriban». */
export const runtime = "nodejs";

const MSJ: Record<string, string> = {
  formato: "Revisa el correo: parece incompleto.",
  personal: "Usa tu correo de trabajo. Gmail, Hotmail, Outlook y similares no sirven.",
  dominio: "No encontramos ese dominio. Revisa que el correo de tu empresa esté bien escrito.",
};

export async function POST(req: Request) {
  let b: { id?: string; correo?: string; tipo?: string; cc?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const ip = ipDe(req);
  if (!rateLimit(`escucha-contacto:${ip}`).ok) return NextResponse.json({ ok: false, mensaje: "Espera unos minutos e intenta de nuevo." }, { status: 429 });

  if (b.id !== undefined) {
    const id = String(b.id);
    if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ ok: false }, { status: 400 });
    const r = await pedirContactoHoy(id);
    return NextResponse.json({ ok: r !== "no", repetido: r === "repetido" }, { status: r === "no" ? 404 : 200 });
  }

  const rev = await revisarCorreo(String(b.correo ?? ""));
  if (!rev.ok) return NextResponse.json({ ok: false, mensaje: MSJ[rev.error] }, { status: 400 });
  const tipo = (["ia", "digital", "integral"].includes(String(b.tipo)) ? b.tipo : "integral") as Tipo;
  const pais = paisPorCc(PAISES.some((p) => p.cc === b.cc) ? String(b.cc) : "cr");
  const ok = await avisarVentasSinReporte({ correo: rev.correo, tipo, pais: pais.nombre });
  void submitHubSpotPrimaryForm(
    { email: rev.correo, selectedcountry: pais.hub, query: `Cierre de landing Shift LAB (${tipo}): pide que un especialista le escriba.` },
    { pageUri: req.headers.get("referer") ?? "", pageName: "Cierre landing escucha", ipAddress: ip || undefined },
  ).catch(() => {});
  return NextResponse.json({ ok }, { status: ok ? 200 : 502 });
}
