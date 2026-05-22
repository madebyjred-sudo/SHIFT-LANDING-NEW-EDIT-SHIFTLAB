// ----------------------------------------------------------------------
// Contact routing — país (hub) → email del General Manager
// ----------------------------------------------------------------------
// Tabla central donde se ruta cada solicitud del form de contacto.
// HubSpot guarda todos los leads en una sola DB; ESTO determina a
// quién le llega el email de notificación inmediata.
//
// Para cambiar el destinatario de un país, editá este archivo.
// Para agregar/sacar países, editá también `app/contact/hubs.ts`.
//
// (Históricamente teníamos México y Perú con fallback a la bandeja
// general porque no había GM público asignado. Ambos quedaron fuera
// del sitio — si vuelven a aparecer, restaurá GENERAL_INBOX como
// fallback.)

import type { HubOption } from "@/app/contact/hubs";

/**
 * Map de país → email destino. Mantener sincronizado con
 * `content/knowledge/about-shift-pn.compact.yaml` → `hubs_12_paises`.
 *
 * Fuente: General Managers / Senior VPs verificados públicamente.
 * Última verificación: 2026-05.
 */
export const HUB_EMAILS: Record<HubOption, string> = {
  "Costa Rica (Hub)": "gpiedra@shiftpn.co.cr",          // Gabriela Piedra (Sr VP Shift Latam)
  Guatemala: "andreagan@shiftpn.gt",                     // Andrea Gandara (GM Shift Guatemala)
  "El Salvador": "cferreiro@shiftpn.sv",                 // Camila Ferreiro (GM Shift El Salvador)
  Honduras: "maria.calvo@shift-pn.hn",                   // María Calvo
  Nicaragua: "rmontenegro@shiftpn.com.ni",               // Rosario Montenegro (GM Shift Nicaragua)
  Panamá: "jjaltmann@omgcr.com",                         // JJ Altmann
  Colombia: "gonzalo.pineros@shiftpn.co",                // Gonzalo Piñeros (GM Shift Colombia)
  Ecuador: "angelica.moreno@shiftpn.ec",                 // Angélica Moreno (GM Shift Ecuador)
  Venezuela: "holahola@shiftpn.com",                     // Valentina Rosas Godoy — pendiente email corp
  "República Dominicana": "andrea.ramirez@caribbeanpn.com", // Andrea Ramírez (GM Shift Caribe)
};
