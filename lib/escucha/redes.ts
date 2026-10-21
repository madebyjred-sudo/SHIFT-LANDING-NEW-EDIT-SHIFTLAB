/* Las redes y superficies que cubre la escucha digital. Siempre se muestran
 * todas (pedido de producto): las que el escaneo gratis no alcanza dicen que
 * entran en el monitoreo completo, nunca un cero inventado.
 *
 * `tipos` = valores de `tipo` que devuelve el Quick Search de Talkwalker
 * (tw-qs-mcp.js). TikTok y LinkedIn no existen en Talkwalker: en el monitoreo
 * completo entran por BrandMentions. */
export type Red = {
  key: string;
  nombre: string;
  icono: string | null; // svg blanco en /public/escucha/redes
  tipos: string[];
  soloCompleto?: boolean;
};

export const REDES: Red[] = [
  { key: "facebook", nombre: "Facebook", icono: "/escucha/redes/facebook.svg", tipos: ["facebook"] },
  { key: "instagram", nombre: "Instagram", icono: "/escucha/redes/instagram.svg", tipos: ["instagram"] },
  { key: "x", nombre: "X", icono: "/escucha/redes/x.svg", tipos: ["twitter"] },
  { key: "tiktok", nombre: "TikTok", icono: "/escucha/redes/tiktok.svg", tipos: ["tiktok"], soloCompleto: true },
  { key: "youtube", nombre: "YouTube", icono: "/escucha/redes/youtube.svg", tipos: ["youtube", "video"] },
  { key: "linkedin", nombre: "LinkedIn", icono: "/escucha/redes/linkedin.svg", tipos: ["linkedin"], soloCompleto: true },
  { key: "reddit", nombre: "Reddit", icono: "/escucha/redes/reddit.svg", tipos: ["reddit"] },
  { key: "threads", nombre: "Threads", icono: "/escucha/redes/threads.svg", tipos: ["threads"] },
  { key: "bluesky", nombre: "Bluesky", icono: "/escucha/redes/bluesky.svg", tipos: ["bluesky"] },
  { key: "medios", nombre: "Medios digitales", icono: null, tipos: ["onlinenews", "news", "print", "tv", "radio"] },
  { key: "blogs", nombre: "Blogs y foros", icono: null, tipos: ["blog", "forum", "forums", "message_boards"] },
];
