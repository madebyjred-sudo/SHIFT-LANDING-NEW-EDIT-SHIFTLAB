function getHubSpotSubmitUrl(): string | null {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formId = process.env.HUBSPOT_FORM_ID;
  if (!portalId || !formId) return null;

  const region = process.env.HUBSPOT_REGION || "na2";
  return `https://api-${region}.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
}

export type HubSpotContactFields = {
  forminfouno: string;
  forminfodos: string;
  forminfotres: string;
  forminfocuatro: string;
  forminfocinco: string;
};

type HubSpotSubmitContext = {
  pageUri?: string;
  pageName?: string;
  ipAddress?: string;
};

export async function submitHubSpotContactForm(
  fields: HubSpotContactFields,
  context: HubSpotSubmitContext = {},
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const submitUrl = getHubSpotSubmitUrl();
  if (!submitUrl) {
    return { ok: false, status: 500, message: "HubSpot is not configured." };
  }

  const hubspotFields = [
    { name: "form_info_uno", value: fields.forminfouno },
    { name: "form_info_dos", value: fields.forminfodos },
    { name: "form_info_tres", value: fields.forminfotres },
    { name: "form_info_cuatro", value: fields.forminfocuatro },
    { name: "form_info_cinco", value: fields.forminfocinco },
    { name: "email", value: fields.forminfodos }, // HubSpot requires 'email' to create a contact
  ].map((field) => ({
    objectTypeId: "0-1",
    name: field.name,
    value: field.value,
  }));

  const response = await fetch(submitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: hubspotFields,
      context: {
        pageUri: context.pageUri ?? "",
        pageName: context.pageName ?? "Contact",
        ipAddress: context.ipAddress,
      },
    }),
  });

  if (response.ok) {
    return { ok: true };
  }

  let message = "HubSpot rejected the submission.";
  try {
    const rawData = await response.text();
    console.error("[api/contact/hubspot] RAW HubSpot Error:", rawData);
    const data = JSON.parse(rawData);
    message = data.message ?? data.errors?.[0]?.message ?? message;
  } catch {
    // keep default message
  }

  return { ok: false, status: response.status, message };
}

export type HubSpotPrimaryContactFields = {
  email: string;
  selectedcountry: string;
  query: string;
};

export async function submitHubSpotPrimaryForm(
  fields: HubSpotPrimaryContactFields,
  context: HubSpotSubmitContext = {},
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const region = process.env.HUBSPOT_REGION || "na2";
  const formId = "512299b4-7d11-413c-afcb-19276464e42c";

  if (!portalId) {
    return { ok: false, status: 500, message: "HubSpot is not configured." };
  }

  const submitUrl = `https://api-${region}.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

  const hubspotFields = [
    { name: "email", value: fields.email },
    { name: "selectedcountry", value: fields.selectedcountry },
    { name: "query", value: fields.query },
  ].map((field) => ({
    objectTypeId: "0-1",
    name: field.name,
    value: field.value,
  }));

  const response = await fetch(submitUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: hubspotFields,
      context: {
        pageUri: context.pageUri ?? "",
        pageName: context.pageName ?? "Contact",
        ipAddress: context.ipAddress,
      },
    }),
  });

  if (response.ok) {
    return { ok: true };
  }

  let message = "HubSpot rejected the submission.";
  try {
    const rawData = await response.text();
    console.error("[api/contact/primary] RAW HubSpot Error:", rawData);
    const data = JSON.parse(rawData);
    message = data.message ?? data.errors?.[0]?.message ?? message;
  } catch {
    // keep default message
  }

  return { ok: false, status: response.status, message };
}
