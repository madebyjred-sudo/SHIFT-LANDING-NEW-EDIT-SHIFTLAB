// ----------------------------------------------------------------------
// agent-auth — identidad del usuario server-side (para aislar historial)
// ----------------------------------------------------------------------
// El cockpit autentica con Supabase en el cliente. Para escribir/leer el
// historial por-usuario, las rutas verifican el JWT del usuario (enviado
// como `Authorization: Bearer <access_token>`) contra Supabase y devuelven
// su user.id. Sin token válido → null (la ruta responde 401).

import { createClient } from "@supabase/supabase-js";

export async function getUserIdFromRequest(req: Request): Promise<string | null> {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await sb.auth.getUser(token);
    if (error || !data.user) return null;
    return data.user.id;
  } catch {
    return null;
  }
}
