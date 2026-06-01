import { NextResponse } from "next/server";
import { submitHubSpotContactForm } from "@/lib/hubspot/submit-form";
import { rateLimit } from "@/lib/rate-limit";

type HubSpotContactPayload = {
  formInfoUno?: string;
  formInfoDos?: string;
  formInfoTres?: string;
  formInfoCuatro?: string;
  formInfoCinco?: string;
  /** Honeypot: must stay empty for legitimate submissions */
  bot_trap?: string;
};

const MAX_FIELD_LENGTH = 500;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function trimField(value: string | undefined): string {
  return value?.trim() ?? "";
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`contact-hubspot:${ip}`);
    if (!limited.ok) {
      return NextResponse.json(
        { ok: false, message: "Demasiados intentos. Probá más tarde." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    let body: HubSpotContactPayload;
    try {
      body = (await request.json()) as HubSpotContactPayload;
    } catch {
      return NextResponse.json(
        { ok: false, message: "Solicitud no válida." },
        { status: 400 },
      );
    }

    if ((body.bot_trap ?? "").trim()) {
      return NextResponse.json({ ok: true, message: "Mensaje enviado con éxito." });
    }

    const formInfoUno = trimField(body.formInfoUno);
    const formInfoDos = trimField(body.formInfoDos);
    const formInfoTres = trimField(body.formInfoTres);
    const formInfoCuatro = trimField(body.formInfoCuatro);
    const formInfoCinco = trimField(body.formInfoCinco);

    const values = [formInfoUno, formInfoDos, formInfoTres, formInfoCuatro, formInfoCinco];

    if (values.some((value) => value.length > MAX_FIELD_LENGTH)) {
      return NextResponse.json(
        { ok: false, message: "Uno o más campos superan el tamaño permitido." },
        { status: 400 },
      );
    }

    if (values.some((value) => !value)) {
      return NextResponse.json(
        { ok: false, message: "Todos los campos son obligatorios." },
        { status: 400 },
      );
    }

    const referer = request.headers.get("referer") ?? undefined;
    const result = await submitHubSpotContactForm(
      {
        forminfouno: formInfoUno,
        forminfodos: formInfoDos,
        forminfotres: formInfoTres,
        forminfocuatro: formInfoCuatro,
        forminfocinco: formInfoCinco,
      },
      {
        pageUri: referer,
        pageName: "Contact details",
      },
    );

    if (!result.ok) {
      console.error("[api/contact/hubspot]", result.status, result.message);
      return NextResponse.json(
        { ok: false, message: "No se pudo enviar el mensaje. Inténtalo de nuevo." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, message: "Mensaje enviado con éxito." });
  } catch (err) {
    console.error("[api/contact/hubspot]", err);
    return NextResponse.json(
      { ok: false, message: "No se pudo enviar el mensaje. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
