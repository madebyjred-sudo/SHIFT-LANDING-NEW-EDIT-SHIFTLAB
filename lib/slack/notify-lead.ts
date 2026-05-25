// ----------------------------------------------------------------------
// Slack notifier — ping a sales cuando Shifty captura un lead hot
// ----------------------------------------------------------------------
// No-op si SLACK_WEBHOOK_URL no está seteado (graceful disable).
// Diseñado para Slack Incoming Webhooks (link en
// https://api.slack.com/apps → Incoming Webhooks → Add to Workspace).
//
// Filosofía: solo notificamos los GREEN tier (hot leads). Yellow/red
// se quedan en HubSpot sin spam al canal de Slack. El equipo de sales
// puede ver todos los leads ahí.

import type { LLMExtractionResult } from "@/lib/agent/extract-lead-llm";

export type NotifyLeadInput = {
  /** El extraction del LLM o regex enriquecido */
  lead: Partial<LLMExtractionResult> & {
    email?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    company?: string | null;
    country?: string | null;
    intent?: string | null;
    tier?: string | null;
    summary?: string | null;
  };
  /** Page desde donde vino el lead (referer) */
  pageOrigin?: string | null;
  /** HubSpot contact ID si ya se creó el contacto */
  hubspotContactId?: string | null;
  /** Session ID para tracking + link interno */
  sessionId: string;
};

/**
 * Manda un mensaje a Slack si:
 *   • SLACK_WEBHOOK_URL está seteado
 *   • lead.tier === "green" (hot)
 *
 * Fire-and-forget — caller no necesita await. Si Slack falla,
 * log error y seguimos.
 */
export async function notifyHotLead(input: NotifyLeadInput): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return; // disabled
  if (input.lead.tier !== "green") return; // solo hot leads

  const HUBSPOT_PORTAL_ID = process.env.HUBSPOT_PORTAL_ID;
  const contactLink = input.hubspotContactId && HUBSPOT_PORTAL_ID
    ? `https://app.hubspot.com/contacts/${HUBSPOT_PORTAL_ID}/contact/${input.hubspotContactId}`
    : null;

  const fullName = [input.lead.first_name, input.lead.last_name]
    .filter(Boolean)
    .join(" ");
  const displayName = fullName || input.lead.email || "Lead sin identificar";
  const company = input.lead.company ? ` · ${input.lead.company}` : "";
  const country = input.lead.country ? ` 🌎 ${input.lead.country}` : "";

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🔥 Hot lead capturado por Shifty",
        emoji: true,
      },
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Lead:* ${displayName}${company}${country}` },
        { type: "mrkdwn", text: `*Email:* ${input.lead.email || "_no compartido_"}` },
        { type: "mrkdwn", text: `*Intent:* \`${input.lead.intent ?? "?"}\`` },
        { type: "mrkdwn", text: `*Tier:* :green_circle: green` },
      ],
    },
    ...(input.lead.summary
      ? [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Resumen:* ${input.lead.summary}`,
            },
          },
        ]
      : []),
    {
      type: "context",
      elements: [
        ...(input.pageOrigin
          ? [{ type: "mrkdwn", text: `📍 ${input.pageOrigin}` }]
          : []),
        { type: "mrkdwn", text: `🆔 \`${input.sessionId}\`` },
      ],
    },
    ...(contactLink
      ? [
          {
            type: "actions",
            elements: [
              {
                type: "button",
                text: { type: "plain_text", text: "Ver en HubSpot", emoji: true },
                url: contactLink,
                style: "primary",
              },
            ],
          },
        ]
      : []),
    { type: "divider" },
  ];

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🔥 Hot lead: ${displayName} (${input.lead.intent ?? "?"})`, // fallback text
        blocks,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn("[slack] notify failed:", res.status, body.slice(0, 200));
    } else {
      console.log("[slack] notified hot lead:", input.sessionId);
    }
  } catch (err) {
    console.error("[slack] threw:", err);
  }
}
