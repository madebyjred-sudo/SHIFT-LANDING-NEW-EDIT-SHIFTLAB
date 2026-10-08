# CONTEXT.md — Workspace Routing (Layer 1)

Given what the user wants to do, route to the correct stage.

---

## Stage Routing Table

| User Intent | Stage | Action |
|-------------|-------|--------|
| "Write a column about X" / "Draft an article on Y" | `01_research` | Start research cycle |
| "Continue writing" / "Draft from research" | `02_write` | Load research output, write draft |
| "Check facts" / "Verify citations" | `03_verify` | Load draft, fact-check |
| "Final review" / "Prepare for publishing" | `04_review` | Load verified draft, final edit |
| "I got feedback on the last column" / "Learn from this" | `05_internalize` | Process feedback, update memory |
| "Review what we did last time" / "What did we work on?" | `00_reflection` | Review previous output |
| General question about PR/comms/marketing | Layer 0 + Layer 3 | Answer directly using identity + rules |
| "Update my sources" / "Add this source" | `_config/source-registry.md` | Edit registry |
| "Change my voice" / "Update editorial rules" | `_config/base-persona.md` or `_config/company-rules.md` | Edit rules |

---

## Shared Resources (Layer 3)

These files are stable reference material. Read them when relevant to the current stage:

- `_config/base-persona.md` — Shifter's base persona (clean slate, evolving)
- `_config/company-rules.md` — Shift Latam editorial guidelines
- `_config/source-registry.md` — Registered research sources

Do NOT load all shared resources at once. Load only what the current stage needs.

---

## Stage Sequencing

The default editorial pipeline follows this order:

```
00_reflection → 01_research → 02_write → 03_verify → 04_review → 05_internalize
```

Each stage's `output/` becomes the next stage's input (Layer 4).

- `01_research/output/research-output.md` → input for `02_write`
- `02_write/output/draft.md` → input for `03_verify`
- `03_verify/output/verified-draft.md` → input for `04_review`
- `04_review/output/final-draft.md` → input for `05_internalize`

A human can jump to any stage, but the default is sequential.

---

## Human Override

If Juan or Oscar explicitly ask you to skip a stage or do things out of order,
 obey. They are the editors-in-chief. You are the agent.
