/* Preguntas frecuentes de las tres landings de escucha. Viven aquí (no en los
 * componentes cliente) para que el servidor las use también en el JSON-LD FAQPage. */

import { ECO_REAL, FECHA_DATOS, SENTINEL_REAL } from "./datos-reales";

const FUENTE = `Medido por Eco, ${FECHA_DATOS}`;

export const FAQ_ECO = [
  ["¿De verdad es gratis?", "Sí. Una escucha por marca al día, sin cuenta y sin tarjeta. La demo completa es el siguiente paso si quieres medir cada semana."],
  ["¿Qué le preguntan a la IA?", "Le pedimos a cada una que te describa como lo haría un cliente de tu país, con búsqueda web cuando la tiene. Es una sola pregunta: sirve para ver si te conoce, no para medir tu categoría."],
  ["¿Qué significa «te conoce»?", "Que la IA responde con información sobre tu marca en vez de decir que no la encuentra o confundirla con otra. «Te nombra» quiere decir que además usa tu nombre en la respuesta."],
  ["¿De dónde salen los números de la región?", `De las mediciones de Eco: ${ECO_REAL.respuestas.toLocaleString("es-CR")} respuestas de IA sobre ${ECO_REAL.marcas} marcas, agregadas y sin nombrar a ninguna. ${FUENTE}.`],
  ["¿Qué hacen con mi correo?", "Solo lo usamos si pides la demo completa. Le llega al equipo de Shift en tu país, que te escribe una vez. No entra a ninguna lista."],
];

export const FAQ_SENTINEL = [
  { p: "¿De verdad es gratis?", r: "Sí. Una escucha por marca, sin cuenta y sin tarjeta. Si quieres seguir la conversación todos los días, la demo completa te muestra cómo se ve Sentinel con tu marca." },
  { p: "¿De dónde salen los datos?", r: "De la misma escucha que Sentinel usa con marcas de la región: menciones públicas en redes sociales, medios digitales, blogs y foros de tu país en los últimos 30 días." },
  { p: "¿Por qué el total y la muestra son distintos?", r: "El total cuenta todas las menciones exactas de tu marca. Para el tono, las redes y los medios leemos una muestra, que alcanza para ver la forma de la conversación." },
  { p: "¿Por qué TikTok y LinkedIn dicen «monitoreo completo»?", r: "Porque esas redes no entran en la escucha rápida. En el monitoreo completo las sumamos con otra fuente, igual que radio y TV." },
  { p: "¿Qué hacen con mi correo?", r: "Solo lo usamos si pides la demo completa: le llega al equipo de Shift en tu país, que te escribe una vez. No entra a ninguna lista de correo." },
];

export const FAQ_INTEGRAL = [
  { p: "¿De verdad es gratis?", r: "Sí. Una escucha por marca, sin cuenta y sin tarjeta. Si quieres seguir la conversación y las respuestas de la IA todas las semanas, la demo completa te muestra cómo se ve el monitoreo." },
  { p: "¿De dónde salen los datos?", r: "La parte de IA sale de Eco, nuestra plataforma de medición en inteligencia artificial. La de redes y medios sale de Sentinel, la misma escucha que usamos con marcas de la región." },
  { p: "¿Por qué la muestra no es igual al monitoreo completo?", r: "La escucha gratis hace una sola pregunta a cada IA y lee una muestra de la conversación. El monitoreo completo mide cientos de preguntas de tu categoría, compara con tus competidores, verifica lo que la IA dice de ti contra fuentes reales y suma radio, televisión y tus propios canales." },
  { p: "¿Por qué TikTok y LinkedIn dicen «monitoreo completo»?", r: "Porque esas redes no entran en la escucha rápida. En el monitoreo completo las sumamos con otra fuente." },
  { p: "¿Qué hacen con mi correo?", r: "Solo lo usamos si pides la demo completa: le llega al equipo de Shift en tu país, que te escribe una vez. No entra a ninguna lista de correo." },
];
