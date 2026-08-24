// /newsroom/ShifterAI — ruta legada. El cockpit vive ahora en
// /agent-admin/shifter (multi-ICM). Redirect permanente para no romper
// links viejos ni el bookmark del equipo.

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function ShifterAILegacyRedirect() {
  redirect("/agent-admin/shifter");
}
