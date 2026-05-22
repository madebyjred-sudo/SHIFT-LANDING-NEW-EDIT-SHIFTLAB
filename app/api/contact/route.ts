import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { HUB_OPTIONS, type HubOption } from "@/app/contact/hubs";
import { rateLimit } from "@/lib/rate-limit";

type ContactPayload = {
  hub?: string;
  idea?: string;
  email?: string;
  /** Honeypot: must stay empty for legitimate submissions */
  bot_trap?: string;
};

const MAX_IDEA_LENGTH = 8000;
const MAX_EMAIL_LENGTH = 254;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HUB_EMAILS: Record<HubOption, string> = {
  "Costa Rica (Hub)": "fmartinez@shiftpn.co.cr",
  Guatemala: "fmartinez@shiftpn.co.cr",
  "El Salvador": "fmartinez@shiftpn.co.cr",
  Honduras: "fmartinez@shiftpn.co.cr",
  Nicaragua: "fmartinez@shiftpn.co.cr",
  Panamá: "fmartinez@shiftpn.co.cr",
  Colombia: "fmartinez@shiftpn.co.cr",
  Ecuador: "fmartinez@shiftpn.co.cr",
  Perú: "fmartinez@shiftpn.co.cr",
  México: "fmartinez@shiftpn.co.cr",
  "República Dominicana": "fmartinez@shiftpn.co.cr",
};

function isHubOption(value: string): value is HubOption {
  return HUB_OPTIONS.includes(value as HubOption);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Theme-aligned with contact section: primary #1534DC, secondary #F540FF, surface #E7EAF8, ink #111A31 */
function buildContactEmailHtml(hub: string, email: string, idea: string): string {
  const safeHub = escapeHtml(hub);
  const safeEmail = escapeHtml(email);
  const safeIdea = escapeHtml(idea).replace(/\n/g, "<br/>");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nuevo contacto</title>
</head>
<body style="margin:0;padding:32px 16px;background-color:#E7EAF8;font-family:Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:560px;border-collapse:collapse;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(17,26,49,0.08);">
          <tr>
            <td style="background-color:#1534DC;background-image:linear-gradient(135deg,#1534DC 0%,#1229b8 100%);padding:28px 28px 24px;">
              <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Loymark · Formulario web</p>
              <h1 style="margin:10px 0 0;font-size:22px;font-weight:600;line-height:1.25;color:#ffffff;">Nuevo contacto</h1>
            </td>
          </tr>
          <tr>
            <td style="height:4px;line-height:4px;font-size:0;background-color:#F540FF;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 32px;color:#111A31;font-size:15px;line-height:1.6;">
              <!-- Table rows: Gmail "Translate" injects spans/fonts and breaks flex/inline layouts; cells keep label/value apart. -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td width="160" valign="top" style="width:160px;max-width:40%;padding:0 16px 16px 0;font-weight:700;color:#1534DC;font-size:15px;line-height:1.55;">Hub seleccionado</td>
                  <td valign="top" style="padding:0 0 16px 0;color:#111A31;font-size:15px;line-height:1.55;">${safeHub}</td>
                </tr>
                <tr>
                  <td valign="top" style="padding:0 16px 20px 0;font-weight:700;color:#1534DC;font-size:15px;line-height:1.55;">Email del contacto</td>
                  <td valign="top" style="padding:0 0 20px 0;font-size:15px;line-height:1.55;">
                    <a href="mailto:${safeEmail}" style="color:#1534DC;text-decoration:underline;text-decoration-color:#F540FF;text-underline-offset:3px;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;background-color:#E7EAF8;border-radius:14px;border:1px solid rgba(21,52,220,0.12);">
                      <tr>
                        <td width="160" valign="top" style="width:160px;max-width:40%;padding:16px 8px 16px 18px;font-weight:700;color:#1534DC;font-size:15px;line-height:1.55;">Idea / mensaje:&nbsp;</td>
                        <td valign="top" style="padding:16px 18px 16px 0;color:#111A31;font-size:15px;line-height:1.55;">${safeIdea}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#A3ABD0;max-width:560px;">Podés responder directamente a este correo; la respuesta irá al remitente indicado arriba.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limited = rateLimit(`contact:${ip}`);
    if (!limited.ok) {
      return NextResponse.json(
        { ok: false, message: "Demasiados intentos. Probá más tarde." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    let body: ContactPayload;
    try {
      body = (await request.json()) as ContactPayload;
    } catch {
      return NextResponse.json(
        { ok: false, message: "Solicitud no válida." },
        { status: 400 },
      );
    }

    if ((body.bot_trap ?? "").trim()) {
      return NextResponse.json({ ok: true, message: "Mensaje enviado con éxito." });
    }

    const hub = body.hub?.trim() ?? "";
    const idea = body.idea?.trim() ?? "";
    const email = body.email?.trim() ?? "";

    if (idea.length > MAX_IDEA_LENGTH || email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { ok: false, message: "Uno o más campos superan el tamaño permitido." },
        { status: 400 },
      );
    }

    if (!hub || !idea || !email) {
      return NextResponse.json(
        { ok: false, message: "Todos los campos son obligatorios." },
        { status: 400 },
      );
    }

    if (!isHubOption(hub)) {
      return NextResponse.json(
        { ok: false, message: "La sede seleccionada no es válida." },
        { status: 400 },
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, message: "El correo electrónico no es válido." },
        { status: 400 },
      );
    }

    const recipient = HUB_EMAILS[hub];
    if (!recipient) {
      return NextResponse.json(
        { ok: false, message: "No hay correo configurado para esta sede." },
        { status: 500 },
      );
    }

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || "587");
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = user;

    if (!host || !user || !pass || !from) {
      return NextResponse.json(
        { ok: false, message: "El servidor de correo no está configurado." },
        { status: 500 },
      );
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from,
      to: recipient,
      replyTo: email,
      subject: `Nuevo contacto desde web - ${hub}`,
      text: (() => {
        const ideaLabel = "Idea / mensaje: ";
        const ideaBlock = `${ideaLabel}${idea.replace(/\n/g, `\n${" ".repeat(ideaLabel.length)}`)}`;
        return [
          "Nuevo contacto (formulario web)",
          "",
          `Hub seleccionado: ${hub}`,
          `Email del contacto: ${email}`,
          "",
          ideaBlock,
        ].join("\n");
      })(),
      html: buildContactEmailHtml(hub, email, idea),
    });

    return NextResponse.json({ ok: true, message: "Mensaje enviado con éxito." });
  } catch (err) {
    console.error("[api/contact]", err);
    return NextResponse.json(
      { ok: false, message: "No se pudo enviar el mensaje. Inténtalo de nuevo." },
      { status: 500 },
    );
  }
}
