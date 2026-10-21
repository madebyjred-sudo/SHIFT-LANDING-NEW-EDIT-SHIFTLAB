/* Verificación anti-bots de la escucha gratis (Cloudflare Turnstile).
 * Sin TURNSTILE_SECRET la verificación queda abierta (para dev y mientras se
 * crea el widget); con secreto, sin token válido = 403. */

export async function esHumano(token: string | undefined, ip: string): Promise<boolean> {
  const secreto = process.env.TURNSTILE_SECRET;
  if (!secreto) return true;
  if (!token) return false;
  try {
    const form = new URLSearchParams({ secret: secreto, response: token });
    if (ip) form.set("remoteip", ip);
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form, signal: AbortSignal.timeout(8000) });
    const j = (await r.json()) as { success?: boolean };
    return Boolean(j.success);
  } catch {
    return false;
  }
}

export function ipDe(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";
}
