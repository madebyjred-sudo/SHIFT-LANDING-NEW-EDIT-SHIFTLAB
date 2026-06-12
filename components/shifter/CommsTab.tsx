"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, ArrowRight, Terminal, Activity, Cpu, Database, Radio, FileText, X, Zap, Brain, Telescope, Newspaper, Clock, TrendingUp, RefreshCw, Lightbulb } from "lucide-react";
import { LabTerminalFrame, LabCursor, LabSectionLabel, LabStatusPill } from "@/components/ui/lab-primitives";
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
}: {
  selectedModel: ModelOption;
  system: OpenClawStatus;
  memory: ShifterMemory;
  status: ShifterStatus;
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
  const [reducedMotion, setReducedMotion] = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [userName, setUserName] = useState<string>("TÚ");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [insights, setInsights] = useState<{ id: number; title: string; confidence: string; status: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    fetch("/api/shifter/memory?type=insights")
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
  }, [actionLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, isProcessing, reducedMotion]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isProcessing) return;

    const now = new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { id: Date.now().toString(), role: "oscar", content: trimmed, timestamp: now };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/shifter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          modelId: selectedModel.id,
          traceLabel: "shifter-ai-dashboard",
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
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "shifter",
            content: data.text || "Sin respuesta",
            timestamp: new Date().toLocaleTimeString("es-CR", { hour12: false, hour: "2-digit", minute: "2-digit" }),
            model: data.model,
            latencyMs: data.latencyMs,
            status: "done",
          },
        ]);
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

  const runAction = async (action: string, topic?: string) => {
    setActionLoading(action);
    setActionMessage(null);
    try {
      const res = await fetch("/api/shifter/actions", {
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
    <div className="flex h-full flex-col lg:flex-row">
      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-3">
          <LabSectionLabel index="04" name="Comms" />
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

        <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6" aria-live="polite" aria-atomic="false">
          <div className="mx-auto max-w-3xl space-y-5">
            {!devMode ? (
              <>
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
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
                            {msg.role === "shifter" ? "SHIFTER" : userName}
                          </span>
                          <span className="[font-family:var(--font-fira-mono)] text-[10px] text-white/30">{msg.timestamp}</span>
                          {msg.model && (
                            <span className="rounded bg-white/[0.05] px-1 py-0.5 [font-family:var(--font-fira-mono)] text-[9px] text-white/30">
                              {msg.model.split("/").pop()}
                            </span>
                          )}
                        </div>

                        <div
                          className={`rounded-2xl border px-4 py-3 ${
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
                          ) : (
                            <ChatMarkdown text={msg.content} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
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
                type="submit"
                disabled={!input.trim() || isProcessing}
                aria-label="Enviar mensaje"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F540FF] text-white shadow-[0_0_20px_-6px_rgba(245,64,255,0.5)] transition-all hover:bg-[#ff5fff] hover:shadow-[0_0_28px_-6px_rgba(245,64,255,0.6)] disabled:bg-white/10 disabled:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <Send size={18} />
              </button>
            </form>
            <p className="mx-auto mt-2 max-w-3xl text-center [font-family:var(--font-fira-mono)] text-[10px] text-white/25">
              CONECTADO A CEREBRO · AGENTE SHIFTAI
            </p>
          </div>
        )}
      </div>
      {/* Right panel: Signals + Toolkit */}
      <div className="hidden w-80 border-l border-white/[0.08] bg-[#0A0E27]/60 xl:flex xl:flex-col">
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
