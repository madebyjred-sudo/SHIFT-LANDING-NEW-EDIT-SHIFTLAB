// ----------------------------------------------------------------------
// Shift Agent — types & mock engine
// ----------------------------------------------------------------------
// Pure UI showcase. The "engine" simulates streaming + thinking + tool
// calls + citations so we can demo the conversation UX without an LLM.
// Drop in a real backend later by replacing `runMockTurn` with a real
// streaming fetch.

export type ThinkingStep = {
  id: string;
  label: string;
  /** ms duration of this step */
  duration: number;
  /** "tool" → renders as a tool-call card. "ponder" → renders as italic text */
  kind: "ponder" | "tool";
  /** Tool name shown in the card (when kind="tool") */
  tool?: string;
  /** Sub-status under the tool name */
  toolDetail?: string;
};

export type Citation = {
  label: string;
  href: string;
};

export type Message =
  | {
      id: string;
      role: "user";
      content: string;
      ts: number;
    }
  | {
      id: string;
      role: "agent";
      /** Final markdown content of the reply */
      content: string;
      /** Reveal progressively (typewriter feel) */
      streaming?: boolean;
      thinking?: ThinkingStep[];
      /** Resolved thinking step IDs (revealed as the response builds) */
      revealedSteps?: string[];
      citations?: Citation[];
      /** Quick chip suggestions for the user to send next */
      suggestions?: string[];
      ts: number;
    };

export type AgentStatus =
  | "idle"
  | "thinking"
  | "tool"
  | "writing"
  | "done";

export type AgentState = {
  open: boolean;
  voice: boolean;
  status: AgentStatus;
  /** label shown next to the thinking spinner ("Pensando…", "Buscando en premios…") */
  statusLabel: string;
  messages: Message[];
};

// ----------------------------------------------------------------------
// Mock scripted responses (page-aware)
// ----------------------------------------------------------------------
// Each user input below is matched loosely (case-insensitive substring).
// When matched, we play the corresponding scripted reply with thinking
// states + streamed final text + chips. Otherwise we fall back to the
// generic reply.

type ScriptedReply = {
  matches: string[]; // substrings (any match triggers)
  thinking: ThinkingStep[];
  reply: string;
  citations?: Citation[];
  suggestions?: string[];
};

