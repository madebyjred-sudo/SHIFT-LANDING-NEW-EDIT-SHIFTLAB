// ----------------------------------------------------------------------
// /newsroom/ShifterAI — cockpit avanzado del agente Shifter
// ----------------------------------------------------------------------
// Server component: carga el estado REAL del agente (memoria file-based,
// status del container OpenClaw, status editorial) y lo pasa al
// ShifterShell (client component con sidebar + 3 tabs + auth gate).
//
// Los 3 loaders leen los archivos reales del agente en
// lib/avatar-factory/avatars/shifter/ (mismo host que Next.js).
// force-dynamic: nunca cachear, leer al request (los archivos no
// existen en build time).

import ShifterShell from "@/components/shifter/ShifterShell";
import { loadShifterICM } from "@/lib/shifter-icm";
import { getOpenClawStatus } from "@/lib/shifter-system";
import { getShifterStatus } from "@/lib/shifter-status";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shifter Core | Shift Latam",
  description: "Cockpit del agente editorial autónomo Shifter",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function ShifterAIPage() {
  // Cargar en paralelo. Cada loader degrada graceful si los archivos /
  // el container no están disponibles (dev local).
  const [memory, status] = await Promise.all([
    loadShifterICM(),
    getShifterStatus(),
  ]);
  const system = getOpenClawStatus();

  return <ShifterShell memory={memory} system={system} status={status} />;
}
