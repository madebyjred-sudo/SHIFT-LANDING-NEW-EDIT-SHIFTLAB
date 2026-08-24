"use client";

import * as React from "react";
import ShiftMark from "@/components/common/ShiftMark";
import AgentMessages from "@/components/agent/AgentMessages";
import AgentComposer from "@/components/agent/AgentComposer";
import {
  INITIAL_GREETING,
  nextId,
  runAgentTurn,
  type ChatMessage,
} from "@/components/agent/agent-engine";
import type {
  AgentState,
  Message,
  ThinkingStep,
  Citation,
} from "@/components/agent/agent-types";

/**
 * ContactGateway — Shifty embebido como puerta de entrada en /contact.
 *
 * Reusa el MISMO motor (`runAgentTurn` → /api/agent → Cerebro) y los
 * componentes `AgentMessages` / `AgentComposer` del island flotante, pero
 * vive inline en un panel grande (no flota, no se colapsa). Orquestación
 * propia para no acoplar al `ShiftAgent` global ni arriesgar el flotante.
 */

const SURFACE_BG = "rgba(11, 11, 18, 0.97)";

export default function ContactGateway() {
  const [state, setState] = React.useState<AgentState>({
    open: true,
    voice: false,
    status: "idle",
    statusLabel: "",
    messages: [{ ...INITIAL_GREETING, ts: Date.now() }],
  });
  const [input, setInput] = React.useState("");

  // Session ID — separado del island flotante (prefijo gw_) pero misma
  // mecánica: agrupa el turno del visitante para attach a HubSpot CRM.
  const sessionIdRef = React.useRef<string>("");
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const KEY = "shifty-gateway-session-id";
    let id = sessionStorage.getItem(KEY);
    if (!id) {
      id = `gw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(KEY, id);
    }
    sessionIdRef.current = id;
  }, []);

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
    (
      id: string,
      patch: (
        m: Extract<Message, { role: "agent" }>,
      ) => Partial<Extract<Message, { role: "agent" }>>,
    ) => {
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
        const pageOrigin =
          typeof window !== "undefined" ? window.location.href : undefined;
        for await (const evt of runAgentTurn(
          turnMessages,
          text,
          sessionIdRef.current,
          pageOrigin,
        )) {
          switch (evt.type) {
            case "thinking-start": {
              const steps: ThinkingStep[] = evt.steps;
              updateAgentMessage(agentId, () => ({ thinking: steps, revealedSteps: [] }));
              const first = steps[0];
              setStatus(
                first?.kind === "tool" ? "tool" : "thinking",
                first?.label?.toLowerCase() ?? "pensando…",
              );
              break;
            }
            case "step-reveal": {
              updateAgentMessage(agentId, (m) => ({
                revealedSteps: [...(m.revealedSteps ?? []), evt.stepId],
              }));
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
            "Ups, tuve un problema técnico. Probá de nuevo o escribinos a holahola@shiftpn.com.",
        }));
        setStatus("idle", "");
        void err;
      }
    },
    [state.status, state.messages, startAgentMessage, updateAgentMessage, setStatus],
  );

  const handleFeedback = React.useCallback(
    (messageId: string, rating: 1 | -1, reason?: string) => {
      updateAgentMessage(messageId, () => ({ feedback: rating, feedbackReason: reason }));
      const msg = state.messages.find((m) => m.id === messageId);
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
      }).catch(() => {});
    },
    [state.messages, updateAgentMessage],
  );

  const busy =
    state.status === "thinking" ||
    state.status === "tool" ||
    state.status === "writing";

  return (
    <div
      className="relative flex w-full flex-col overflow-hidden rounded-[26px] border border-white/10"
      style={{
        background: SURFACE_BG,
        height: "min(620px, 78vh)",
        boxShadow:
          "0 40px 90px -30px rgba(5,8,30,0.7), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-3.5">
        <span className="relative inline-flex h-8 w-8 items-center justify-center">
          <span
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(245,64,255,0.45), transparent 75%)",
            }}
          />
          <ShiftMark size={26} className="relative" />
        </span>
        <div className="min-w-0">
          <p
            className="text-[13px] font-medium leading-none text-white"
            style={{ fontFamily: "var(--font-figtree)" }}
          >
            Shifty
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[11px] leading-none text-white/55">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#36E27A]" />
            {busy ? state.statusLabel || "trabajando…" : "en línea · te responde ahora"}
          </p>
        </div>
      </div>

      {/* Conversación — reusa el mismo render del island */}
      <AgentMessages
        messages={state.messages as Message[]}
        onQuickChip={(t) => send(t)}
        onFeedback={handleFeedback}
      />

      <AgentComposer
        value={input}
        onChange={setInput}
        onSend={() => send(input)}
        busy={busy}
        voice={false}
        onToggleVoice={() => {}}
        hideVoice
      />
    </div>
  );
}
