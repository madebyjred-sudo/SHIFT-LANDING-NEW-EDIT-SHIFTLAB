import { NextRequest } from "next/server";
import { getDirectusToken } from "@/lib/directus-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";

/**
 * Proxy autenticado de assets de Directus.
 *
 * El rol público de Directus NO puede leer `/assets`, así que el optimizador
 * de Next (que fetchea la imagen sin token) recibía 403. Acá servimos el
 * binario con el token de servicio, same-origin, evitando además el
 * mixed-content del asset HTTP en una página HTTPS.
 *
 * Sólo acepta UUIDs de archivo; cachea en CDN/navegador.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return new Response("Bad request", { status: 400 });
  }

  const token = await getDirectusToken();
  const upstream = await fetch(`${DIRECTUS_URL}/assets/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Not found", { status: upstream.status || 404 });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") || "application/octet-stream",
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
