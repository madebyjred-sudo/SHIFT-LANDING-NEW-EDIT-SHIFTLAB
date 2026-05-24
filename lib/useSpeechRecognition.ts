"use client";

import { useEffect, useRef } from "react";

// ────────────────────────────────────────────────────────────────────
// Web Speech API — tipos mínimos
// ────────────────────────────────────────────────────────────────────
// TypeScript no incluye `SpeechRecognition` por default (vive en el
// experimental DOM types). Declaramos el subset que usamos para evitar
// tocar tsconfig solo por esto.

type SpeechRecognitionResultLite = ArrayLike<{ transcript: string }>;

type SpeechRecognitionEventLite = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLite>;
};

type SpeechRecognitionErrorEventLite = { error: string };

type SpeechRecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: SpeechRecognitionEventLite) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEventLite) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

// ────────────────────────────────────────────────────────────────────
// Hook
// ────────────────────────────────────────────────────────────────────

type UseSpeechProps = {
  /** Si true, arranca el listening. Si false, lo detiene. */
  active: boolean;
  /** Default `es-419` (español latam). */
  lang?: string;
  /**
   * Texto que YA estaba en el input cuando voice se activó. Los nuevos
   * chunks transcribidos se agregan al final (con space separator).
   * Si está vacío, la transcripción reemplaza desde cero.
   */
  initialBase: string;
  /** Cada vez que cambia la transcripción (interim o final). */
  onTranscript: (text: string) => void;
  /**
   * Eventos: 'not-supported' | 'not-allowed' | 'service-not-allowed' |
   * 'no-speech' | 'audio-capture' | 'network' | 'aborted' | 'unknown'.
   */
  onError?: (error: string) => void;
};

export function useSpeechRecognition({
  active,
  lang = "es-419",
  initialBase,
  onTranscript,
  onError,
}: UseSpeechProps) {
  // Refs para que los callbacks no fuercen restart del recognition cada
  // vez que el padre re-renderea.
  const onTranscriptRef = useRef(onTranscript);
  const onErrorRef = useRef(onError);
  const initialBaseRef = useRef(initialBase);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    initialBaseRef.current = initialBase;
  }, [initialBase]);

  useEffect(() => {
    if (!active) return;
    if (typeof window === "undefined") return;

    const w = window as unknown as {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) {
      onErrorRef.current?.("not-supported");
      return;
    }

    let stopped = false;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (e) => {
      // Concatenar todos los chunks (interim + final) de la sesión actual.
      let transcript = "";
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result && result[0]) {
          transcript += result[0].transcript;
        }
      }
      transcript = transcript.trim();

      const base = initialBaseRef.current;
      let combined: string;
      if (!base) {
        combined = transcript;
      } else if (base.endsWith(" ") || base.endsWith("\n") || !transcript) {
        combined = base + transcript;
      } else {
        combined = base + " " + transcript;
      }
      onTranscriptRef.current(combined);
    };

    recognition.onerror = (e) => {
      onErrorRef.current?.(e.error || "unknown");
    };

    recognition.onend = () => {
      // Chrome cierra la sesión después de ~silencio largo. Si seguimos
      // activos, restart para mantener el listening continuo.
      if (!stopped) {
        try {
          recognition.start();
        } catch {
          // Puede fallar si ya está stopped — idempotente.
        }
      }
    };

    try {
      recognition.start();
    } catch (e) {
      onErrorRef.current?.(String(e));
    }

    return () => {
      stopped = true;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // ya stopped
      }
    };
  }, [active, lang]);
}
