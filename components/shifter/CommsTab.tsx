"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ArrowRight, Terminal, Activity, Cpu, Database, Radio, FileText, X, Zap, Brain, Telescope, Newspaper, Clock, TrendingUp, RefreshCw, Lightbulb, History, Search, Plus } from "lucide-react";
import { LabTerminalFrame, LabCursor, LabSectionLabel, LabStatusPill } from "@/components/ui/lab-primitives";
import { ShifterThinkingRow, DelegationIndicator } from "./ShifterActivity";
import type { ModelOption } from "./ShifterShell";
import type { ShifterMemory } from "@/lib/shifter-icm";
import type { OpenClawStatus } from "@/lib/shifter-system";
import type { ShifterStatus } from "@/lib/shifter-status";
import ChatMarkdown from "@/components/agent/ChatMarkdown";
import { createClient } from "@/lib/supabase";

type MessageRole = "shifter" | "oscar";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  model?: string;
  latencyMs?: number;
  status?: "sending" | "done";
  // La respuesta se cortó por límite de tokens (finish_reason === "length").
  // Se muestra aviso + botón para continuar: el chat es stateless, así que
  // continuar reenvía la cola de este texto como contexto.
  truncated?: boolean;
  // URLs reales recuperadas por Sonar en modo investigación.
  sources?: string[];
  // Marcador de contexto compactado (se pinta como separador, no como burbuja).
  compaction?: { turns: number };
  // Dorminte hasta que se cablee la delegación (#18): si presente, la burbuja
  // renderiza DelegationIndicator en vez del texto. Nada lo emite hoy.
  activity?: { kind: "delegating"; task: string; deliverable?: string; microState?: string; status?: "running" | "done" };
}

function formatTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-CR", { year: "numeric", month: "short", day: "2-digit" });
}

