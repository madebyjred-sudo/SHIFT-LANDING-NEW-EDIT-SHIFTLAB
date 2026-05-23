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
  // ORDEN IMPORTANTE: matchScript() es first-match-wins via substring.
  // Las entries MÁS ESPECÍFICAS primero (Shift LAB con phrases exactas
  // antes que "servicio" genérico). Si una entry usa substrings cortos
  // o demasiado comunes, va a robar matches del resto.

  // 1. Shift LAB — phrases ESPECÍFICAS solo. NUNCA "ia" o "ai" sueltos
  //    porque matchean estrategia, agencia, financiera, media, etc.
  {
    matches: [
      "shift lab",
      "shiftlab",
      "inteligencia artificial",
      "ia aplicada",
      "ai aplicada",
      "tecnología en comunicación",
      "tecnologia en comunicacion",
      "innovación",
      "innovacion",
      "automatización",
      "automatizacion",
    ],
    thinking: [
      { id: "t1", kind: "ponder", label: "Pregunta por la unidad de tecnología e IA aplicada", duration: 600 },
      {
        id: "t2",
        kind: "tool",
        tool: "Reviso Shift LAB",
        toolDetail: "3 capabilities + 5 servicios IA",
        label: "Reviso Shift LAB",
        duration: 1000,
      },
      { id: "t3", kind: "ponder", label: "Explico qué construimos sin caer en hype", duration: 500 },
    ],
    reply:
      "**Shift LAB** es la unidad de tecnología e IA aplicada a comunicación de Shift LATAM. Construimos donde vive la IA y se vuelve útil para briefs de comunicación: diseño + ingeniería, inteligencia aplicada y operación continua. Cinco servicios: auditoría de madurez en IA, IA integrada a flujos, automatización de tareas repetitivas, productos digitales a medida, y dashboards e inteligencia de datos.",
    citations: [{ label: "Shift LAB", href: "/shift-lab" }],
    suggestions: [
      "Quiero una auditoría de madurez",
      "¿Qué productos digitales hacen?",
      "Casos con IA aplicada",
    ],
  },

  // 2. Premios / reconocimientos
  {
    matches: ["premio", "award", "reconoc", "palmarés", "palmares", "cannes", "effie", "sabre", "fiap"],
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
    citations: [{ label: "Premios", href: "/awards" }],
    suggestions: [
      "¿Algún caso en finanzas?",
      "¿Cómo se mide ese impacto?",
      "Quiero hablar con un consultor",
    ],
  },

  // 3. Shifting Culture — metodología / framework propio
  {
    matches: ["shifting culture", "metodología", "metodologia", "framework", "modelo propio", "modelo de trabajo", "cómo trabajan", "como trabajan"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Quiere entender la metodología", duration: 500 },
      { id: "t2", kind: "ponder", label: "Resumo el modelo Shifting Culture", duration: 700 },
    ],
    reply:
      "**Shifting Culture®** es nuestro modelo propietario. Conecta cultura, reputación y negocio: detecta tensiones culturales, traduce datos en narrativas y convierte conversaciones en influencia medible. Es el framework que está debajo de todo lo que entregamos.",
    citations: [{ label: "Shifting Culture®", href: "/shifting-culture" }],
    suggestions: [
      "¿Cómo se aplica a mi marca?",
      "¿Hay un caso que use ese modelo?",
      "Quiero entender el proceso",
    ],
  },

  // 4. Equipo / hubs / regional — about-us
  {
    matches: ["equipo", "quiénes son", "quienes son", "quién es", "quien es", "líder", "lider", "regional", "hubs", "oficinas", "países", "paises", "centroaméric", "centroameric", "caribe", "cobertura", "regional"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Pregunta por el equipo / cobertura regional", duration: 500 },
      { id: "t2", kind: "ponder", label: "Resumo hubs y liderazgo", duration: 600 },
    ],
    reply:
      "Operamos en **10 hubs latam + Miami**: Costa Rica (sede), Guatemala, El Salvador, Honduras, Nicaragua, Panamá, Colombia, Ecuador, Venezuela y República Dominicana. Cada hub tiene su propio liderazgo regional con contacto directo.",
    citations: [{ label: "Equipo regional", href: "/about-us" }],
    suggestions: [
      "¿Quién está en mi país?",
      "Mostrame los líderes regionales",
      "Quiero hablar con alguien",
    ],
  },

  // 5. Propósito / valores / misión
  {
    matches: ["propósito", "proposito", "misión", "mision", "valores", "qué los mueve", "que los mueve", "impacto social"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Pregunta por propósito y valores", duration: 500 },
      { id: "t2", kind: "ponder", label: "Resumo el manifiesto sin grandilocuencia", duration: 600 },
    ],
    reply:
      "Nuestro **propósito** se articula en triple impacto: personas, negocios y país. Es lo que filtra qué clientes tomamos y qué proyectos rechazamos. El manifiesto completo vive en una página dedicada del sitio.",
    citations: [{ label: "Propósito", href: "/purpose" }],
    suggestions: [
      "¿Hay clientes que no toman?",
      "¿Qué casos reflejan ese propósito?",
      "Conectame con el equipo",
    ],
  },

  // 6. Newsroom / estudios / perspectivas
  {
    matches: ["newsroom", "noticias", "estudio", "perspectivas", "análisis sectorial", "analisis sectorial", "thought leadership", "publicaciones", "white paper"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Pregunta por contenidos publicados", duration: 500 },
      { id: "t2", kind: "ponder", label: "Resumo lo que hay en newsroom", duration: 600 },
    ],
    reply:
      "En el **newsroom** publicamos perspectivas y estudios sectoriales (salud, finanzas, gobierno) además de noticias del equipo. Es donde podés ver cómo pensamos antes de tener una reunión.",
    citations: [{ label: "Newsroom", href: "/newsroom" }],
    suggestions: [
      "¿Hay algo de mi industria?",
      "Mandame el último estudio",
      "Quiero hablar con alguien",
    ],
  },

  // 7. Servicios — FALLBACK general (viene después de los específicos
  //    para no robar matches de Shift LAB / Shifting Culture / etc.)
  {
    matches: ["servicio", "qué hacen", "que hacen", "ofrecen", "capas", "oferta", "qué incluye", "que incluye", "sub-servicios", "sub servicios"],
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
      "Operamos en **4 capas que se combinan**: Estrategia Corporativa y Reputación, Creatividad y Campañas Integradas, Media Performance + Data, y Crisis. Diseñamos el mix según el momento de la organización.",
    citations: [{ label: "Servicios", href: "/services" }],
    suggestions: [
      "¿Cómo decido por dónde empezar?",
      "¿Cuánto tarda un proyecto?",
      "Conectame con alguien",
    ],
  },

  // 8. Contacto / handoff — sin chip de citation (es lead capture flow)
  {
    matches: ["contacto", "habla", "hablamos", "reun", "agend", "consult"],
    thinking: [
      { id: "t1", kind: "ponder", label: "Quiere hablar con alguien del equipo", duration: 600 },
      {
        id: "t2",
        kind: "tool",
        tool: "Verifico disponibilidad",
        toolDetail: "Hubs en Costa Rica, Colombia, Venezuela y siete países más + Miami",
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
