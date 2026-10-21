import { NextResponse } from "next/server";
import { cuotaMarca, revisarCorreo } from "@/lib/escucha/acceso";
import { limpiarMarca } from "@/lib/escucha/digital";
import { esHumano, ipDe } from "@/lib/escucha/humano";
import { paisPorCc, PAISES } from "@/lib/escucha/paises";
import { crearSolicitud, type Tipo } from "@/lib/escucha/solicitudes";
import { marcaDesdeSitio } from "@/lib/escucha/sitio";
import { rateLimit } from "@/lib/rate-limit";
import { submitHubSpotPrimaryForm } from "@/lib/hubspot/submit-form";

export const dynamic = "force-dynamic";

/* POST { tipo, marca, cc, correo, token } → el reporte corre en segundo plano y llega por correo.
 * La página que lo pide no cambia: solo confirma que el correo va en camino. */

const MSJ: Record<string, string> = {
  formato: "Revisa el correo: parece incompleto.",
  personal: "Usa tu correo de trabajo. Gmail, Hotmail, Outlook y similares no sirven para el reporte.",
  dominio: "No encontramos ese dominio. Revisa que el correo de tu empresa esté bien escrito.",
};

export async function POST(req: Request) {
  let b: { tipo?: string; marca?: string; sitio?: string; cc?: string; correo?: string; token?: string };
  try {
    b = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const tipo = (["ia", "digital", "integral"].includes(String(b.tipo)) ? b.tipo : "integral") as Tipo;
  const cc = String(b.cc ?? "");
  // Con sitio web: el nombre de la marca sale de la página (og:site_name, título o dominio).
  let sitio: string | undefined;
  let marca = limpiarMarca(String(b.marca ?? ""));
  if (b.sitio) {
    const m = await marcaDesdeSitio(String(b.sitio));
    if (!m) return NextResponse.json({ ok: false, campo: "marca", mensaje: "Revisa el sitio web: escríbelo como tuempresa.com." }, { status: 400 });
    marca = limpiarMarca(m.marca);
    sitio = m.dominio;
  }
  if (marca.length < 2 || !PAISES.some((p) => p.cc === cc)) return NextResponse.json({ ok: false, mensaje: "Escribe tu sitio web o tu marca, y elige un país." }, { status: 400 });
  const rev = await revisarCorreo(String(b.correo ?? ""));
  if (!rev.ok) return NextResponse.json({ ok: false, campo: "correo", mensaje: MSJ[rev.error] }, { status: 400 });
  const ip = ipDe(req);
  if (!rateLimit(`escucha-solicitud:${ip}`).ok) return NextResponse.json({ ok: false, mensaje: "Pediste varios reportes seguidos. Espera unos minutos." }, { status: 429 });
  if (!(await esHumano(b.token, ip))) return NextResponse.json({ ok: false, mensaje: "No pudimos verificar que eres una persona. Recarga la página." }, { status: 403 });
  if (!cuotaMarca(rev.correo, `${marca.toLowerCase()}|${cc}|${tipo}`))
    return NextResponse.json({ ok: false, mensaje: "Ya pediste tres reportes hoy con este correo. Mañana puedes pedir más, o escríbenos para la demo completa." }, { status: 429 });

  const { repetido } = await crearSolicitud({ tipo, marca, sitio, cc, correo: rev.correo, ip });
  const pais = paisPorCc(cc);
  void submitHubSpotPrimaryForm(
    { email: rev.correo, selectedcountry: pais.hub, query: `Reporte gratis Shift LAB (${tipo}) de «${marca}»${sitio ? ` (${sitio})` : ""} en ${pais.nombre}.` },
    { pageUri: req.headers.get("referer") ?? "", pageName: "Reporte gratis", ipAddress: ip || undefined },
  ).catch(() => {});
  return NextResponse.json({ ok: true, correo: rev.correo, marca, sitio, repetido, minutos: tipo === "ia" ? "1 a 2" : "3 a 5" });
}
