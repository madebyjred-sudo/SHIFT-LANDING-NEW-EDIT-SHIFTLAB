# Skill System Constitution

## What Is a Skill?

In Shifter's ICM workspace, a **skill** is a mini-ICM (Internal Control Module) with exactly 5 layers:

1. **Layer 0 — Skill Contract (`SKILL.md`)**: Identity, invocation triggers, inputs, process, outputs, quality gates, and failure modes. This is the public API of the skill.
2. **Layer 1 — Context (`CONTEXT.md`)**: Internal routing. How the skill decides which subprocess to activate, what priority to assign, and how to handle ambiguous inputs.
3. **Layer 2 — Process Definition**: The step-by-step algorithm encoded in the skill contract. Each step has entry criteria, execution rules, and exit criteria.
4. **Layer 3 — Reference Material (`references/`)**: Domain knowledge, patterns, rubrics, and standards that the skill consults during execution. These are living documents.
5. **Layer 4 — Execution Memory (`examples/`, `memory/`)**: Recorded executions, outcomes, feedback, and learning loops. Every run leaves a trace.

A skill is not a prompt. It is a **controlled capability** with defined boundaries, measurable quality, and traceable history.

---

## Skill Lifecycle

| Stage | Criteria | Promotion Path |
|-------|----------|----------------|
| **draft** | Contract written, references populated, at least 1 manual execution | Promotion vote by operator |
| **tested** | 3+ successful executions, all quality gates passed, 1+ example documented | Automated after draft criteria met |
| **proven** | 10+ executions, failure modes documented, refinement based on feedback | Reviewed quarterly |
| **deprecated** | Superseded by another skill, or accuracy dropped below threshold | Archived to `skills/_archive/` |

No skill may be invoked automatically until it reaches **tested** status.

---

## Naming Convention

All skills use zero-padded two-digit prefixes:

- `00_` — System/meta skills (or reserved)
- `01_` — Source Intelligence
- `02_` — Column Writing
- `03_` — Fact Checking
- `04_` — Memory Curation

The prefix enforces execution order when skills are composed into workflows. Within a skill directory, files follow standard names: `SKILL.md`, `CONTEXT.md`, `references/`, `examples/`.

---

## Invocation Methods

1. **By Name**: Explicit call: `invoke:skill:02_column-writing` with provided inputs.
2. **By Need**: The ICM workspace detects a gap (e.g., "draft requested but no research exists") and auto-invokes the prerequisite skill.
3. **By Cron**: Scheduled heartbeat invocations:
   - Sun 06:00 — Source Intelligence scan
   - Wed 06:00 — Source Intelligence scan
   - Fri 18:00 — Memory Curation cycle

All invocations are logged to `memory/execution-log.md` with timestamp, inputs hash, and outcome.

---

## Execution Documentation

Every skill execution MUST produce an entry in `examples/` following the `_template.md` structure:

- **Trigger**: Why was this skill invoked?
- **Inputs**: What was provided?
- **Process**: Which steps were taken? (with decision points)
- **Outputs**: What was produced?
- **Quality Score**: Self-assessment against gates
- **Deviations**: Any unexpected paths taken?
- **Learnings**: What should future executions remember?

The `examples/` directory is not optional decoration. It is the **training data** for skill improvement.

---

## Quality Gates

Every skill MUST define 5 or more acceptance criteria. Examples include:

1. Output meets structural requirements (length, format, sections).
2. All claims traceable to sources or explicitly flagged as speculative.
3. No hallucinated citations or fabricated data.
4. Tone consistent with Shifter's editorial voice.
5. Process completed within expected step count (no infinite loops).
6. Failure modes explicitly acknowledged and mitigated.

A skill that cannot define 5 quality gates is not ready for execution.

---

## Failure Modes

Every skill MUST document at least 3 failure modes:

1. **Input Failure**: Required inputs missing, malformed, or stale.
2. **Process Failure**: Step cannot complete (e.g., source unreachable, contradiction found).
3. **Output Failure**: Result fails quality gates or violates constraints.
4. **System Failure**: External dependency failure (network, API, storage).
5. **Cognitive Failure**: Skill produces confident but incorrect output (hallucination, bias).

Each failure mode MUST specify:
- Detection signal
- Recovery action
- Escalation path (human operator or fallback skill)

---

## Reference to ICM Methodology

This skill system implements the ICM (Internal Control Module) methodology as described in Shifter's architecture documentation. The 5-layer structure maps to:

- Layer 0 = Interface/Contract
- Layer 1 = Routing/Control
- Layer 2 = Algorithm/Process
- Layer 3 = Knowledge/Standards
- Layer 4 = Memory/Learning

Skills are the executable units of the ICM. They transform the static architecture into dynamic, accountable capability.
