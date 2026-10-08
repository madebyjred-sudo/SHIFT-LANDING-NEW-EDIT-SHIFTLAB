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
// general porque no había GM público asignado. México ya tiene hub
// propio en CDMX con dos contactos directos; Perú sigue fuera.)

import type { HubOption } from "@/app/contact/hubs";

/**
 * Map de país → email(s) destino. Mantener sincronizado con
 * `content/knowledge/about-shift-latam.compact.yaml` → `hubs_12_paises`.
 *
 * Un país puede tener más de un destinatario: el aviso del lead se
 * envía a todos a la vez (México llega a sus dos contactos).
 *
 * Fuente: General Managers / Senior VPs verificados públicamente.
 * Última verificación: 2026-09.
 */
export const HUB_EMAILS: Record<HubOption, string | string[]> = {
  "Costa Rica (Hub)": "gpiedra@shiftpn.co.cr",          // Gabriela Piedra (Sr VP Shift Latam)
  Guatemala: "veronicap@shiftpn.gt",                     // Verónica Pineda (Shift Guatemala)
  "El Salvador": "cferreiro@shiftpn.sv",                 // Camila Ferreiro (GM Shift El Salvador)
  Honduras: "maria.calvo@shift-pn.hn",                   // María Calvo
  Nicaragua: "rmontenegro@shiftpn.com.ni",               // Rosario Montenegro (GM Shift Nicaragua)
  Panamá: "jjaltmann@omgcr.com",                         // JJ Altmann
  México: [                                              // hub CDMX — ambas reciben el lead
    "Karen.Ovseyevitz@shiftlatam.agency",
    "sandra.kleinburg@shiftlatam.agency",
  ],
  Colombia: "gonzalo.pineros@shiftpn.co",                // Gonzalo Piñeros (GM Shift Colombia)
  Ecuador: "angelica.moreno@shiftpn.ec",                 // Angélica Moreno (GM Shift Ecuador)
  Venezuela: "holahola@shiftpn.com",                     // Valentina Rosas Godoy — pendiente email corp
  "República Dominicana": "andrea.ramirez@caribbeanpn.com", // Andrea Ramírez (GM Shift Caribe)
};
