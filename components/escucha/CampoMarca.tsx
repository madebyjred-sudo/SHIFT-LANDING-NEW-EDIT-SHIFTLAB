"use client";

import { useState } from "react";

/* Campo de marca de los formularios de reporte: por defecto pide el sitio web
 * (de ahí sacamos el nombre de la marca y su dominio); con un clic cambia a
 * escribir el nombre, para personas o marcas sin sitio. */

export type ModoMarca = "sitio" | "nombre";

export function useCampoMarca(inicial = "") {
  const [modo, setModo] = useState<ModoMarca>("sitio");
  const [valor, setValor] = useState(inicial);
  const valido = modo === "sitio" ? /^[^\s]+\.[a-z]{2,}/i.test(valor.trim().replace(/^https?:\/\//i, "")) : valor.trim().length >= 2;
  return {
    /** Prellena desde la URL o el panel: si parece dominio va como sitio; si no, como nombre. */
    prellenar: (t: string) => {
      const esSitio = /^[^\s]+\.[a-z]{2,}/i.test(t.trim().replace(/^https?:\/\//i, ""));
      setModo(esSitio ? "sitio" : "nombre");
      setValor(t.trim());
    },
    modo,
    valor,
    setValor,
    valido,
    alternar: () => {
      setModo((m) => (m === "sitio" ? "nombre" : "sitio"));
      setValor("");
    },
    /** Lo que viaja al servidor. */
    datos: () => (modo === "sitio" ? { sitio: valor.trim() } : { marca: valor.trim() }),
    etiqueta: modo === "sitio" ? "Sitio web de tu marca" : "Nombre de tu marca o tu nombre",
    placeholder: modo === "sitio" ? "tuempresa.com" : "Ej.: Dos Pinos o María Pérez",
    textoAlternar: modo === "sitio" ? "¿No tienes sitio web? Usa el nombre" : "Mejor usar el sitio web",
    inputProps: {
      value: valor,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setValor(e.target.value),
      placeholder: modo === "sitio" ? "tuempresa.com" : "Ej.: Dos Pinos o María Pérez",
      maxLength: modo === "sitio" ? 120 : 60,
      required: true,
      type: modo === "sitio" ? "text" : "text",
      inputMode: modo === "sitio" ? ("url" as const) : ("text" as const),
      autoCapitalize: modo === "sitio" ? "none" : "words",
      autoComplete: modo === "sitio" ? "url" : "organization",
      spellCheck: false,
    },
  };
}
