/* Lecturas que cada landing hace sobre los resultados. Todo sale de lo que
 * devolvieron las IA y la escucha; nada se inventa. Si un dato no alcanza
 * para afirmar algo, la función devuelve null y la landing no lo muestra. */
import type { Resumen, ResIA } from "./cliente";

const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

const NO_MARCAS = new Set(
  [
    "Costa", "Rica", "Costa Rica", "Guatemala", "Panamá", "México", "Mexico", "Colombia", "Ecuador", "Honduras", "Nicaragua",
    "El Salvador", "Venezuela", "República Dominicana", "Centroamérica", "Latinoamérica", "Caribe", "Estados Unidos", "América",
    "Es", "La", "El", "Los", "Las", "Un", "Una", "En", "Sin", "Con", "Para", "Como", "Sus", "Su", "Si", "Además", "Sin embargo",
    "También", "Según", "Ofrece", "Entre", "Otras", "Otros", "Algunas", "Algunos", "Existen", "Hay", "Alternativas", "No", "Dos",
    "Por", "Del", "Al", "Lo", "Este", "Esta", "Estos", "Fundada", "Fue", "Cuenta", "Tiene", "Desde", "Aunque", "Pero",
    "San José", "Heredia", "Alajuela", "Cartago", "Ciudad", "Guatemala City", "Bogotá", "Medellín", "Quito", "Guayaquil",
    "Tegucigalpa", "Managua", "San Salvador", "Santo Domingo", "Caracas", "Monterrey", "Guadalajara", "CDMX",
    "ChatGPT", "Claude", "Gemini", "Perplexity", "DeepSeek", "Grok", "Meta", "Llama", "Google", "Instagram", "Facebook",
    "TikTok", "YouTube", "LinkedIn", "X", "IA", "Sí", "Ver", "Cada", "Muy", "Más", "Mejor", "Mejores",
  ].map(norm),
);

/** Nombres propios que las IA recomiendan como alternativa (aparecen en 2 o más IA y no son la marca). */
export function alternativasNombradas(resultados: ResIA[], marca: string): { nombre: string; ias: number }[] {
  const m = norm(marca);
  const conteo = new Map<string, { nombre: string; ias: Set<string> }>();
  for (const r of resultados) {
    if (r.error || !r.answer) continue;
    const idx = norm(r.answer).search(/alternativ|competid|otras marcas|tambien (se )?(recomienda|encuentra)|opciones/);
    const tramo = idx >= 0 ? r.answer.slice(idx) : "";
    if (!tramo) continue;
    const nombres = tramo.match(/\b([A-ZÁÉÍÓÚÑ][\wáéíóúñ&'.-]+(?:\s(?:de\s|del\s)?[A-ZÁÉÍÓÚÑ][\wáéíóúñ&'.-]+){0,2})/g) ?? [];
    for (const n of nombres) {
      const k = norm(n).replace(/[.,]$/, "");
      if (k.length < 3 || NO_MARCAS.has(k) || k.includes(m) || m.includes(k)) continue;
      const e = conteo.get(k) ?? { nombre: n.replace(/[.,]$/, ""), ias: new Set<string>() };
      e.ias.add(r.key);
      conteo.set(k, e);
    }
  }
  return [...conteo.values()]
    .map((e) => ({ nombre: e.nombre, ias: e.ias.size }))
    .filter((e) => e.ias >= 2)
    .sort((a, b) => b.ias - a.ias)
    .slice(0, 6);
}

/** Datos concretos que las IA afirman (años, cantidades, %) y en qué no coinciden entre ellas. */
export function datosEnDisputa(resultados: ResIA[]): { tema: string; valores: { valor: string; ias: string[] }[] }[] {
  const temas: { tema: string; re: RegExp }[] = [
    { tema: "Año de fundación", re: /fundad[ao][^.]{0,40}?\b(1[89]\d\d|20[0-2]\d)\b/i },
    { tema: "Cantidad de productos", re: /\b(\d{1,3}(?:[.,]\d{3})*|\d+)\s+(?:productos|variedades|referencias)/i },
    { tema: "Años en el mercado", re: /\b(\d{1,3})\s+años\b/i },
  ];
  const out: { tema: string; valores: { valor: string; ias: string[] }[] }[] = [];
  for (const t of temas) {
    const v = new Map<string, string[]>();
    for (const r of resultados) {
      const mm = r.answer?.match(t.re);
      if (mm) v.set(mm[1], [...(v.get(mm[1]) ?? []), r.key]);
    }
    if (v.size >= 2) out.push({ tema: t.tema, valores: [...v.entries()].map(([valor, ias]) => ({ valor, ias })) });
  }
  return out;
}

