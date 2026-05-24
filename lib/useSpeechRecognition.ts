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

    let cancelled = false;
    let stopped = false;
    let recognition: SpeechRecognitionInstance | null = null;

    const init = async () => {
      // ── Step 1: solicitar permiso explícitamente via getUserMedia ──
      // SpeechRecognition.start() también solicita permiso pero en algunos
      // browsers (especialmente Chrome con permission previa denied) no
      // muestra el prompt — falla directo con `not-allowed`. getUserMedia
      // siempre dispara el prompt nativo si está undetermined.
      if (!navigator?.mediaDevices?.getUserMedia) {
        onErrorRef.current?.("not-supported");
        return;
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (err) {
        if (cancelled) return;
        const e = err as { name?: string };
        const name = e?.name || "";
        if (
          name === "NotAllowedError" ||
          name === "PermissionDeniedError" ||
          name === "SecurityError"
        ) {
          onErrorRef.current?.("not-allowed");
        } else if (name === "NotFoundError" || name === "OverconstrainedError") {
          onErrorRef.current?.("no-device");
        } else {
          onErrorRef.current?.("audio-capture");
        }
        return;
      }

      // No necesitamos el stream — solo era para forzar el prompt. Lo
      // cerramos inmediatamente. SpeechRecognition abrirá su propio
      // pipeline interno.
      stream.getTracks().forEach((t) => t.stop());

      if (cancelled) return;

      // ── Step 2: instanciar SpeechRecognition ──
      const w = window as unknown as {
        SpeechRecognition?: SpeechRecognitionCtor;
        webkitSpeechRecognition?: SpeechRecognitionCtor;
      };
      const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!SR) {
        onErrorRef.current?.("not-supported");
        return;
      }

      recognition = new SR();
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
        if (!stopped && recognition) {
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
    };

    init();

    return () => {
      cancelled = true;
      stopped = true;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try {
          recognition.stop();
        } catch {
          // ya stopped
        }
      }
    };
  }, [active, lang]);
}
