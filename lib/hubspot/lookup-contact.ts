// ----------------------------------------------------------------------
// HubSpot — lookup contact by email para Phase 3 (context enrichment)
// ----------------------------------------------------------------------
// Cuando el visitor identifica su email durante la conversación, le
// preguntamos al CRM "¿conocés a este contacto?". Si existe, le pasamos
// info safe a Cerebro como system context para que Shifty personalice
// la respuesta ("Hola Juan, vi que estuvimos hablando hace 3 días").
//
// Privacy first: solo extraemos campos NON-sensitive del contacto:
//   ✓ firstname, lastname, company  (personalización)
//   ✓ lifecyclestage                 (lead | MQL | SQL | customer | etc)
//   ✓ lastmodifieddate               (recency signal)
//   ✗ NO deals, amounts, owner email, notas internas, IPs, history
//
// La razón: si pasáramos data sensitive al LLM y este la incluye en
// la respuesta, queda expuesta al visitor. Personalizar SÍ, leak NO.

import { hubspotFetch } from "./client";

export type ContactContext = {
  email: string;
  firstName: string | null;
  lastName: string | null;
  company: string | null;
  /** lead | marketingqualifiedlead | salesqualifiedlead | opportunity |
   *  customer | evangelist | other. HubSpot canonical values. */
  lifecycleStage: string | null;
  /** ISO timestamp del último modify del contacto. Útil para que Shifty
   *  sepa si es un contact recién creado o si ya hubo interacciones. */
  lastModified: string | null;
};

type HubSpotContactResponse = {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    company?: string;
    lifecyclestage?: string;
    lastmodifieddate?: string;
  };
};

/**
 * Lookup contact por email vía HubSpot Contacts API. Devuelve null si:
 *   • No existe el contacto
 *   • HubSpot API falla (timeout, 500, etc)
 *   • HUBSPOT_TOKEN no está seteado
 *
 * Siempre con timeout corto (3s) — esta función va EN el critical path
 * de Shifty (antes de stream a Cerebro), no queremos que un slow HubSpot
 * bloquee la respuesta. Si tarda demasiado, mejor responder sin context
 * que hacer al user esperar.
 */
export async function getContactByEmail(email: string): Promise<ContactContext | null> {
  if (!process.env.HUBSPOT_TOKEN) return null;
  const normalized = email.toLowerCase().trim();
  if (!normalized || !normalized.includes("@")) return null;

  try {
    // GET /crm/v3/objects/contacts/{email}?idProperty=email&properties=...
    const properties = [
      "email",
      "firstname",
      "lastname",
      "company",
      "lifecyclestage",
      "lastmodifieddate",
    ].join(",");

    const r = await hubspotFetch<HubSpotContactResponse>(
      `/crm/v3/objects/contacts/${encodeURIComponent(normalized)}?idProperty=email&properties=${properties}`,
      {
        method: "GET",
        // Timeout corto — critical path
        timeoutMs: 3000,
      },
    );

    if (!r.ok) {
      // 404 = contact no existe (esperado). Otros errors loguean discreto.
      if (!r.error.includes("404")) {
        console.warn("[hubspot-lookup]", r.error.slice(0, 200));
      }
      return null;
    }

    const props = r.data?.properties || {};

    return {
      email: normalized,
      firstName: props.firstname || null,
      lastName: props.lastname || null,
      company: props.company || null,
      lifecycleStage: props.lifecyclestage || null,
      lastModified: props.lastmodifieddate || null,
    };
  } catch (err) {
    console.warn("[hubspot-lookup] threw:", err);
    return null;
  }
}

/**
 * Formatea un ContactContext como bloque de system prompt para Cerebro.
 * Concise — máx 200 chars. El LLM lee esto y adjusta tone/personalización
 * sin necesidad de procesar grandes paredes de info.
 */
export function formatContactContextForPrompt(ctx: ContactContext): string {
  const fullName = [ctx.firstName, ctx.lastName].filter(Boolean).join(" ");
  const lifecycle = ctx.lifecycleStage
    ? humanizeLifecycle(ctx.lifecycleStage)
    : "contacto nuevo";

  const parts: string[] = [];
  if (fullName) parts.push(`Nombre: ${fullName}`);
  if (ctx.company) parts.push(`Empresa: ${ctx.company}`);
  parts.push(`Stage: ${lifecycle}`);
  if (ctx.lastModified) {
    const days = Math.floor(
      (Date.now() - new Date(ctx.lastModified).getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days >= 0 && days < 365) {
      parts.push(
        days === 0
          ? "Última interacción hoy"
          : days === 1
            ? "Última interacción ayer"
            : `Última interacción hace ${days} días`,
      );
    }
  }

  return [
    "# Contexto del visitor (HubSpot CRM)",
    "Este visitor está identificado en tu CRM. Personalizá el saludo (usá nombre si lo sabés) y referenciá brevemente la relación previa cuando sea natural. NO menciones explícitamente que estás leyendo CRM. NO inventes deals, owner names, ni interacciones específicas que no estén acá.",
    "",
    parts.map((p) => `- ${p}`).join("\n"),
  ].join("\n");
}

function humanizeLifecycle(stage: string): string {
  const map: Record<string, string> = {
    subscriber: "suscriptor",
    lead: "lead",
    marketingqualifiedlead: "MQL (marketing qualified)",
    salesqualifiedlead: "SQL (sales qualified)",
    opportunity: "oportunidad activa",
    customer: "cliente actual",
    evangelist: "evangelista",
    other: "otro",
  };
  return map[stage.toLowerCase()] || stage;
}