export const SCRIPT: ScriptedReply[] = [
  {
    matches: ["premio", "award", "reconoc"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Pregunta sobre reconocimientos del equipo", duration: 600 },
      {
        id: "t2",
        kind: "tool",
        tool: "Reviso el palmarés",
        toolDetail: "Más de 120 premios — los más recientes: Effie, SABRE, Cannes",
        label: "Reviso el palmarés de la agencia",
        duration: 1100,
      },
      { id: "t3", kind: "ponder", label: "Destaco los más relevantes y armo la respuesta", duration: 500 },
    ],
    reply:
      "Shift LATAM acumula **más de 120 premios internacionales**. Los más recientes incluyen Effie Awards, SABRE Awards LATAM y Global, Cannes Lions, FIAP, PRWeek Global Awards y Clio Awards. Si te interesa una industria o tipo de caso específico, decime y te paso ejemplos.",
    citations: [{ label: "Página de Premios", href: "/awards" }],
    suggestions: [
      "¿Algún caso en finanzas?",
      "¿Cómo se mide ese impacto?",
      "Quiero hablar con un consultor",
    ],
  },
  {
    matches: ["servicio", "qué hacen", "que hacen", "ofrecen"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Quiere entender qué hacemos", duration: 500 },
      {
        id: "t2",
        kind: "tool",
        tool: "Consulto el catálogo de servicios",
        toolDetail: "Cuatro capas: estrategia, creatividad, media + data, y crisis",
        label: "Consulto el catálogo de servicios",
        duration: 900,
      },
      { id: "t3", kind: "ponder", label: "Resumo cómo se combinan en la práctica", duration: 450 },
    ],
    reply:
      "Operamos en **4 capas que se combinan**: Estrategia Corporativa y Reputación, Creatividad y Campañas Integradas, Media Performance + Data, y Crisis. No se venden sueltas — diseñamos el mix según el momento de la organización.",
    citations: [{ label: "Servicios", href: "/services" }],
    suggestions: [
      "¿Cómo decido por dónde empezar?",
      "¿Cuánto tarda un proyecto?",
      "Conectame con alguien",
    ],
  },
  {
    matches: ["lab", "ia", "ai", "inteligenc"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Pregunta por la unidad de IA aplicada", duration: 600 },
      {
        id: "t2",
        kind: "tool",
        tool: "Reviso Shift LAB",
        toolDetail: "Cinco capas: auditoría, flujos, automatización, productos y data",
        label: "Reviso Shift LAB",
        duration: 1000,
      },
      { id: "t3", kind: "ponder", label: "Explico la filosofía sin caer en hype", duration: 500 },
    ],
    reply:
      "**Shift LAB** es la unidad de innovación + IA aplicada a comunicación. No usamos IA como tendencia — la integramos como **flujo operativo** para mejorar análisis, acelerar decisiones y potenciar criterio humano. Cinco capas: auditoría de madurez, implementación en flujos, automatización, productos comunicacionales, y data intelligence.",
    citations: [{ label: "Shift LAB", href: "/shift-lab" }],
    suggestions: [
      "Quiero una auditoría",
      "¿Cuál de las 5 capas me aplica?",
      "Casos de éxito con IA",
    ],
  },
  {
    matches: ["contacto", "habla", "hablamos", "reun", "agend", "consult"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Quiere hablar con alguien del equipo", duration: 600 },
      {
        id: "t2",
        kind: "tool",
        tool: "Verifico disponibilidad",
        toolDetail: "Hubs en Costa Rica, Colombia, Ecuador y seis países más",
        label: "Verifico disponibilidad",
        duration: 1100,
      },
      { id: "t3", kind: "ponder", label: "Preparo el handoff con los campos mínimos", duration: 400 },
    ],
    reply:
      "Genial — armo el handoff. Necesito sólo: **nombre, email y un mini-brief de qué te interesa** (1-2 líneas). Te devolvemos contacto en menos de 24h con quien aplica de Costa Rica, Colombia, Ecuador o el hub que corresponda.",
    suggestions: [
      "Quiero agendar ahora",
      "Mejor mandame info por email",
      "Hablemos primero del problema",
    ],
  },
  {
    matches: ["precio", "cuesta", "costo", "tarif", "presupues"],
    thinking: [
      { id: "t1", kind: "ponder", label: "La pregunta depende mucho del scope", duration: 700 },
      { id: "t2", kind: "ponder", label: "Busco rangos honestos sin cerrar opciones", duration: 800 },
    ],
    reply:
      "Honestamente, depende. Un proyecto puntual de **reputación + lanzamiento regional** puede arrancar en USD 30-80K. Un acompañamiento estratégico continuo de 12 meses suele estar entre 8-25K/mes. Lo más útil es **30 minutos en una llamada** donde mapeamos tu caso y te paso un rango realista — sin obligación.",
    suggestions: [
      "Agendemos esa llamada",
      "Mandame un one-pager",
      "¿Trabajan con startups?",
    ],
  },
];

export const GENERIC_REPLY: Omit<ScriptedReply, "matches"> = {
  thinking: [
    { id: "g1", kind: "ponder", label: "Leo el mensaje con calma", duration: 700 },
    { id: "g2", kind: "ponder", label: "Busco el ángulo que mejor te ayuda", duration: 900 },
  ],
  reply:
    "Buena pregunta — necesito un poquito más de contexto. ¿Es algo sobre **nuestros servicios**, **un caso de tu industria**, o querés que te conecte con alguien del equipo directamente?",
  suggestions: [
    "Sobre los servicios",
    "Casos en mi industria",
    "Conectame con alguien",
  ],
};

export function matchScript(input: string): Omit<ScriptedReply, "matches"> {
  const lower = input.toLowerCase();
  const hit = SCRIPT.find((s) =>
    s.matches.some((m) => lower.includes(m.toLowerCase())),
  );
  if (hit) {
    const { matches: _omit, ...rest } = hit;
    return rest;
  }
  return GENERIC_REPLY;
}
