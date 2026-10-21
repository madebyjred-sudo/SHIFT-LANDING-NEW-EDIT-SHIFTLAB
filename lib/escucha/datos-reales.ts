/* Datos reales de las plataformas, agregados y sin nombrar clientes.
 * Medidos el 20-oct-2026. Cada número dice de dónde salió. Se regeneran a mano;
 * no son un tablero en vivo y las landings dicen la fecha. */

export const FECHA_DATOS = "octubre de 2026";

export const ECO_REAL = {
  // mention_events (source_kind = ai_response) en Supabase de Eco, todas las marcas medidas.
  respuestas: 16232,
  nombrada: 7523, // 46,3 %
  citada: 1316, // 8,1 %: la IA enlaza al sitio de la marca
  noNombradaConCompetidor: 2577, // de 8.709 sin la marca, 29,6 % nombró a un competidor
  noNombrada: 8709,
  conBusqueda: { nombrada: 3635, total: 7434 }, // 48,9 %
  deMemoria: { nombrada: 3888, total: 8798 }, // 44,2 %
  porCasa: {
    gemini: { nombrada: 2060, total: 3326 },
    perplexity: { nombrada: 1065, total: 2195 },
    claude: { nombrada: 1571, total: 3358 },
    gpt: { nombrada: 1325, total: 3378 },
    deepseek: { nombrada: 700, total: 1787 },
    meta: { nombrada: 752, total: 1989 },
    grok: { nombrada: 50, total: 199 },
  } as Record<string, { nombrada: number; total: number }>,
  marcas: 30, // espacios de trabajo en Eco
  corridas: 76, // corridas completas
  respuestasTotales: 17018, // eco_responses
};

export const SENTINEL_REAL = {
  // /opt/sentinel-ingest/data/sentinel.db, después de la compuerta de pertinencia.
  menciones: 11786,
  marcas: 5,
  desde: "marzo de 2026",
  porFuente: {
    tiktok: 3790,
    twitter: 2511,
    facebook: 2355,
    news: 633,
    instagram: 601,
    reddit: 480,
    blog: 397,
    youtube: 357,
    radio: 245,
    site: 193,
    linkedin: 97,
    web: 66,
  } as Record<string, number>,
  alertasEnviadas: 481,
  mensajesDeCanal: 30132, // Messenger y canales propios leídos
  comentariosLeidos: 16024,
  conversacionesDelAsistente: 15919, // mensajes del asistente de app leídos
};

/** Una respuesta real de Meta (Llama) sin búsqueda, 20-oct: dijo 1942 para Dos Pinos (fue 1947). Con búsqueda dijo 1947. */
export const EJEMPLO_MEMORIA_VS_BUSQUEDA = {
  marca: "Dos Pinos",
  pais: "Costa Rica",
  casa: "meta",
  memoria: "fundada en 1942",
  busqueda: "fundada en 1947",
  verdad: "1947",
};
