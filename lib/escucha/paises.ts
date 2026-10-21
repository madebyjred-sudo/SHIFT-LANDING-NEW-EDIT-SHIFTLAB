import type { HubOption } from "@/app/contact/hubs";

/* Países donde opera Shift. `cc` es el código ISO que Talkwalker entiende en
 * `sourcecountry:`/`authorcountry:`; `nombre` es el que va en la pregunta a la IA;
 * `hub` rutea el lead al General Manager del país (lib/contact-routing.ts);
 * `tz` sirve para adivinar el país del visitante sin pedirle nada (el sitio no
 * está detrás de Cloudflare y nginx no tiene GeoIP cargado). */
export type Pais = {
  cc: string;
  nombre: string;
  hub: HubOption;
  tz: string[];
};

export const PAISES: Pais[] = [
  { cc: "cr", nombre: "Costa Rica", hub: "Costa Rica (Hub)", tz: ["America/Costa_Rica"] },
  { cc: "gt", nombre: "Guatemala", hub: "Guatemala", tz: ["America/Guatemala"] },
  { cc: "sv", nombre: "El Salvador", hub: "El Salvador", tz: ["America/El_Salvador"] },
  { cc: "hn", nombre: "Honduras", hub: "Honduras", tz: ["America/Tegucigalpa"] },
  { cc: "ni", nombre: "Nicaragua", hub: "Nicaragua", tz: ["America/Managua"] },
  { cc: "pa", nombre: "Panamá", hub: "Panamá", tz: ["America/Panama"] },
  {
    cc: "mx",
    nombre: "México",
    hub: "México",
    tz: [
      "America/Mexico_City", "America/Monterrey", "America/Merida", "America/Cancun",
      "America/Chihuahua", "America/Hermosillo", "America/Mazatlan", "America/Tijuana",
      "America/Matamoros", "America/Bahia_Banderas", "America/Ojinaga", "America/Ciudad_Juarez",
    ],
  },
  { cc: "co", nombre: "Colombia", hub: "Colombia", tz: ["America/Bogota"] },
  { cc: "ec", nombre: "Ecuador", hub: "Ecuador", tz: ["America/Guayaquil", "Pacific/Galapagos"] },
  { cc: "ve", nombre: "Venezuela", hub: "Venezuela", tz: ["America/Caracas"] },
  { cc: "do", nombre: "República Dominicana", hub: "República Dominicana", tz: ["America/Santo_Domingo"] },
];

export const PAIS_POR_DEFECTO = "cr";

/** País del visitante por su zona horaria. Fuera de la región cae en Costa Rica (el hub). */
export function paisDelNavegador(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const p = PAISES.find((x) => x.tz.includes(tz));
    if (p) return p.cc;
  } catch {
    /* sin Intl: país por defecto */
  }
  return PAIS_POR_DEFECTO;
}

export function paisPorCc(cc: string | null | undefined): Pais {
  return PAISES.find((p) => p.cc === cc) ?? PAISES[0];
}
