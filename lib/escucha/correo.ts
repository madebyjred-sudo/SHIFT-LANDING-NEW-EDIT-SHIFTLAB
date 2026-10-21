/* Correos al cliente del reporte gratis (Eco, Sentinel e integral).
 * Tablas, estilos inline, 600 px, imágenes PNG/JPEG servidas desde el sitio
 * (public/escucha/correo, generadas por scratch/correo-escucha/assets.cjs).
 * Todo número sale del propio reporte. */
import { CASAS } from "./casas";
import { gancho } from "./gancho";
import type { Reporte, Tipo } from "./solicitudes";

const ASSETS = () => `${process.env.ESCUCHA_ASSETS_BASE ?? "https://shiftlatam.agency"}/escucha/correo`;
const V = "?v=1";
const img = (f: string) => `${ASSETS()}/${f}${V}`;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

type Tema = { fondo: string; acento: string; boton: string; suave: string };
const TEMA: Record<Tipo, Tema> = {
  ia: { fondo: "#0A0E27", acento: "#1534dc", boton: "#1534dc", suave: "#eef1ff" },
  digital: { fondo: "#17171B", acento: "#9244D8", boton: "#9244D8", suave: "#f4eefb" },
  integral: { fondo: "#0E1438", acento: "#1534dc", boton: "#1534dc", suave: "#eaf9fc" },
};
function que(r: Reporte) {
  const n = r.ia && "resultados" in r.ia ? r.ia.resultados.filter((x) => !x.error).length : 0;
  const ia = n ? `lo que responden ${n} inteligencias artificiales` : "lo que responden las inteligencias artificiales";
  return r.tipo === "ia" ? ia : r.tipo === "digital" ? "lo que se dice en redes y medios en los últimos 30 días" : `${ia} y lo que se dice en redes y medios`;
}

const F = "font-family:Figtree,'Segoe UI',Helvetica,Arial,sans-serif";

function rotulo(t: string, color: string) {
  return `<p style="${F};margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:${color}">${t}</p>`;
}

function bloqueIA(r: Reporte, t: Tema) {
  if (!r.ia || !("resultados" in r.ia)) return "";
  const res = r.ia.resultados.filter((x) => !x.error);
  if (!res.length) return "";
  const nombran = res.filter((x) => x.nombra).length;
  const celdas = CASAS.filter((c) => res.some((x) => x.key === c.key))
    .map((c) => {
      const si = res.find((x) => x.key === c.key)?.nombra;
      return `<td align="center" valign="top" style="padding:0 1px">
        <img src="${img(`ia-${c.key}${si ? "" : "-gris"}.png`)}" width="28" height="28" alt="${esc(c.nombre)}" style="display:block;border:0;margin:0 auto">
        <p class="n" style="${F};margin:8px 0 0;font-size:10.5px;line-height:1.2;color:${si ? "#0e1745" : "#a3a9c4"};font-weight:${si ? 700 : 500}">${esc(c.nombre.replace(" (Llama)", ""))}</p>
        <p style="${F};margin:3px 0 0;font-size:11px;font-weight:700;color:${si ? "#12a150" : "#a3a9c4"}">${si ? "sí" : "no"}</p></td>`;
    })
    .join("");
  return `<tr><td style="padding:28px 32px 0">${rotulo("Qué IA te nombra", t.acento)}
    <p style="${F};margin:0 0 18px;font-size:15px;color:#4a5488"><b style="color:#0e1745;font-size:22px">${nombran} de ${res.length}</b>&nbsp; inteligencias artificiales nombran a ${esc(r.marca)} cuando se les pregunta por su categoría.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed"><tr>${celdas}</tr></table></td></tr>`;
}

const RED: Record<string, string> = { facebook: "Facebook", instagram: "Instagram", x: "X", tiktok: "TikTok", youtube: "YouTube", linkedin: "LinkedIn", reddit: "Reddit", threads: "Threads", bluesky: "Bluesky", medios: "Medios", blogs: "Blogs" };

