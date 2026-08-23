const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";
const DIRECTUS_ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL;
const DIRECTUS_ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD;
const DIRECTUS_STATIC_TOKEN = process.env.DIRECTUS_STATIC_TOKEN;

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getDirectusToken(): Promise<string | undefined> {
  // Try static token first
  if (DIRECTUS_STATIC_TOKEN) {
    // Verify it works with a quick ping
    try {
      const ping = await fetch(`${DIRECTUS_URL}/server/health`, {
        headers: { Authorization: `Bearer ${DIRECTUS_STATIC_TOKEN}` },
      });
      if (ping.ok) return DIRECTUS_STATIC_TOKEN;
    } catch {
      // fall through
    }
  }

  // Use cached token if still valid (with 5 min buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  // Login with admin credentials
  if (!DIRECTUS_ADMIN_EMAIL || !DIRECTUS_ADMIN_PASSWORD) {
    return undefined;
  }

  try {
    const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: DIRECTUS_ADMIN_EMAIL,
        password: DIRECTUS_ADMIN_PASSWORD,
      }),
    });

    if (!res.ok) {
      console.error("Directus login failed:", await res.text());
      return undefined;
    }

    const data = await res.json();
    const token = data.data?.access_token;
    const expires = data.data?.expires || 900000; // default 15 min

    if (token) {
      cachedToken = { token, expiresAt: Date.now() + expires };
      return token;
    }
  } catch (err) {
    console.error("Directus token error:", err);
  }

  return undefined;
}

/**
 * Lectura autenticada server-side de items de Directus. El rol público de
 * Directus no tiene permiso de lectura sobre news_articles, así que las
 * páginas públicas (server components) deben leer con el token de servicio.
 * NO usar desde componentes cliente — filtraría el token al bundle.
 *
 * @param query  Path + querystring, ej: "/items/news_articles?filter[...]"
 * @param revalidate  Segundos de ISR para el fetch (default 60).
 */
export async function directusItems<T = unknown>(
  query: string,
  revalidate = 60
): Promise<T[]> {
  const token = await getDirectusToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${DIRECTUS_URL}${query}`, {
    headers,
    next: { revalidate },
  });
  if (!res.ok) {
    throw new Error(`Directus read failed (${res.status}) for ${query}`);
  }
  const json = await res.json().catch(() => ({ data: [] }));
  return (json.data ?? []) as T[];
}
