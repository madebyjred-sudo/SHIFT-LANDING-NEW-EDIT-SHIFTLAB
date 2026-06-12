// ----------------------------------------------------------------------
// /api/shifter/columns — lee las columnas del agente desde Directus
// ----------------------------------------------------------------------
// La colección `shifter_columns` la alimenta el agente Shifter (sus
// candidatos editoriales). Estados: candidate → draft → ready →
// in_review → approved → published → rejected.
//
// Query param opcional ?status=draft para filtrar (la bandeja de
// aprobación pide los draft/ready).

import { NextResponse } from "next/server";
import { getDirectusToken } from "@/lib/directus-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DIRECTUS_URL =
  process.env.NEXT_PUBLIC_DIRECTUS_URL || "http://2.25.128.2:8055";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let token: string | undefined;
  try {
    token = await getDirectusToken();
  } catch {
    token = undefined;
  }

  // Construir query Directus
  const fields = [
    "id",
    "title",
    "status",
    "avatar",
    "tension",
    "thesis",
    "lede",
    "body",
    "agent_updated_at",
    "date_created",
  ].join(",");
  let path = `/items/shifter_columns?limit=-1&sort=-agent_updated_at&fields=${fields}`;
  if (status) path += `&filter[status][_eq]=${encodeURIComponent(status)}`;

  try {
    const res = await fetch(`${DIRECTUS_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, columns: [], error: `directus ${res.status}` },
        { status: 200 },
      );
    }
    const json = (await res.json()) as { data?: unknown[] };
    return NextResponse.json({ ok: true, columns: json.data ?? [] });
  } catch (e) {
    return NextResponse.json(
      { ok: false, columns: [], error: String(e) },
      { status: 200 },
    );
  }
}
