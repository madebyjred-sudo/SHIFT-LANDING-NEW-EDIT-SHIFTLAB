import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import AjustesMovil from "@/components/escucha/AjustesMovil";
import { leerVigente } from "@/lib/escucha/solicitudes";
import VistaReporte from "./VistaReporte";

/* Reporte por correo: privado (noindex), vive 30 días. */
export const dynamic = "force-dynamic";
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-plex", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-plex-mono", display: "swap" });

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = await leerVigente((await params).id);
  return { title: r ? `Reporte de ${r.marca} · Shift LAB` : "Reporte · Shift LAB", robots: { index: false, follow: false } };
}

export default async function ReportePage({ params }: { params: Promise<{ id: string }> }) {
  const r = await leerVigente((await params).id);
  if (!r) notFound();
  const { correo: _c, ...publico } = r; // el correo no viaja al navegador
  void _c;
  return (
    <div className={`${plex.variable} ${plexMono.variable}`}>
      <AjustesMovil />
      <VistaReporte reporte={publico} />
    </div>
  );
}
