/* Aviso interno cuando la escucha en IA no alcanza para un reporte (Eco caído,
 * saldo de modelos agotado). Va al equipo técnico, nunca a ventas, y como
 * mucho una vez por hora para que una caída no llene la bandeja. */
const EQUIPO = () => (process.env.ESCUCHA_AVISO_EQUIPO ?? "juan.rojas@shiftlatam.agency").split(",").map((x) => x.trim()).filter(Boolean);

const g = globalThis as unknown as { __escuchaAlerta?: number };

export async function avisarEquipo(asunto: string, detalle: string): Promise<boolean> {
  console.error("[escucha-ia]", asunto, "·", detalle);
  if (g.__escuchaAlerta && Date.now() - g.__escuchaAlerta < 3600e3) return false;
  g.__escuchaAlerta = Date.now();
  const llave = process.env.RESEND_API_KEY;
  if (!llave) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: ["Bearer", llave].join(" "), "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.ESCUCHA_CORREO_FROM ?? "Shift LAB <escucha@eco.shiftlabdev.space>", to: EQUIPO(), subject: `Escucha en IA · ${asunto}`, text: detalle }),
      signal: AbortSignal.timeout(10000),
    });
    return r.ok;
  } catch {
    return false;
  }
}
