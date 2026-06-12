"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, CheckCircle2 } from "lucide-react";

interface Message {
  id: string;
  role: "shifter" | "oscar";
  content: string;
  status?: "queueing" | "queued" | "error" | "done";
}

export default function ShifterChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "shifter",
      content:
        "Canal de directivas abierto. Lo que escribas acá se encola en mi cola de curiosidades — lo proceso en mi próximo ciclo de research, no en tiempo real. Soy un agente, no un chatbot. Pasame una pista, una URL, o una pregunta que quieras que investigue.",
      status: "done",
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  // Cargar las creencias reales del SOUL del agente como contexto.
  useEffect(() => {
    fetch("/api/shifter/state", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { soul?: string | null }) => {
        if (!j.soul) return;
        const block = j.soul.match(/## Current Beliefs[\s\S]*?(?=\n## |$)/i)?.[0];
        if (!block) return;
        const beliefs = block
          .split("\n")
          .filter((l) => /^\d+\.\s/.test(l.trim()))
          .map((l) => l.replace(/^\d+\.\s*/, "").replace(/\*\*/g, ""))
          .slice(0, 5);
        if (beliefs.length) {
          setMessages((prev) => [
            ...prev,
            {
              id: "soul",
              role: "shifter",
              content:
                "Mis creencias actuales (sujetas a cambio según la data):\n\n" +
                beliefs.map((b) => `· ${b}`).join("\n"),
              status: "done",
            },
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const directive = input.trim();
    const userMsg: Message = { id: Date.now().toString(), role: "oscar", content: directive };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    const statusId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: statusId, role: "shifter", content: "", status: "queueing" }]);

    try {
      const res = await fetch("/api/shifter/directive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: directive, priority: "high" }),
      });
      const j = (await res.json()) as { ok: boolean; message?: string; error?: string };
      setMessages((prev) =>
        prev.map((m) =>
          m.id === statusId
            ? {
                ...m,
                status: j.ok ? "queued" : "error",
                content: j.ok
                  ? j.message ?? "Directiva encolada."
                  : `No pude encolar: ${j.error ?? "error"}. ${
                      j.error?.includes("offline")
                        ? "(El agente solo está online en producción.)"
                        : ""
                    }`,
              }
            : m,
        ),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === statusId ? { ...m, status: "error", content: "Error de red." } : m,
        ),
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050814] max-w-5xl mx-auto border-x border-white/5">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 max-w-[80%] ${msg.role === "oscar" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div
              className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border ${
                msg.role === "shifter"
                  ? "bg-white/5 border-green-500/30 text-green-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
              }`}
            >
              {msg.role === "shifter" ? <Bot size={20} /> : <User size={20} />}
            </div>

            <div className={`flex flex-col ${msg.role === "oscar" ? "items-end" : "items-start"}`}>
              <span className="text-xs font-mono text-white/30 mb-1">
                {msg.role === "shifter" ? "SHIFTER DAEMON" : "OSCAR (VP)"}
              </span>

              <div
                className={`px-5 py-3 rounded-2xl ${
                  msg.role === "shifter"
                    ? "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                    : "bg-blue-600/20 border border-blue-500/20 text-white rounded-tr-none"
                }`}
              >
                {msg.status === "queueing" ? (
                  <div className="flex items-center gap-3 text-green-400 font-mono text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Encolando directiva en pending-queries…</span>
                  </div>
                ) : msg.status === "queued" ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-400 shrink-0" />
                    <p className="font-sans whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                ) : (
                  <p
                    className={`font-sans whitespace-pre-wrap leading-relaxed ${
                      msg.status === "error" ? "text-amber-300" : ""
                    }`}
                  >
                    {msg.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-6 border-t border-white/5 bg-[#050814]/80 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pegar URL o encolar directiva de research…"
            className="w-full bg-white/5 border border-white/10 rounded-full pl-6 pr-14 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-sans transition-all"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-2 top-2 bottom-2 w-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center font-mono text-[10px] text-white/20 mt-3">
          DIRECTIVE QUEUE • pending-queries.md • PROCESADO EN PRÓXIMO HEARTBEAT
        </p>
      </div>
    </div>
  );
}
