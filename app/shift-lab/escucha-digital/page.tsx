import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { createPageMetadata, createWebPageSchema } from "@/app/seo";
import SentinelEscucha from "./_/SentinelEscucha";

/* Herramienta gratis de Sentinel: escucha digital de redes sociales y medios.
 * Diseño en el lenguaje del producto Sentinel (papel claro, morado único acento), distinto de la integral y de Eco. */

const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-plex", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

const RUTA = "/shift-lab/escucha-digital";
const TITULO = "Escucha gratis lo que dicen de tu marca en redes y medios";
const DESCRIPCION =
  "Herramienta gratis de Sentinel by Shift: 30 días de conversación pública sobre tu marca en redes sociales, medios y blogs de tu país. Volumen, tono, día pico y quién te amplifica. Sin cuenta, en dos minutos.";

export const metadata: Metadata = createPageMetadata({
  pathname: RUTA,
  title: "Escucha digital gratis de redes y medios · Sentinel by Shift",
  description: DESCRIPCION,
  keywords: ["escucha social gratis", "social listening gratis", "monitoreo de medios", "menciones de marca", "sentinel", "shift lab"],
});

export default function EscuchaDigitalPage() {
  const schema = createWebPageSchema({ pathname: RUTA, title: TITULO, description: DESCRIPCION });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className={`${plex.variable} ${plexMono.variable}`}>
        <SentinelEscucha />
      </div>
    </>
  );
}
