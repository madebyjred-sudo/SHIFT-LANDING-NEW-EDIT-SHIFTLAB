// ----------------------------------------------------------------------
// AgentToolCard
// ----------------------------------------------------------------------
// Kept as a barrel export for backwards-compat with any external import.
// The actual rendering of tool steps now lives inside AgentThinking's
// `<ThoughtLine>` — tool calls and ponders look identical (a natural-
// language thought + an optional secondary detail line). Differentiating
// them visually was reading as "code" to the user.
//
// If you re-introduce a card surface for tools later, do it here.

export {};
