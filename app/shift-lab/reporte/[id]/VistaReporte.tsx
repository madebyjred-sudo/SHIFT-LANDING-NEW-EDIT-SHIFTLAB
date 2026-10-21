"use client";

import { SentinelMarca } from "@/components/escucha/SentinelMarca";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { EstadoDig, EstadoIA } from "@/lib/escucha/cliente";
import type { Reporte as ReporteData } from "@/lib/escucha/solicitudes";
import { paisPorCc } from "@/lib/escucha/paises";
import PalabrasCalientes from "@/components/escucha/PalabrasCalientes";
import { Reporte as ReporteEco } from "../../escucha-ia/_/EcoEscucha";
import EscenaEco from "../../escucha-ia/_/EscenaEco";
import { Reporte as ReporteSentinel } from "../../escucha-digital/_/SentinelEscucha";
import EscenaSentinel from "../../escucha-digital/_/EscenaSentinel";
import { DemoCompleta, LecturaIntegral } from "@/components/escucha/EscuchaGratis";
import "../../escucha-ia/_/eco.css";

type Publico = Omit<ReporteData, "correo">;

const fecha = (t: number) => new Date(t).toLocaleDateString("es-CR", { day: "numeric", month: "long", year: "numeric" });

function Copiar({ claro }: { claro: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard.writeText(window.location.href);
        setOk(true);
        setTimeout(() => setOk(false), 1800);
      }}
      className={`h-10 rounded-full border px-4 text-[13px] font-semibold transition ${claro ? "border-current/20 hover:bg-black/5" : "border-white/20 hover:bg-white/10"}`}
    >
      {ok ? "Enlace copiado" : "Copiar enlace del reporte"}
    </button>
  );
}

function EnProceso({ r }: { r: Publico }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(id);
  }, [router]);
  return (
    <div className="grid min-h-[80vh] place-items-center bg-[#0A0E27] px-6 pt-28 text-center text-white">
      <div className="max-w-md">
        <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-[#5BE9FF]" />
        <h1 className="mt-6 text-[28px] font-bold [font-family:var(--font-figtree)]">Armando el reporte de {r.marca}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-white/65">Estamos escuchando {r.tipo === "digital" ? "las redes y los medios" : r.tipo === "ia" ? "a las inteligencias artificiales" : "a la IA, las redes y los medios"} de {r.pais}. Esta página se actualiza sola, y también te avisamos por correo.</p>
      </div>
    </div>
  );
}

function Encabezado({ r, tono }: { r: Publico; tono: "eco" | "sentinel" | "integral" }) {
  const claro = tono !== "integral";
  const kicker = { eco: "Reporte de IA", sentinel: "Reporte de redes y medios", integral: "Reporte integral · Eco + Sentinel" }[tono];
  const color = { eco: "#1534dc", sentinel: "#9244D8", integral: "#5BE9FF" }[tono];
  return (
    <header className="pt-32 pb-6 md:pt-40">
      <p className="flex items-center gap-2.5 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ color }}>
        {kicker}
        {tono === "eco" && <img src="/escucha/eco/eco-logo.svg" alt="Shift Eco" className="h-4 w-auto" />}
        {tono === "sentinel" && <SentinelMarca />}
      </p>
      <h1 className={`mt-4 text-[40px] font-bold leading-[1.02] tracking-[-0.02em] md:text-[64px] [font-family:var(--font-figtree)] ${claro ? "" : "text-white"}`}>{r.marca}</h1>
      <div className={`mt-5 flex flex-wrap items-center gap-4 text-[14px] ${claro ? "text-current/70" : "text-white/60"}`}>
        <span>{r.pais} · {fecha(r.terminado ?? r.creado)}</span>
        <Copiar claro={claro} />
      </div>
    </header>
  );
}

export default function VistaReporte({ reporte: r }: { reporte: Publico }) {
  if (r.estado === "en_proceso") return <EnProceso r={r} />;
  if (r.estado === "error")
    return (
      <div className="grid min-h-[70vh] place-items-center bg-[#0A0E27] px-6 pt-28 text-center text-white">
        <div className="max-w-md">
          <h1 className="text-[28px] font-bold">No pudimos terminar este reporte</h1>
          <p className="mt-3 text-white/65">Las fuentes no respondieron a tiempo. Pídelo de nuevo en unos minutos.</p>
          <Link href="/shift-lab/escucha-gratis" className="mt-6 inline-block rounded-full bg-[#1534DC] px-5 py-3 font-semibold">Volver a pedirlo</Link>
        </div>
      </div>
    );

  const pais = paisPorCc(r.cc);
  const ia: EstadoIA = r.ia && "resultados" in r.ia ? { fase: "listo", resultados: r.ia.resultados, crudo: r.ia.crudo } : { fase: r.ia ? "error" : "idle" };
  const dig: EstadoDig = r.digital && "resumen" in r.digital ? { fase: "listo", resumen: r.digital.resumen } : { fase: r.digital ? "error" : "idle" };
  const calientes = r.calientes ?? { busqueda: [], ia: [], conversacion: [] };

  if (r.tipo === "ia")
    return (
      <div className="eco-page">
        <div className="eco-wrap text-[#0e1745]">
          <Encabezado r={r} tono="eco" />
          {ia.fase === "listo" && ia.resultados ? <ReporteEco marca={r.marca} cc={r.cc} resultados={ia.resultados} crudo={ia.crudo} /> : <p className="py-10 text-[#4a5488]">Las IA no respondieron a tiempo esta vez.</p>}
          <PalabrasCalientes marca={r.marca} pais={r.pais} calientes={calientes} tono="eco" />
        </div>
        {ia.fase === "listo" && <EscenaEco marca={r.marca} pais={r.pais} resultados={ia.resultados} />}
      </div>
    );

  if (r.tipo === "digital")
    return (
      <div className="bg-[#F4F4F2] text-[#17171B] [font-family:var(--font-plex)]">
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
          <Encabezado r={r} tono="sentinel" />
        </div>
        {dig.fase === "listo" && dig.resumen ? <ReporteSentinel r={dig.resumen} hub={pais.hub} nombrePais={pais.nombre} /> : <p className="mx-auto max-w-[1200px] px-10 py-10 text-[#5F6068]">Las fuentes de redes y medios no respondieron a tiempo esta vez.</p>}
        <div className="mx-auto w-full max-w-[1200px] px-5 md:px-10">
          <PalabrasCalientes marca={r.marca} pais={r.pais} calientes={calientes} tono="sentinel" />
        </div>
        {dig.fase === "listo" && <EscenaSentinel marca={r.marca} pais={r.pais} resumen={dig.resumen} />}
      </div>
    );

  return (
    <div className="overflow-x-clip bg-[#0A0E27] text-white">
      <div className="mx-auto w-full max-w-[1180px] px-6 md:px-10">
        <Encabezado r={r} tono="integral" />
        <LecturaIntegral marca={r.marca} cc={r.cc} ia={ia} dig={dig} />
        <PalabrasCalientes marca={r.marca} pais={r.pais} calientes={calientes} tono="integral" />
        <DemoCompleta marca={r.marca} cc={r.cc} ia={ia} dig={dig} />
        <div className="h-20" />
      </div>
    </div>
  );
}