function bloqueDigital(r: Reporte, t: Tema) {
  if (!r.digital || !("resumen" in r.digital)) return "";
  const s = r.digital.resumen;
  const tot = s.tono.positivo + s.tono.neutral + s.tono.negativo;
  let tono = "";
  if (tot > 0) {
    const seg = [
      ["Positivo", s.tono.positivo, "#12a150"],
      ["Neutral", s.tono.neutral, "#c3c8dc"],
      ["Negativo", s.tono.negativo, "#e5484d"],
    ] as const;
    const pc = seg.map(([, n]) => Math.round((n / tot) * 1000) / 10);
    tono = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:18px"><tr>${seg
      .map((x, i) => (pc[i] > 0 ? `<td width="${pc[i]}%" style="width:${pc[i]}%;height:10px;background:${x[2]};font-size:0;line-height:0">&nbsp;</td>` : ""))
      .join("")}</tr></table>
    <p style="${F};margin:9px 0 0;font-size:12px;color:#4a5488">${seg
      .map((x, i) => `<span style="color:${x[2]};font-size:14px">&#9679;</span>&nbsp;${x[0]} ${Math.round(pc[i])}%`)
      .join("&nbsp;&nbsp;&nbsp;")}</p>`;
  }
  const redes = Object.entries(s.porRed as Record<string, number>)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const max = redes[0]?.[1] ?? 1;
  const barras = redes
    .map(([k, n]) => {
      const w = Math.max(2, Math.round((n / max) * 100));
      return `<tr><td style="${F};width:92px;padding:5px 0;font-size:13px;color:#0e1745;white-space:nowrap">${RED[k] ?? k}</td><td style="padding:5px 10px 5px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%"><tr><td width="${w}%" style="width:${w}%;height:8px;background:${t.acento};border-radius:4px;font-size:0;line-height:0">&nbsp;</td>${w < 100 ? `<td style="font-size:0;line-height:0">&nbsp;</td>` : ""}</tr></table></td><td align="right" style="${F};width:44px;padding:5px 0;font-size:13px;font-weight:700;color:#0e1745">${fmt(n)}</td></tr>`;
    })
    .join("");
  return `<tr><td style="padding:28px 32px 0">${rotulo("Lo que se dice de tu marca", t.acento)}
    <p style="${F};margin:0;font-size:15px;color:#4a5488"><b style="color:#0e1745;font-size:22px">${fmt(s.total)}</b>&nbsp; menciones de ${esc(r.marca)} en 30 días, en redes y medios de ${esc(r.pais)}.</p>
    ${tono}
    ${barras ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:18px">${barras}</table>` : ""}</td></tr>`;
}

function bloqueCalientes(r: Reporte, t: Tema) {
  const c = r.calientes;
  if (!c) return "";
  const palabras = [...(c.conversacion ?? []).map((x) => x.t), ...(c.ia ?? []).map((x) => x.t), ...(c.busqueda ?? []).map((x) => x.t)]
    .filter((x, i, a) => x && a.indexOf(x) === i)
    .slice(0, 6);
  if (!palabras.length) return "";
  return `<tr><td style="padding:28px 32px 0">${rotulo("Tus palabras calientes", t.acento)}
    <p style="${F};margin:0">${palabras
      .map((p) => `<span style="display:inline-block;margin:0 6px 8px 0;padding:7px 12px;border-radius:999px;background:${t.suave};color:#0e1745;font-size:13px;font-weight:600">${esc(p)}</span>`)
      .join("")}</p></td></tr>`;
}

function marco(tipo: Tipo, preheader: string, cuerpo: string) {
  const t = TEMA[tipo];
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Shift LAB</title><style>@media (max-width:480px){.n{display:none!important}}</style></head>
<body style="margin:0;padding:0;background:${t.fondo}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${t.fondo}"><tr><td align="center" style="padding:28px 12px 36px">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden">
<tr><td style="font-size:0;line-height:0"><img src="${img(`cabecera-${tipo}.jpg`)}" alt="Shift LAB · reporte gratis" style="display:block;width:100%;max-width:600px;height:auto;border:0"></td></tr>
${cuerpo}
<tr><td align="center" style="padding:34px 32px 30px;background:#f4f5fb">
<img src="${img("shift.png")}" width="62" alt="Shift Latam" style="display:block;border:0;margin:0 auto 12px">
<p style="${F};margin:0;font-size:11.5px;line-height:1.6;color:#858eb4">Recibiste este correo porque pediste un reporte gratis en shiftlatam.agency/shift-lab con tu correo de trabajo.<br>Shift Latam · shiftlatam.agency</p>
</td></tr></table></td></tr></table></body></html>`;
}

function tarjetaFabiana(texto: string) {
  return `<tr><td style="padding:30px 32px 34px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-top:1px solid #e6e8f2"><tr>
<td valign="middle" style="padding-top:24px;width:76px"><img src="${img("fabiana.png")}" width="64" height="64" alt="Fabiana Martínez" style="display:block;border:0;border-radius:50%"></td>
<td valign="middle" style="padding-top:24px;${F}"><p style="margin:0;font-size:15px;font-weight:700;color:#0e1745">Fabiana Martínez</p>
<p style="margin:2px 0 0;font-size:13.5px;line-height:1.5;color:#4a5488">Directora de Desarrollo de Negocio, Shift Latam. ${texto}</p></td></tr></table></td></tr>`;
}

export function correoListo(r: Reporte, url: string): { asunto: string; html: string; texto: string } {
  const t = TEMA[r.tipo];
  const g = gancho(r);
  const vence = new Date(r.creado + 30 * 86400e3).toLocaleDateString("es-CR", { day: "numeric", month: "long", timeZone: "America/Costa_Rica" });
  const cuerpo = `<tr><td style="padding:34px 32px 0">
${rotulo(`Tu reporte de ${esc(r.marca)} · ${esc(r.pais)}`, t.acento)}
<h1 style="${F};margin:0;font-size:27px;line-height:1.18;font-weight:700;letter-spacing:-.01em;color:#0e1745">${esc(g.titulo)}</h1>
<p style="${F};margin:14px 0 0;font-size:15px;line-height:1.6;color:#4a5488">Leímos ${que(r)} sobre ${esc(r.marca)}. Esto es lo primero que salta. El detalle completo, con cada respuesta y cada fuente, está en tu reporte.</p>
</td></tr>
${bloqueIA(r, t)}
${bloqueDigital(r, t)}
${bloqueCalientes(r, t)}
<tr><td align="center" style="padding:32px 32px 0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background:${t.boton};border-radius:12px"><a href="${url}" style="${F};display:inline-block;padding:16px 34px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">Ver mi reporte completo</a></td></tr></table>
<p style="${F};margin:12px 0 0;font-size:12.5px;color:#858eb4">Privado y sin cuenta. Disponible hasta el ${vence}.</p>
</td></tr>
${tarjetaFabiana(`Ella o alguien de su equipo te escribe en las próximas 24 horas hábiles para leer este reporte contigo. ¿Prefieres hablar hoy? Responde este correo.`)}`;
  const asunto = `Tu reporte de ${r.marca} está listo`;
  const texto = `Tu reporte de ${r.marca} (${r.pais}) está listo.\n\n${g.titulo}\n${g.detalle}\n\nVer el reporte completo: ${url}\nDisponible hasta el ${vence}.\n\nFabiana Martínez o alguien de su equipo en Shift te escribe en las próximas 24 horas hábiles. Si prefieres hablar hoy, responde este correo.`;
  return { asunto, html: marco(r.tipo, `${g.titulo} Tu reporte completo está listo.`, cuerpo), texto };
}

export function correoFallo(r: Reporte, base: string): { asunto: string; html: string; texto: string } {
  const t = TEMA[r.tipo];
  const otra = `${base}/shift-lab/${r.tipo === "ia" ? "escucha-ia" : r.tipo === "digital" ? "escucha-digital" : "escucha-gratis"}`;
  const cuerpo = `<tr><td style="padding:34px 32px 0">
${rotulo(`Tu reporte de ${esc(r.marca)} · ${esc(r.pais)}`, t.acento)}
<h1 style="${F};margin:0;font-size:26px;line-height:1.2;font-weight:700;color:#0e1745">No pudimos terminar tu reporte esta vez</h1>
<p style="${F};margin:14px 0 0;font-size:15px;line-height:1.6;color:#4a5488">Las fuentes no respondieron a tiempo. No es tu marca ni tu correo: vuelve a pedirlo en unos minutos y te llega igual que siempre.</p>
</td></tr>
<tr><td align="center" style="padding:28px 32px 0">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background:${t.boton};border-radius:12px"><a href="${otra}" style="${F};display:inline-block;padding:15px 30px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">Pedirlo de nuevo</a></td></tr></table>
</td></tr>
${tarjetaFabiana("Si prefieres no esperar, responde este correo y te escribimos hoy.")}`;
  return {
    asunto: `No pudimos terminar tu reporte de ${r.marca}`,
    html: marco(r.tipo, "Las fuentes no respondieron a tiempo. Vuelve a pedirlo en unos minutos.", cuerpo),
    texto: `No pudimos terminar tu reporte de ${r.marca}: las fuentes no respondieron a tiempo. Vuelve a pedirlo en unos minutos: ${otra}`,
  };
}
