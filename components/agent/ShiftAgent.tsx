"use client";

import * as React from "react";
import type { AgentState, Message, ThinkingStep, Citation } from "./agent-types";
import { INITIAL_GREETING, nextId, runAgentTurn, type ChatMessage } from "./agent-engine";
import AgentIsland from "./AgentIsland";

/**
 * ShiftAgent — orchestrator.
 *
 * Mantiene state (open / voice / status / messages) y conduce el turno
 * via runMockTurn. La UI siempre es UN solo elemento: `<AgentIsland>`,
 * que se morphea entre colapsado (pill abajo-centro con status) y
 * expandido (conversación completa).
 *
 * Cuando swappes el motor real, sólo reescribís runMockTurn — la UI
 * consume eventos `TurnEvent` sin cambios.
 */
export default function ShiftAgent() {
  const [state, setState] = React.useState<AgentState>({
    open: false,
    voice: false,
    status: "idle",
    statusLabel: "",
    messages: [{ ...INITIAL_GREETING, ts: Date.now() }],
  });
  const [input, setInput] = React.useState("");
  const [csatOpen, setCsatOpen] = React.useState(false);

  // Session ID — UUID persistido en sessionStorage. Agrupa todos los
  // turnos del visitor en una conversación coherente del lado server,
  // permitiendo attach transcript completo a HubSpot CRM. Sobrevive
  // refresh de page mientras la tab esté abierta. Nueva tab = nueva
  // session = nuevo lead potencial.
  const sessionIdRef = React.useRef<string>("");
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = "shifty-session-id";
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, id);
    }
    sessionIdRef.current = id;
  }, []);

  // ESC cierra cuando el island está expandido.
  React.useEffect(() => {
    if (!state.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setState((s) => ({ ...s, open: false }));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open]);

  const setStatus = React.useCallback(
    (status: AgentState["status"], statusLabel: string) =>
      setState((s) => ({ ...s, status, statusLabel })),
    [],
  );

  const startAgentMessage = React.useCallback((id: string) => {
    const msg: Message = {
      id,
      role: "agent",
      content: "",
      streaming: true,
      thinking: [],
      revealedSteps: [],
      ts: Date.now(),
    };
    setState((s) => ({ ...s, messages: [...s.messages, msg] }));
  }, []);

  const updateAgentMessage = React.useCallback(
    (id: string, patch: (m: Extract<Message, { role: "agent" }>) => Partial<Extract<Message, { role: "agent" }>>) => {
      setState((s) => ({
        ...s,
        messages: s.messages.map((m) =>
          m.id === id && m.role === "agent" ? { ...m, ...patch(m) } : m,
        ),
      }));
    },
    [],
  );

  const send = React.useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;
      if (
        state.status === "thinking" ||
        state.status === "tool" ||
        state.status === "writing"
      )
        return;

      const userMsg: Message = {
        id: nextId("u"),
        role: "user",
        content: text,
        ts: Date.now(),
      };
      // Build the OAI-style history that the backend expects. The greeting
      // is a synthetic agent message — we drop it so the model doesn't see
      // its own intro as part of the conversation context.
      const history: ChatMessage[] = state.messages
        .filter((m) => m.id !== "agent-greeting")
        .map((m) =>
          m.role === "user"
            ? { role: "user" as const, content: m.content }
            : { role: "assistant" as const, content: m.content },
        );
      const turnMessages: ChatMessage[] = [...history, { role: "user", content: text }];

      setState((s) => ({ ...s, messages: [...s.messages, userMsg] }));
      setInput("");

      const agentId = nextId("a");
      startAgentMessage(agentId);
      setStatus("thinking", "pensando…");

      try {
        const pageOrigin = typeof window !== "undefined" ? window.location.href : undefined;
        for await (const evt of runAgentTurn(turnMessages, text, sessionIdRef.current, pageOrigin)) {
          switch (evt.type) {
            case "thinking-start": {
              const steps: ThinkingStep[] = evt.steps;
              updateAgentMessage(agentId, () => ({ thinking: steps, revealedSteps: [] }));
              const first = steps[0];
              setStatus(first?.kind === "tool" ? "tool" : "thinking", first?.label?.toLowerCase() ?? "pensando…");
              break;
            }
            case "step-reveal": {
              updateAgentMessage(agentId, (m) => ({
                revealedSteps: [...(m.revealedSteps ?? []), evt.stepId],
              }));
              setState((s) => {
                const cur = s.messages.find((m) => m.id === agentId);
                if (!cur || cur.role !== "agent" || !cur.thinking) return s;
                const idx = cur.thinking.findIndex((t) => t.id === evt.stepId);
                const next = cur.thinking[idx + 1];
                if (!next) return s;
                return {
                  ...s,
                  status: next.kind === "tool" ? "tool" : "thinking",
                  statusLabel: next.label.toLowerCase(),
                };
              });
              break;
            }
            case "writing-start":
              setStatus("writing", "escribiendo…");
              break;
            case "chunk":
              updateAgentMessage(agentId, (m) => ({ content: m.content + evt.text }));
              break;
            case "citations": {
              const citations: Citation[] = evt.citations;
              updateAgentMessage(agentId, () => ({ citations }));
              break;
            }
            case "suggestions":
              updateAgentMessage(agentId, () => ({ suggestions: evt.suggestions }));
              break;
            case "done":
              updateAgentMessage(agentId, () => ({ streaming: false }));
              setStatus("done", "");
              window.setTimeout(() => setStatus("idle", ""), 600);
              break;
          }
        }
      } catch (err) {
        updateAgentMessage(agentId, () => ({
          streaming: false,
          content:
            "Ups, tuve un problema técnico. Probá de nuevo o escribinos a hola@shiftpn.com.",
        }));
        setStatus("idle", "");
        void err;
      }
    },
    [state.status, state.messages, startAgentMessage, updateAgentMessage, setStatus],
  );

  const handleClear = React.useCallback(() => {
    // If there was an actual conversation (more than just the greeting),
    // ask for CSAT before clearing.
    if (state.messages.length > 2) {
      setCsatOpen(true);
      return;
    }
    
    setState((s) => ({
      ...s,
      messages: [{ ...INITIAL_GREETING, ts: Date.now() }],
      status: "idle",
      statusLabel: "",
    }));
    setInput("");
  }, [state.messages.length]);

  const confirmClear = React.useCallback(async (score?: number) => {
    if (score) {
      try {
        await fetch("/api/agent/feedback/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sessionIdRef.current,
            csatScore: score,
            totalTurns: state.messages.length,
          }),
        });
      } catch (e) {
        console.warn("Failed to send CSAT", e);
      }
    }
    
    // Generar un nuevo sessionId tras limpiar el chat para separar
    // la nueva conversación de la anterior que ya fue evaluada.
    const newSessionId = `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("shifty-session-id", newSessionId);
    }
    sessionIdRef.current = newSessionId;

    setState((s) => ({
      ...s,
      messages: [{ ...INITIAL_GREETING, ts: Date.now() }],
      status: "idle",
      statusLabel: "",
    }));
    setInput("");
    setCsatOpen(false);
  }, [state.messages.length]);

  const handleFeedback = React.useCallback((messageId: string, rating: 1 | -1, reason?: string) => {
    updateAgentMessage(messageId, () => ({ feedback: rating, feedbackReason: reason }));
    
    const msg = state.messages.find(m => m.id === messageId);
    if (!msg || msg.role !== "agent") return;

    fetch("/api/agent/feedback/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: sessionIdRef.current,
        messageContent: msg.content,
        rating,
        reason,
      }),
    }).catch(console.error);
  }, [state.messages, updateAgentMessage]);

  const handleToggleVoice = React.useCallback(() => {
    setState((s) => ({ ...s, voice: !s.voice }));
  }, []);

  return (
    <>
      <AgentIsland
        state={state}
        open={state.open}
        onOpen={() => setState((s) => ({ ...s, open: true }))}
        onClose={() => setState((s) => ({ ...s, open: false }))}
        onToggleVoice={handleToggleVoice}
        onClear={handleClear}
        onSend={send}
        input={input}
        onInputChange={setInput}
        onFeedback={handleFeedback}
      />
      {csatOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[24px] bg-[#0E1745] p-6 shadow-2xl border border-white/10 text-center animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-medium text-white mb-2" style={{ fontFamily: "var(--font-figtree)" }}>¿Te fue útil esta conversación?</h3>
            <p className="text-sm text-white/60 mb-6">Tu opinión ayuda a Shifty a mejorar.</p>
            
            <div className="flex justify-center gap-2 mb-8">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => confirmClear(star)}
                  className="text-[#F540FF] hover:scale-110 transition-all focus:outline-none opacity-50 hover:opacity-100 flex items-center justify-center"
                  style={{ width: 44, height: 44 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" fill="currentColor"><path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/></svg>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => confirmClear()}
              className="text-xs text-white/40 hover:text-white underline underline-offset-2 transition-colors"
            >
              Omitir y limpiar chat
            </button>
          </div>
        </div>
      )}
    </>
  );
}
