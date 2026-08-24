"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ContactGateway from "./ContactGateway";

/**
 * ContactGatewaySection — el "broche de oro" de /contact.
 *
 * Hero oscuro premium: a la izquierda un titular ROTATIVO que invita a
 * chatear; a la derecha, Shifty embebido como gateway (atiende en vivo).
 * El form de HubSpot vive debajo como alternativa "dejanos tus datos".
 */

const HEADLINES = [
  "¿Tenés un proyecto en mente?",
  "Hablemos de tu marca.",
  "Contanos qué te quita el sueño.",
  "¿Y si empezamos hoy?",
  "Preguntá lo que quieras.",
];

export default function ContactGatewaySection() {
  const reduce = useReducedMotion();
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(
      () => setIdx((i) => (i + 1) % HEADLINES.length),
      3600,
    );
    return () => window.clearInterval(t);
  }, [reduce]);

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 15% 0%, rgba(21,52,220,0.28) 0%, transparent 55%), radial-gradient(ellipse at 100% 100%, rgba(245,64,255,0.16) 0%, transparent 55%), #0a0a14",
      }}
    >
      <div className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-6 pt-28 pb-16 sm:px-10 md:gap-14 md:pt-36 md:pb-24 lg:grid-cols-[1fr_minmax(380px,460px)] lg:px-16">
        {/* Columna texto */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/70 [font-family:var(--font-figtree)]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#36E27A]" />
            Contacto
          </span>

          <h1 className="mt-6 min-h-[2.2em] text-4xl leading-[1.04] text-white sm:text-5xl lg:text-[58px] [font-family:Glitz] font-normal [font-style:normal]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={idx}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -14 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="block bg-gradient-to-r from-white via-white to-[#9FB4FF] bg-clip-text text-transparent"
              >
                {HEADLINES[idx]}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p className="mx-auto mt-6 max-w-[440px] text-[17px] leading-relaxed text-white/65 lg:mx-0 [font-family:var(--font-fira-sans)]">
            <strong className="font-semibold text-white">Shifty te atiende ahora.</strong>{" "}
            Preguntá por servicios, casos o equipo —o contanos tu proyecto y te
            conectamos con la persona correcta en menos de 24 horas.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-white/45 lg:justify-start [font-family:var(--font-figtree)]">
            <span>Respuesta inmediata</span>
            <span className="text-white/20">·</span>
            <span>10 países LATAM</span>
            <span className="text-white/20">·</span>
            <span>Sin compromiso</span>
          </div>
        </div>

        {/* Columna gateway */}
        <div className="mx-auto w-full max-w-[460px]">
          <ContactGateway />
        </div>
      </div>
    </section>
  );
}
