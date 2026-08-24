import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const SCRIPTS_DIR = "/var/www/shiftlatam-web/scripts";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, topic } = body;

    // Self-fetch al propio app por LOCALHOST, no por req.nextUrl.origin: detrás de
    // nginx el origin es https://shiftlatam.agency y el server no se alcanza por su
    // dominio público HTTPS (→ "fetch failed"). El puerto lo fija pm2 (PORT=3002).
    const LOCAL_BASE = `http://127.0.0.1:${process.env.PORT || 3000}`;

    switch (action) {
      case "scan": {
        // Run scan in background — don't await, fire and forget
        exec(
          `bash ${SCRIPTS_DIR}/shifter-intelligent-scan.sh >> /var/log/shifter-scan-api.log 2>&1`,
          { timeout: 300000 }
        );
        return NextResponse.json({
          success: true,
          message: "Scan iniciado en background. Puede tardar 2-3 minutos.",
        });
      }

      case "think": {
        exec(
          `bash ${SCRIPTS_DIR}/shifter-intelligent-think.sh >> /var/log/shifter-think-api.log 2>&1`,
          { timeout: 300000 }
        );
        return NextResponse.json({
          success: true,
          message: "Think cycle iniciado en background. Puede tardar 1-2 minutos.",
        });
      }

      case "deep-dive": {
        if (!topic) {
          return NextResponse.json(
            { success: false, error: "Se requiere un topic para deep dive" },
            { status: 400 }
          );
        }
        // Forward to the existing shifter API
        const res = await fetch(`${LOCAL_BASE}/api/shifter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Realiza un deep dive exhaustivo sobre: ${topic}. Incluye datos, estadísticas, empresas líderes, case studies y tendencias en LATAM.`,
            modelId: "gpt-5.5",
            traceLabel: "shifter-deep-dive",
          }),
        });
        const data = await res.json();
        return NextResponse.json(data);
      }

      case "column": {
        // Forward to the existing shifter API
        const res = await fetch(`${LOCAL_BASE}/api/shifter`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `A partir de tu memoria reciente (learning loop, entity graph, trends), genera una columna editorial completa de 800-1200 palabras. Incluye: título, tesis central, desarrollo con bullets, y cierre con call-to-action. Tono: cínico fundamentado, directo, para CMOs y directores de comunicación de LATAM.`,
            modelId: "gpt-5.5",
            traceLabel: "shifter-column",
          }),
        });
        const data = await res.json();
        return NextResponse.json(data);
      }

      default:
        return NextResponse.json(
          { success: false, error: `Acción desconocida: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
