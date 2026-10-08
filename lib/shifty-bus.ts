/*
 * Canal único para abrir el asistente flotante desde cualquier parte
 * del sitio (por ejemplo, el "¿Alguna pregunta nueva?" del FAQ).
 *
 * Por qué un evento y no un contexto: `ShiftAgent` se monta una sola
 * vez en el layout raíz y maneja su propio estado. Un CustomEvent en
 * `window` deja que cualquier componente cliente pida "abrilo con este
 * mensaje" sin levantar un provider global ni acoplar el árbol.
 *
 * El panel se despliega en su sitio, sin pop-up ni modal encima.
 */

export const SHIFTY_OPEN_EVENT = "shifty:open";

export interface ShiftyOpenDetail {
  /** Texto con el que arranca la conversación. */
  message?: string;
  /** Pista de contexto (título del artículo, sección) para el agente. */
  context?: string;
}

/** Pide abrir el asistente. No-op en server. */
export function openShifty(detail: ShiftyOpenDetail = {}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<ShiftyOpenDetail>(SHIFTY_OPEN_EVENT, { detail }),
  );
}

/** Suscribe al pedido de apertura. Devuelve la función de limpieza. */
export function onShiftyOpen(
  handler: (detail: ShiftyOpenDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {};
  const listener = (e: Event) => {
    handler((e as CustomEvent<ShiftyOpenDetail>).detail || {});
  };
  window.addEventListener(SHIFTY_OPEN_EVENT, listener);
  return () => window.removeEventListener(SHIFTY_OPEN_EVENT, listener);
}
