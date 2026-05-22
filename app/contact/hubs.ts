export const HUB_OPTIONS = [
  "Costa Rica (Hub)",
  "Guatemala",
  "El Salvador",
  "Honduras",
  "Nicaragua",
  "Panamá",
  "Colombia",
  "Ecuador",
  "Venezuela",
  "República Dominicana",
] as const;

export type HubOption = (typeof HUB_OPTIONS)[number];
