"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  id: string;
  role: "shifter" | "oscar";
  content: string;
  status?: "analyzing" | "reading" | "done";
}

export default function ShifterChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "shifter",
      content: "Sistemas iniciados. Memoria base cargada. Estoy listo para procesar inputs, Oscar.",
      status: "done"
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg: Message = { id: Date.now().toString(), role: "oscar", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    // Simulate backend processing stages for that "Daemon" feel
    const statusMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: statusMsgId, role: "shifter", content: "", status: "analyzing" }]);

    setTimeout(() => {
      setMessages(prev => prev.map(m => m.id === statusMsgId ? { ...m, status: "reading" } : m));
      
      setTimeout(() => {
        setMessages(prev => prev.map(m => m.id === statusMsgId ? { ...m, status: "done", content: "He internalizado el contenido. Lo tendré en cuenta para mi próximo draft." } : m));
        setIsProcessing(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#050814] max-w-5xl mx-auto border-x border-white/5">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.role === "oscar" ? "ml-auto flex-row-reverse" : ""}`}>
            
            <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center border ${
              msg.role === "shifter" ? "bg-white/5 border-green-500/30 text-green-400" : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            }`}>
              {msg.role === "shifter" ? <Bot size={20} /> : <User size={20} />}
            </div>

            <div className={`flex flex-col ${msg.role === "oscar" ? "items-end" : "items-start"}`}>
              <span className="text-xs font-mono text-white/30 mb-1">
                {msg.role === "shifter" ? "SHIFTER DAEMON" : "OSCAR (VP)"}
              </span>
              
              <div className={`px-5 py-3 rounded-2xl ${
                msg.role === "shifter" 
                  ? "bg-white/5 border border-white/10 text-white/90 rounded-tl-none" 
                  : "bg-blue-600/20 border border-blue-500/20 text-white rounded-tr-none"
              }`}>
                {msg.status && msg.status !== "done" ? (
                  <div className="flex items-center gap-3 text-green-400 font-mono text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      {msg.status === "analyzing" && "Analizando URL / Input..."}
                      {msg.status === "reading" && "Extrayendo insights a Zep Graphiti..."}
                    </span>
                  </div>
                ) : (
                  <p className="font-sans whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/5 bg-[#050814]/80 backdrop-blur-md">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pegar URL o enviar directiva..."
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
          SECURE CHANNEL • ZEP MEMORY SYNC ACTIVE
        </p>
      </div>
    </div>
  );
}
