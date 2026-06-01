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
    { name: "form-info-uno", value: fields.forminfouno },
    { name: "form-info-dos", value: fields.forminfodos },
    { name: "form-info-tres", value: fields.forminfotres },
    { name: "form-info-cuatro", value: fields.forminfocuatro },
    { name: "form-info-cinco", value: fields.forminfocinco },
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
      },
    }),
  });

  if (response.ok) {
    return { ok: true };
  }

  let message = "HubSpot rejected the submission.";
  try {
    const data = (await response.json()) as { message?: string; errors?: { message?: string }[] };
    message = data.message ?? data.errors?.[0]?.message ?? message;
  } catch {
    // keep default message
  }

  return { ok: false, status: response.status, message };
}
