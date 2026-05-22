// ----------------------------------------------------------------------
// HubSpot — upsert Contact + adjuntar Note
// ----------------------------------------------------------------------
// Helper de alto nivel para registrar un lead. Diseñado para el form
// de contacto (Phase 1) — más adelante lo usa también Shifty cuando
// detecte el handoff de la conversación.
//
// Lo que hace por debajo:
//   1. POST /crm/v3/objects/contacts/batch/upsert
//      → crea Contact, o actualiza si el email ya existe (idProperty=email).
//   2. POST /crm/v3/objects/notes
//      → crea una Note con el brief + país, asociada al Contact recién creado.
//
// Si el paso 1 falla, no intentamos el 2 (no hay Contact al cual
// asociar). Si el paso 1 funciona y el 2 falla, devolvemos partial
// success — el Contact quedó creado, sólo se perdió la Note (anotamos
// el error para logs).
//
// NO setea Owner. Decisión consciente: hoy el portal HubSpot tiene un
// solo user (Oscar) y queremos que todos los leads queden sin owner
// asignado para que el equipo de Ops los distribuya manualmente. El
// routing real lo hace el código SMTP, no HubSpot.

import { hubspotFetch } from "./client";

export type UpsertContactInput = {
  email: string;
  /** First name del contacto. Si el form no lo pide, pasá undefined. */
  firstname?: string;
  /** Last name del contacto. */
  lastname?: string;
  /** Phone — opcional. */
  phone?: string;
  /** Empresa — opcional. */
  company?: string;
  /** Brief / mensaje del lead. Va al hs_note_body de la Note adjunta. */
  brief: string;
  /** País del hub seleccionado (CR, GT, SV, ...) — va al cuerpo de la Note. */
  country: string;
  /** Origen del lead: "contact-form" | "shifty-chat". */
  source: "contact-form" | "shifty-chat";
  /** Tier ICP (Green/Yellow/Red). Opcional — si la custom property
   * `icp_tier` existe en el portal HubSpot, se setea; si no, HubSpot
   * ignora silently el field (no rompe el upsert). */
  icpTier?: "green" | "yellow" | "red";
};

export type UpsertContactResult = {
  ok: boolean;
  contactId: string | null;
  noteCreated: boolean;
  /** Errores recolectados — vacío si todo OK. */
  errors: string[];
};

type BatchUpsertResponse = {
  results: Array<{ id: string; properties: Record<string, string> }>;
};

/**
 * Crea/actualiza un Contact en HubSpot + adjunta una Note con el brief.
 * Idempotente por email — re-correr para el mismo email actualiza en
 * lugar de duplicar.
 *
 * Nunca tira excepción. Si HubSpot está caído, devuelve `ok: false` con
 * el error en `errors`. El caller decide si fallar la request o no.
 */
export async function upsertContactWithNote(
  input: UpsertContactInput,
): Promise<UpsertContactResult> {
  const errors: string[] = [];

  // ── Paso 1: upsert del Contact ──
  const properties: Record<string, string> = {
    email: input.email,
    lifecyclestage: "lead",
    hs_lead_status: "NEW",
  };
  if (input.firstname) properties.firstname = input.firstname;
  if (input.lastname) properties.lastname = input.lastname;
  if (input.phone) properties.phone = input.phone;
  if (input.company) properties.company = input.company;
  // Standard property "country" — HubSpot lo reconoce sin custom setup.
  properties.country = input.country;
  // Custom property "icp_tier" — sólo se setea si vino en el input. Si
  // la property NO existe en el portal, HubSpot la ignora silently
  // (no rompe el upsert).
  if (input.icpTier) properties.icp_tier = input.icpTier;
  // hs_analytics_source es read-only en HubSpot. Para marcar origen
  // usamos hs_lead_status + el cuerpo de la Note. Si más adelante
  // querés filtrar por source, creás una custom property y la setás
  // acá.

  const upsertRes = await hubspotFetch<BatchUpsertResponse>(
    "/crm/v3/objects/contacts/batch/upsert",
    {
      method: "POST",
      body: {
        inputs: [
          {
            idProperty: "email",
            id: input.email,
            properties,
          },
        ],
      },
    },
  );

  if (!upsertRes.ok) {
    errors.push(`Contact upsert: ${upsertRes.error}`);
    return { ok: false, contactId: null, noteCreated: false, errors };
  }

  const contactId = upsertRes.data.results[0]?.id ?? null;
  if (!contactId) {
    errors.push("Contact upsert: respuesta sin contactId");
    return { ok: false, contactId: null, noteCreated: false, errors };
  }

  // ── Paso 2: crear Note y asociarla al Contact ──
  const noteBody = formatNoteBody(input);

  const noteRes = await hubspotFetch<{ id: string }>(
    "/crm/v3/objects/notes",
    {
      method: "POST",
      body: {
        properties: {
          hs_note_body: noteBody,
          hs_timestamp: Date.now(),
        },
        // associationTypeId 202 = "note_to_contact" (HubSpot built-in).
        associations: [
          {
            to: { id: contactId },
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 202,
              },
            ],
          },
        ],
      },
    },
  );

  if (!noteRes.ok) {
    errors.push(`Note create: ${noteRes.error}`);
    return { ok: true, contactId, noteCreated: false, errors };
  }

  return { ok: true, contactId, noteCreated: true, errors };
}

/**
 * Format del cuerpo de la Note — texto plano con etiquetas claras
 * para que el equipo comercial lea rápido en el timeline del Contact.
 */
function formatNoteBody(input: UpsertContactInput): string {
  const lines: string[] = [];
  lines.push(`📌 Lead vía ${input.source === "contact-form" ? "formulario web" : "chat Shifty"}`);
  lines.push("");
  lines.push(`País / Hub: ${input.country}`);
  lines.push(`Email: ${input.email}`);
  if (input.firstname || input.lastname) {
    lines.push(`Nombre: ${[input.firstname, input.lastname].filter(Boolean).join(" ")}`);
  }
  if (input.phone) lines.push(`Teléfono: ${input.phone}`);
  if (input.company) lines.push(`Empresa: ${input.company}`);
  lines.push("");
  lines.push("──────────");
  lines.push("Brief / mensaje del lead:");
  lines.push("");
  lines.push(input.brief);
  return lines.join("\n");
}
