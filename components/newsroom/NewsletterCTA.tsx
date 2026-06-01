"use client";

import { useState } from "react";

export default function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setEmail("");
    }, 3000);
  };

  return (
    <section className="mt-20">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#111A31] to-[#0E1745] p-8 md:p-12 lg:p-16">
        {/* Subtle glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1534DC] opacity-[0.08] blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#F540FF] opacity-[0.05] blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white [font-family:var(--font-figtree)] mb-3 tracking-tight">
            Shift <span className="text-[#F540FF]">Newsroom</span>
          </h3>
          <p className="text-[#A0ABC0] [font-family:var(--font-fira-sans)] text-sm md:text-base leading-relaxed mb-8">
            Recibe insights estratégicos, análisis de mercado y las últimas noticias de Shift Latam directamente en tu inbox.
          </p>

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-green-400 [font-family:var(--font-figtree)] font-bold text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              ¡Gracias por suscribirte!
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="flex-1 px-5 py-3.5 rounded-full bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm [font-family:var(--font-fira-sans)] focus:outline-none focus:border-[#1534DC] focus:ring-2 focus:ring-[#1534DC]/30 transition-all"
              />
              <button
                type="submit"
                className="px-7 py-3.5 rounded-full bg-[#1534DC] hover:bg-[#1534DC]/90 text-white text-sm font-bold [font-family:var(--font-figtree)] transition-colors duration-200 whitespace-nowrap"
              >
                Suscribirme
              </button>
            </form>
          )}

          <p className="text-white/25 text-[11px] [font-family:var(--font-fira-sans)] mt-4">
            Sin spam. Puedes darte de baja en cualquier momento.
          </p>
        </div>
      </div>
    </section>
  );
}