/** Día pico de la conversación y cuánto pesa sobre la ventana. */
export function picoDeConversacion(s: Resumen): { dia: string; n: number; parte: number } | null {
  if (!s.porDia.length || s.muestra < 10) return null;
  const top = [...s.porDia].sort((a, b) => b.n - a.n)[0];
  return { dia: top.dia, n: top.n, parte: top.n / s.muestra };
}

/** Red donde más se habla de la marca (sobre la muestra). */
export function redDominante(s: Resumen): { key: string; n: number; parte: number } | null {
  const e = Object.entries(s.porRed).sort((a, b) => b[1] - a[1])[0];
  if (!e || !s.muestra || e[1] === 0) return null;
  return { key: e[0], n: e[1], parte: e[1] / s.muestra };
}

/* ---------- El cruce: lo que solo se ve con las dos herramientas a la vez ---------- */

/** Temas de los titulares recientes que ninguna IA menciona: lo que pasó y la IA todavía no sabe. */
export function loQueLaIANoSabe(s: Resumen, resultados: ResIA[], marca: string): { tema: string; titulo: string; medio: string }[] {
  const textoIA = norm(resultados.map((r) => r.answer || "").join(" "));
  const m = norm(marca);
  const out: { tema: string; titulo: string; medio: string }[] = [];
  const vistos = new Set<string>();
  for (const t of s.titulares) {
    // Nombres propios de 2+ palabras o de una palabra con mayúscula interna (ChocoQuQi); se descarta
    // la primera palabra del titular y todo lo que siga a "San/Santa" (lugares).
    const sinLugares = t.titulo.replace(/\b(San|Santa|Santo)\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]+/g, " ");
    const cuerpo = sinLugares.replace(/^\S+\s*/, "");
    const nombres = cuerpo.match(/\b[A-ZÁÉÍÓÚÑ][\wáéíóúñ]{3,}(?:\s[A-ZÁÉÍÓÚÑ][\wáéíóúñ]{3,})*/g) ?? [];
    const nuevo = nombres.map(norm).find((n) => !NO_MARCAS.has(n) && !n.includes(m) && !m.includes(n) && !textoIA.includes(n) && !vistos.has(n));
    if (nuevo) {
      vistos.add(nuevo);
      out.push({ tema: nombres.find((n) => norm(n) === nuevo)!, titulo: t.titulo, medio: t.medio });
    }
  }
  return out.slice(0, 3);
}

/** Medios que hablan de la marca y que alguna IA nombra en su respuesta (fuentes que la IA ya lee). */
export function mediosQueLaIALee(s: Resumen, resultados: ResIA[]): { medio: string; ias: number }[] {
  const out: { medio: string; ias: number }[] = [];
  for (const md of s.medios) {
    const raiz = norm(md.nombre.replace(/\.(com|net|cr|co|mx|gt|hn|sv|ni|pa|ec|ve|do)(\.[a-z]{2})?$/i, "").replace(/^www\./, ""));
    if (raiz.length < 4) continue;
    const ias = resultados.filter((r) => norm(r.answer || "").replace(/\s/g, "").includes(raiz.replace(/\s/g, ""))).length;
    out.push({ medio: md.nombre, ias });
  }
  return out;
}

/** El cuadrante: cuánto se habla de la marca contra cuánto la conoce la IA. */
export function cuadrante(total: number, conocen: number, casas: number): { clave: string; titulo: string; texto: string } {
  const muchaConversacion = total >= 60;
  const iaLaConoce = conocen / casas >= 0.6;
  if (muchaConversacion && iaLaConoce)
    return { clave: "alineada", titulo: "Presente en los dos mundos", texto: "La gente habla de tu marca y la IA la conoce. El riesgo ahora es lo que dicen: el tono de la conversación termina en las respuestas de la IA." };
  if (muchaConversacion && !iaLaConoce)
    return { clave: "brecha", titulo: "La conversación no llega a la IA", texto: "Se habla de tu marca, pero la mayoría de las IA no la reconoce. Lo que pasa en redes y medios no se está convirtiendo en respuestas." };
  if (!muchaConversacion && iaLaConoce)
    return { clave: "memoria", titulo: "La IA te recuerda, la gente no te nombra", texto: "La IA te conoce por lo que leyó antes. Sin conversación nueva, lo que responde de ti envejece." };
  return { clave: "silencio", titulo: "Silencio en los dos mundos", texto: "Ni la conversación ni la IA te tienen presente. Es el punto de partida más claro: todo lo que publiques se va a notar." };
}