export default function CommsTab({
  selectedModel,
  system,
  memory,
  status,
  apiBase = "/api/shifter",
  agentId = "shifter",
  agentName = "Shifter",
}: {
  selectedModel: ModelOption;
  system: OpenClawStatus;
  memory: ShifterMemory;
  status: ShifterStatus;
  apiBase?: string;
  agentId?: string;
  agentName?: string;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m0",
      role: "shifter",
      content: "Sistemas iniciados. Memoria base cargada. Estoy listo para procesar inputs.",
      timestamp: new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" }),
      status: "done",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  // Modo investigación: recupera fuentes reales (Sonar) ANTES de que Shifter
  // escriba, y lo restringe a citar solo esas URLs. Apagado, tiene prohibido
  // escribir enlaces (así dejó de fabricarlos).
  const [research, setResearch] = useState(false);
  // Contexto conversacional: el resumen del tramo ya compactado y cuántos
  // turnos quedaron dentro de él (esos ya no se reenvían literales).
  const [summary, setSummary] = useState<string>("");
  const [foldedCount, setFoldedCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [userName, setUserName] = useState<string>("TÚ");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [insights, setInsights] = useState<{ id: number; title: string; confidence: string; status: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Historial por usuario+agente (persistido en Postgres, buscable) ──
  const newSessionId = () =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const [sessionId, setSessionId] = useState<string>(newSessionId);
  const [token, setToken] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<
    { sessionId: string; started: string; last: string; count: number; preview: string }[]
  >([]);
  const [histLoading, setHistLoading] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchResults, setSearchResults] = useState<
    { sessionId: string; role: string; snippet: string; ts: string }[]
  >([]);

  const historyBase = `/api/agents/${agentId}/history`;
  const authHeaders = (): Record<string, string> =>
    token
      ? { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
      : { "Content-Type": "application/json" };

  useEffect(() => {
    const sb = createClient();
    sb.auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null));
  }, []);

  const persistTurn = async (userMessage: string, agentMessage: string, model?: string) => {
    if (!token) return;
    try {
      await fetch(historyBase, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ sessionId, userMessage, agentMessage, model }),
      });
    } catch {
      /* persistencia best-effort: no rompe el chat */
    }
  };

  const loadSessions = async () => {
    if (!token) return;
    setHistLoading(true);
    try {
      const r = await fetch(historyBase, { headers: authHeaders() });
      const d = await r.json();
      if (d.success) setSessions(d.sessions || []);
    } catch {
      /* noop */
    } finally {
      setHistLoading(false);
    }
  };

  const openSession = async (sid: string) => {
    if (!token) return;
    try {
      const r = await fetch(`${historyBase}?session=${encodeURIComponent(sid)}`, { headers: authHeaders() });
      const d = await r.json();
      if (d.success && Array.isArray(d.messages)) {
        setSessionId(sid);
        setMessages(
          d.messages.map((m: { role: string; content: string; model: string | null; ts: string }, i: number) => ({
            id: `h${i}`,
            role: (m.role === "user" ? "oscar" : "shifter") as MessageRole,
            content: m.content,
            timestamp: new Date(m.ts).toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" }),
            model: m.model || undefined,
            status: "done" as const,
          })),
        );
        // Cada hilo tiene su propio contexto compactado: al cambiar de sesión
        // el resumen anterior no debe filtrarse.
        setSummary("");
        setFoldedCount(0);
        setShowHistory(false);
        setSearchResults([]);
        setSearchQ("");
      }
    } catch {
      /* noop */
    }
  };

  const doSearch = async (q: string) => {
    setSearchQ(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    if (!token) return;
    try {
      const r = await fetch(`${historyBase}?q=${encodeURIComponent(q)}`, { headers: authHeaders() });
      const d = await r.json();
      if (d.success) setSearchResults(d.results || []);
    } catch {
      /* noop */
    }
  };

  const newChat = () => {
    setSessionId(newSessionId());
    setSummary("");
    setFoldedCount(0);
    setMessages([
      {
        id: "m0",
        role: "shifter",
        content: "Sistemas iniciados. Memoria base cargada. Estoy listo para procesar inputs.",
        timestamp: new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" }),
        status: "done",
      },
    ]);
    setShowHistory(false);
    setSearchResults([]);
    setSearchQ("");
  };

  const toggleHistory = () => {
    const n = !showHistory;
    setShowHistory(n);
    if (n) loadSessions();
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      const name = data.user?.user_metadata?.full_name || data.user?.email?.split("@")[0];
      if (name) setUserName(name.toUpperCase());
    });
  }, []);

  useEffect(() => {
    fetch(`${apiBase}/memory?type=insights`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const rank: Record<string, number> = { high: 3, medium: 2, low: 1 };
          const sorted = (data.data as any[])
            .filter((i) => i.status !== "deprecated")
            .sort((a, b) => {
              const rankDiff = (rank[b.confidence] || 0) - (rank[a.confidence] || 0);
              if (rankDiff !== 0) return rankDiff;
              return new Date(b.last_updated || 0).getTime() - new Date(a.last_updated || 0).getTime();
            })
            .slice(0, 6);
          setInsights(sorted);
        }
      })
      .catch(() => {});
  }, [actionLoading, apiBase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, isProcessing, reducedMotion]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isProcessing) return;

    // Historial = el hilo visible ANTES de este mensaje (este `messages` es el
    // del render actual, así que todavía no incluye el turno que estamos por
    // mandar). Sirve igual en sesiones restauradas, porque `openSession`
    // reconstruye el array con los mismos roles.
    // Se excluyen el saludo de arranque, las burbujas de actividad y los
    // errores de canal: no son conversación y ensucian el contexto.
    // `foldedCount` salta los turnos que ya viven dentro del resumen: solo
    // viajan literales los posteriores a la última compactación.
    const history = messages
      .filter((m) => m.id !== "m0" && !m.activity && !m.compaction)
      .filter(
        (m) =>
          !(m.role === "shifter" && /^(Error de canal:|Fallo de conexión:)/.test(m.content)),
      )
      .map((m) => ({
        role: m.role === "oscar" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      }))
      .slice(foldedCount);

    const now = new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), role: "oscar", content: trimmed, timestamp: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          modelId: selectedModel.id,
          research,
          history,
          summary,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "shifter",
            content: `Error de canal: ${data.error || res.statusText}`,
            timestamp: new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" }),
            status: "done",
          },
        ]);
      } else {
        // El resumen vuelve al cliente para reenviarlo: así la compactación
        // corre solo cuando se cruza el umbral, no en cada turno.
        if (typeof data.summary === "string" && data.summary) setSummary(data.summary);
        const folded: number =
          data.compacted && typeof data.compactedTurns === "number" ? data.compactedTurns : 0;
        if (folded > 0) setFoldedCount((c) => c + folded);

        setMessages((prev) => [
          ...prev,
          ...(folded > 0
            ? [
                {
                  id: `c${Date.now()}`,
                  role: "shifter" as MessageRole,
                  content: "",
                  timestamp: "",
                  status: "done" as const,
                  compaction: { turns: folded },
                },
              ]
            : []),
          {
            id: (Date.now() + 1).toString(),
            role: "shifter",
            content: data.text || "Sin respuesta",
            timestamp: new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" }),
            model: data.model,
            latencyMs: data.latencyMs,
            status: "done",
            truncated: data.truncated === true,
            sources: Array.isArray(data.sources) ? data.sources : undefined,
          },
        ]);
        void persistTurn(trimmed, data.text || "Sin respuesta", data.model);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "shifter",
          content: `Fallo de conexión: ${err instanceof Error ? err.message : "unknown"}`,
          timestamp: new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" }),
          status: "done",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Con historial ya no hace falta devolverle su propia cola: la respuesta
  // cortada viaja como turno previo, así que alcanza con pedirle que siga.
  const handleContinue = () => {
    void handleSend(
      "Tu respuesta anterior se cortó por límite de tokens. Continuá EXACTAMENTE desde donde quedó: no repitas nada de lo ya escrito, no reintroduzcas el tema, no saludes. Seguí la frase en curso.",
    );
  };

  const runAction = async (action: string, topic?: string) => {
    setActionLoading(action);
    setActionMessage(null);
    try {
      const res = await fetch(`${apiBase}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, topic }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message || data.text || "Listo.");
        if (data.text && action !== "scan" && action !== "think") {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "shifter",
              content: data.text,
              timestamp: new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" }),
              model: data.model,
              status: "done",
            },
          ]);
        }
      } else {
        setActionMessage(data.error || "Error");
      }
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Error");
    } finally {
      setActionLoading(null);
      window.setTimeout(() => setActionMessage(null), 6000);
    }
  };

  const recentFiles = memory.folders
    .flatMap((f) => f.files)
    .sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime())
    .slice(0, 5);

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      {/* Chat area */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
          <LabSectionLabel index="04" name="Comms" />
          <div className="flex items-center gap-2">
            <button
              onClick={newChat}
              title="Nueva conversación"
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1.5 text-white/60 transition-colors hover:border-white/20 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <Plus size={14} />
              <span className="hidden sm:inline [font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.1em]">Nueva</span>
            </button>
            <button
              onClick={toggleHistory}
              aria-pressed={showHistory}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE9FF]/50 ${
                showHistory
                  ? "border-[#5BE9FF]/40 bg-[#5BE9FF]/10 text-[#5BE9FF]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              <History size={14} />
              <span className="hidden sm:inline [font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.1em]">Historial</span>
            </button>
            <button
              onClick={() => setDevMode((v) => !v)}
              aria-pressed={devMode}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/50 ${
                devMode
                  ? "border-[#F540FF]/40 bg-[#F540FF]/10 text-[#F540FF]"
                  : "border-white/[0.08] bg-white/[0.03] text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              <Terminal size={14} />
              <span className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.1em]">Dev</span>
            </button>
          </div>
        </div>

        {/* Panel de Historial (overlay, por usuario+agente, buscable) */}
        {showHistory && (
          <div className="absolute inset-0 z-30 flex flex-col bg-[#0A0E27]/98 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
              <div className="flex items-center gap-2 text-white/80">
                <History size={15} className="text-[#5BE9FF]" />
                <span className="[font-family:var(--font-figtree)] text-[13px] font-semibold">Historial · {agentName}</span>
              </div>
              <button onClick={() => setShowHistory(false)} className="rounded-lg p-1.5 text-white/50 hover:bg-white/[0.06] hover:text-white focus:outline-none">
                <X size={16} />
              </button>
            </div>
            <div className="border-b border-white/[0.06] px-4 py-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={searchQ}
                  onChange={(e) => doSearch(e.target.value)}
                  placeholder={`Buscar en tus chats con ${agentName}…`}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-8 pr-3 [font-family:var(--font-fira-mono)] text-[12px] text-white placeholder-white/30 focus:border-[#5BE9FF]/40 focus:outline-none"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {!token ? (
                <p className="p-4 text-center [font-family:var(--font-fira-mono)] text-[12px] text-white/40">Iniciá sesión para ver tu historial.</p>
              ) : searchQ.trim() ? (
                searchResults.length === 0 ? (
                  <p className="p-4 text-center [font-family:var(--font-fira-mono)] text-[12px] text-white/40">Sin resultados.</p>
                ) : (
                  <div className="space-y-1.5">
                    {searchResults.map((h, i) => (
                      <button
                        key={i}
                        onClick={() => openSession(h.sessionId)}
                        className="block w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-left transition-colors hover:border-[#5BE9FF]/30"
                      >
                        <p className="[font-family:var(--font-figtree)] text-[12px] leading-snug text-white/80" dangerouslySetInnerHTML={{ __html: h.snippet }} />
                        <p className="mt-1 [font-family:var(--font-fira-mono)] text-[10px] text-white/30">
                          {h.role === "user" ? "vos" : agentName} · {new Date(h.ts).toLocaleDateString("es-CR")}
                        </p>
                      </button>
                    ))}
                  </div>
                )
              ) : histLoading ? (
                <p className="p-4 text-center [font-family:var(--font-fira-mono)] text-[12px] text-white/40">Cargando…</p>
              ) : sessions.length === 0 ? (
                <p className="p-4 text-center [font-family:var(--font-fira-mono)] text-[12px] text-white/40">Todavía no hay conversaciones. Escribile a {agentName} y quedará acá.</p>
              ) : (
                <div className="space-y-1.5">
                  {sessions.map((s) => (
                    <button
                      key={s.sessionId}
                      onClick={() => openSession(s.sessionId)}
                      className={`block w-full rounded-lg border p-3 text-left transition-colors ${
                        s.sessionId === sessionId
                          ? "border-[#5BE9FF]/40 bg-[#5BE9FF]/[0.06]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/20"
                      }`}
                    >
                      <p className="truncate [font-family:var(--font-figtree)] text-[12px] text-white/90">{s.preview || "(sin texto)"}</p>
                      <p className="mt-1 [font-family:var(--font-fira-mono)] text-[10px] text-white/30">
                        {new Date(s.last).toLocaleDateString("es-CR")} · {s.count} mensajes
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6" aria-live="polite" aria-atomic="false">
          <div className="mx-auto max-w-3xl space-y-5">
            {!devMode ? (
              <>
                <AnimatePresence initial={false}>
                  {messages.map((msg) =>
                    msg.compaction ? (
                      // Marcador de compactación: separador, no burbuja.
                      <div key={msg.id} className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-white/[0.08]" />
                        <span
                          title="Los turnos más viejos se resumieron para que quepan en el contexto. El resumen sigue disponible para el agente."
                          className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.12em] text-white/35"
                        >
                          Contexto compactado · {msg.compaction.turns} turnos resumidos
                        </span>
                        <div className="h-px flex-1 bg-white/[0.08]" />
                      </div>
                    ) : (
                    <motion.div
                      key={msg.id}
                      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${msg.role === "oscar" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                          msg.role === "shifter"
                            ? "border-[#00FF88]/30 bg-[#00FF88]/8 text-[#00FF88]"
                            : "border-[#5BE9FF]/30 bg-[#5BE9FF]/8 text-[#5BE9FF]"
                        }`}
                      >
                        {msg.role === "shifter" ? <Bot size={16} /> : <User size={16} />}
                      </div>

                      <div className={`max-w-[80%] min-w-0 ${msg.role === "oscar" ? "items-end" : "items-start"} flex flex-col`}>
                        <div className="mb-1 flex items-center gap-2">
                          <span className="[font-family:var(--font-figtree)] text-[11px] font-semibold text-white/80">
                            {msg.role === "shifter" ? agentName.toUpperCase() : userName}
                          </span>
                          <span className="[font-family:var(--font-fira-mono)] text-[10px] text-white/30">{msg.timestamp}</span>
                          {msg.model && (
                            <span className="rounded bg-white/[0.05] px-1 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] text-white/30">
                              {msg.model.split("/").pop()}
                            </span>
                          )}
                          {msg.latencyMs != null && (
                            <span className="[font-family:var(--font-fira-mono)] text-[9px] text-[#00FF88]/50">
                              {(msg.latencyMs / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>

                        <div
                          className={`min-w-0 max-w-full break-words rounded-2xl border px-4 py-3 ${
                            msg.role === "shifter"
                              ? "rounded-tl-none border-white/[0.08] bg-[#141A36]/80 text-white/90"
                              : "rounded-tr-none border-[#5BE9FF]/20 bg-[#5BE9FF]/8 text-white"
                          }`}
                        >
                          {msg.status === "sending" ? (
                            <div className="flex items-center gap-2 text-[#00FF88]">
                              <span className="relative inline-flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00FF88] opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00FF88]" />
                              </span>
                              <span className="[font-family:var(--font-fira-mono)] text-[12px]">Enviando...</span>
                              {!reducedMotion && <LabCursor color="#00FF88" />}
                            </div>
                          ) : msg.activity?.kind === "delegating" ? (
                            <DelegationIndicator
                              task={msg.activity.task}
                              deliverable={msg.activity.deliverable}
                              microState={msg.activity.microState}
                              status={msg.activity.status}
                              reducedMotion={reducedMotion}
                            />
                          ) : (
                            <>
                              <ChatMarkdown text={msg.content} />
                              {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-3 border-t border-white/[0.08] pt-2">
                                  <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.12em] text-[#5BE9FF]/70">
                                    Fuentes verificadas · {msg.sources.length}
                                  </p>
                                  <ul className="mt-1 space-y-0.5">
                                    {msg.sources.map((s) => (
                                      <li key={s}>
                                        <a
                                          href={s}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="[font-family:var(--font-fira-mono)] text-[11px] break-all text-white/50 underline-offset-2 hover:text-[#5BE9FF] hover:underline"
                                        >
                                          {s}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {msg.truncated && (
                                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-[#F5A524]/30 bg-[#F5A524]/[0.07] px-3 py-2">
                                  <span className="[font-family:var(--font-fira-mono)] text-[11px] text-[#F5A524]">
                                    Respuesta cortada por límite de tokens.
                                  </span>
                                  <button
                                    type="button"
                                    onClick={handleContinue}
                                    disabled={isProcessing}
                                    className="rounded-md border border-[#F5A524]/40 px-2 py-0.5 [font-family:var(--font-fira-mono)] text-[11px] text-[#F5A524] transition-colors hover:bg-[#F5A524]/15 disabled:opacity-50"
                                  >
                                    Continuar
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                    ),
                  )}
                </AnimatePresence>
                {isProcessing && <ShifterThinkingRow reducedMotion={reducedMotion} />}
                <div ref={bottomRef} />
              </>
            ) : (
              <div className="space-y-5">
                <LabTerminalFrame title="openclaw:status">
                  <div className="grid gap-4 p-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.12em] text-white/40">Daemon</p>
                      <LabStatusPill status={system.running ? "RUNNING" : "DOWN"} color={system.running ? "#00FF88" : "#ef4444"} />
                    </div>
                    <div className="space-y-1">
                      <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.12em] text-white/40">Modelo activo</p>
                      <div className="flex items-center gap-2 text-white">
                        <Cpu size={14} className="text-[#F540FF]" />
                        <span className="[font-family:var(--font-figtree)] text-[14px] font-semibold">{system.model || selectedModel.name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.12em] text-white/40">Plugins</p>
                      <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/70">{system.plugins?.join(", ") || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="[font-family:var(--font-fira-mono)] text-[10px] uppercase tracking-[0.12em] text-white/40">ICM last update</p>
                      <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/70">{formatDate(memory.lastUpdated)} {formatTime(memory.lastUpdated)}</p>
                    </div>
                  </div>
                </LabTerminalFrame>

                <LabTerminalFrame title="icm:recent_changes">
                  <div className="p-2">
                    {recentFiles.length === 0 ? (
                      <p className="p-3 [font-family:var(--font-fira-mono)] text-[12px] text-white/40">Sin cambios recientes.</p>
                    ) : (
                      <ul className="divide-y divide-white/[0.06]">
                        {recentFiles.map((file) => (
                          <li key={file.id} className="flex items-start gap-3 p-3">
                            <FileText size={14} className="mt-0.5 shrink-0 text-white/30" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate [font-family:var(--font-fira-mono)] text-[12px] text-white/90">{file.relativePath}</p>
                              <p className="[font-family:var(--font-fira-mono)] text-[10px] text-white/40">{formatDate(file.modifiedAt)} · {(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </LabTerminalFrame>

                <LabTerminalFrame title="openclaw:log_tail">
                  <div className="max-h-64 overflow-auto p-3">
                    {system.lastLogs.length === 0 ? (
                      <p className="[font-family:var(--font-fira-mono)] text-[12px] text-white/40">No logs available.</p>
                    ) : (
                      <div className="space-y-1">
                        {system.lastLogs.map((log, i) => (
                          <p key={i} className="[font-family:var(--font-fira-mono)] text-[11px] leading-[1.6] text-white/60">
                            <span className="text-[#8B92B5]">&gt;</span> {log}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </LabTerminalFrame>
              </div>
            )}
          </div>
        </div>

        {!devMode && (
          <div className="border-t border-white/[0.08] bg-[#0A0E27]/80 px-4 py-3 backdrop-blur-md md:px-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="mx-auto flex max-w-3xl items-center gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribir directiva o pegar URL..."
                  disabled={isProcessing}
                  className="h-12 w-full rounded-xl border border-white/[0.08] bg-[#141A36]/60 pl-4 pr-4 [font-family:var(--font-fira-mono)] text-[13px] text-white placeholder-white/30 focus:border-[#F540FF]/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F540FF]/30 disabled:opacity-60"
                />
              </div>
              <button
                type="button"
                onClick={() => setResearch((v) => !v)}
                aria-pressed={research}
                title={
                  research
                    ? "Modo investigación ACTIVO: recupera fuentes reales antes de responder (tarda más)"
                    : "Modo investigación: recupera fuentes reales para que pueda citar enlaces verificables"
                }
                className={`flex h-12 shrink-0 items-center gap-2 rounded-xl border px-3 [font-family:var(--font-fira-mono)] text-[11px] uppercase tracking-[0.1em] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                  research
                    ? "border-[#5BE9FF]/50 bg-[#5BE9FF]/15 text-[#5BE9FF]"
                    : "border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70"
                }`}
              >
                <Telescope size={16} />
                <span className="hidden sm:inline">Investigar</span>
              </button>
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                aria-label="Enviar mensaje"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F540FF] text-white shadow-[0_0_20px_-6px_rgba(245,64,255,0.5)] transition-all hover:bg-[#ff5fff] hover:shadow-[0_0_28px_-6px_rgba(245,64,255,0.6)] disabled:bg-white/10 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="mx-auto mt-2 max-w-3xl text-center [font-family:var(--font-fira-mono)] text-[10px] text-white/25">
              {research
                ? "MODO INVESTIGACIÓN · RECUPERA FUENTES REALES ANTES DE ESCRIBIR · TARDA MÁS"
                : "CONECTADO A CEREBRO · AGENTE SHIFTAI · SIN ENLACES (ACTIVÁ INVESTIGAR PARA CITAS)"}
            </p>
          </div>
        )}
      </div>
      {/* Right panel: Signals + Toolkit */}
      <div className="hidden w-80 min-h-0 border-l border-white/[0.08] bg-[#0A0E27]/60 xl:flex xl:flex-col">
        {/* ── Señales ── */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Scan Status */}
          <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[#00FF88]">
                <RefreshCw size={13} />
                <span className="[font-family:var(--font-figtree)] text-[10px] font-semibold uppercase tracking-[0.1em]">Último Scan</span>
              </div>
              <span className="[font-family:var(--font-fira-mono)] text-[9px] text-white/30">
                {status.scan.lastScanAt ? new Date(status.scan.lastScanAt).toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" }) : "—"}
              </span>
            </div>
            <div className="flex gap-3">
              <div>
                <p className="[font-family:var(--font-fira-mono)] text-[18px] text-white leading-none">{status.scan.newArticles}</p>
                <p className="[font-family:var(--font-fira-mono)] text-[9px] text-white/40 mt-0.5">artículos</p>
              </div>
              <div>
                <p className="[font-family:var(--font-fira-mono)] text-[18px] text-white leading-none">{status.scan.deepDives}</p>
                <p className="[font-family:var(--font-fira-mono)] text-[9px] text-white/40 mt-0.5">deep dives</p>
              </div>
            </div>
          </div>

          {/* Column Candidates */}
          {status.columns.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 [font-family:var(--font-figtree)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#F540FF]">
                Columnas incubando
              </p>
              <div className="space-y-2">
                {status.columns.map((col, i) => (
                  <button
                    key={i}
                    onClick={() => runAction("deep-dive", col.title)}
                    disabled={!!actionLoading}
                    className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 text-left transition-colors hover:border-[#F540FF]/30 hover:bg-[#F540FF]/[0.04] focus:outline-none"
                  >
                    <p className="[font-family:var(--font-figtree)] text-[11px] font-medium text-white/90 leading-snug line-clamp-2">
                      {col.title}
                    </p>
                    <p className="mt-1 [font-family:var(--font-fira-mono)] text-[9px] text-white/30 uppercase">
                      {col.status}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Insights from DB */}
          {insights.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="[font-family:var(--font-figtree)] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5BE9FF]">
                  Ideas firmes
                </p>
                <span className="[font-family:var(--font-fira-mono)] text-[9px] text-white/40">
                  {insights.filter((i) => i.status === "validated").length} validadas · {insights.filter((i) => i.status === "emerging").length} incubando
                </span>
              </div>
              <div className="space-y-1.5">
                {insights.map((insight) => (
                  <button
                    key={insight.id}
                    onClick={() => runAction("deep-dive", insight.title)}
                    disabled={!!actionLoading}
                    className="flex w-full items-start justify-between gap-2 rounded-lg border border-white/[0.04] bg-white/[0.01] px-2.5 py-2 text-left transition-colors hover:border-[#5BE9FF]/20 hover:bg-[#5BE9FF]/[0.03] focus:outline-none"
                  >
                    <p className="[font-family:var(--font-figtree)] text-[11px] text-white/80 leading-snug line-clamp-2">
                      {insight.title}
                    </p>
                    <span
                      className={`shrink-0 rounded border px-1 [font-family:var(--font-fira-mono)] text-[9px] uppercase ${
                        insight.confidence === "high"
                          ? "border-[#00FF88]/30 text-[#00FF88] bg-[#00FF88]/8"
                          : insight.confidence === "medium"
                          ? "border-[#5BE9FF]/30 text-[#5BE9FF] bg-[#5BE9FF]/8"
                          : "border-white/20 text-white/50"
                      }`}
                    >
                      {insight.confidence}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cost */}
          <div className="flex items-center justify-between rounded-lg border border-white/[0.04] bg-white/[0.01] px-2.5 py-2">
            <span className="[font-family:var(--font-figtree)] text-[10px] text-white/40">Costo hoy</span>
            <span className="[font-family:var(--font-fira-mono)] text-[11px] text-white/60">${status.costToday.toFixed(4)}</span>
          </div>
        </div>

        {/* ── Toolkit ── */}
        <div className="border-t border-white/[0.08] p-4">
          <p className="mb-2.5 [font-family:var(--font-figtree)] text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">
            Toolkit
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              icon={<RefreshCw size={14} />}
              label="Scan"
              color="#00FF88"
              loading={actionLoading === "scan"}
              onClick={() => runAction("scan")}
            />
            <ActionButton
              icon={<Brain size={14} />}
              label="Think"
              color="#F540FF"
              loading={actionLoading === "think"}
              onClick={() => runAction("think")}
            />
            <ActionButton
              icon={<Telescope size={14} />}
              label="Deep Dive"
              color="#5BE9FF"
              loading={actionLoading === "deep-dive"}
              onClick={() => {
                const topic = prompt("¿Sobre qué tema?");
                if (topic) runAction("deep-dive", topic);
              }}
            />
            <ActionButton
              icon={<Newspaper size={14} />}
              label="Columna"
              color="#FFD700"
              loading={actionLoading === "column"}
              onClick={() => runAction("column")}
            />
          </div>
          {actionMessage && (
            <p className="mt-2 [font-family:var(--font-fira-mono)] text-[10px] text-white/50 animate-in fade-in">
              {actionMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  color,
  loading,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex flex-col items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-2.5 transition-all hover:bg-white/[0.04] focus:outline-none disabled:opacity-40"
    >
      <span style={{ color }} className={loading ? "animate-spin" : ""}>
        {loading ? <RefreshCw size={14} /> : icon}
      </span>
      <span className="[font-family:var(--font-figtree)] text-[10px] font-medium text-white/70">
        {label}
      </span>
    </button>
  );
}
