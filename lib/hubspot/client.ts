// ----------------------------------------------------------------------
// HubSpot client — base fetch wrapper
// ----------------------------------------------------------------------
// Server-only. Lee HUBSPOT_TOKEN del env. NO importar desde código
// client-side — el token NUNCA debe llegar al browser.
//
// Diseño defensivo: si el token falta, los helpers NO tiran error
// duro; loguean y devuelven null. Eso permite que el form de contacto
// siga funcionando vía email aunque la integración con HubSpot esté
// rota o todavía no configurada.

const HUBSPOT_API_BASE = "https://api.hubapi.com";

export type HubSpotResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Fetch genérico contra la HubSpot API. Maneja:
 *   - Header de auth Bearer.
 *   - JSON encoding/decoding.
 *   - Errores HTTP con cuerpo (los expone en el resultado para logging).
 *   - Token faltante (devuelve error sin tirar).
 *
 * Si la respuesta no es JSON (raro pero pasa con 204 etc.), devuelve
 * data: undefined as T.
 */
export async function hubspotFetch<T>(
  path: string,
  init: {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: unknown;
    /** Timeout en ms. Default 8s — el form del usuario no puede esperar más. */
    timeoutMs?: number;
  } = {},
): Promise<HubSpotResult<T>> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) {
    return { ok: false, error: "HUBSPOT_TOKEN no está seteado en env" };
  }

  const { method = "GET", body, timeoutMs = 8000 } = init;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${HUBSPOT_API_BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return {
        ok: false,
        error: `HTTP ${res.status} ${res.statusText} — ${text.slice(0, 500)}`,
      };
    }

    if (res.status === 204) {
      return { ok: true, data: undefined as T };
    }

    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? `Timeout después de ${timeoutMs}ms`
          : err.message
        : String(err);
    return { ok: false, error: message };
  } finally {
    clearTimeout(timer);
  }
}
