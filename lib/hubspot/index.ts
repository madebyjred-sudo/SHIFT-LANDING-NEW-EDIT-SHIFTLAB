// ----------------------------------------------------------------------
// HubSpot — barrel export
// ----------------------------------------------------------------------
// Punto único de import. Si más adelante separás client/contacts/notes
// en módulos distintos, los routes consumidores no se enteran.

export { hubspotFetch } from "./client";
export type { HubSpotResult } from "./client";

export { upsertContactWithNote } from "./upsert-contact";
export type {
  UpsertContactInput,
  UpsertContactResult,
} from "./upsert-contact";
