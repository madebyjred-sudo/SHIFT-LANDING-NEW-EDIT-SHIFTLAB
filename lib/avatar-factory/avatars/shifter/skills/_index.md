# Skill Catalog — Shifter ICM Workspace

This catalog lists all registered skills in Shifter's editorial system. Each skill is a mini-ICM with 5 layers: Contract, Context, Process, References, and Memory.

| Skill | When to Use | Status | Last Used |
|-------|-------------|--------|-----------|
| [01_source-intelligence](01_source-intelligence/SKILL.md) | Before writing any column; during heartbeat scans (Sun/Wed) | draft | — |
| [02_column-writing](02_column-writing/SKILL.md) | After research phase completes; when a draft is requested | draft | — |
| [03_fact-checking](03_fact-checking/SKILL.md) | After draft completion, before review; on demand | draft | — |
| [04_memory-curation](04_memory-curation/SKILL.md) | After feedback received; during heartbeat (Fri); after publish | draft | — |

---

## 01_source-intelligence

**Identity**: I scan registered sources, extract signals, and synthesize intelligence briefs.

This skill maintains Shifter's awareness of the information landscape. It does not write columns; it prepares the raw material from which columns emerge. It tracks source coverage, detects gaps, and scores findings for relevance.

---

## 02_column-writing

**Identity**: I transform research into draft columns with Shifter's voice.

This skill is the primary production engine. It takes research briefs, applies structural frameworks, calibrates tone, inserts citations, and produces publication-ready drafts. It is responsible for the lede, body, and kicker.

---

## 03_fact-checking

**Identity**: I verify every claim, citation, and data point in a draft.

This skill is the quality gate between drafting and publication. It audits citations, checks facts against original sources, reviews tone for unintended bias, and validates compliance with editorial rules. Nothing passes to review without fact-check clearance.

---

## 04_memory-curation

**Identity**: I distill raw experience into lasting knowledge.

This skill manages Shifter's institutional memory. It processes feedback, extracts patterns, updates confidence scores, and maintains the entity graph. Without memory curation, Shifter would repeat mistakes and forget hard-won insights.

---

## Status Definitions

- **draft**: Contract written, not yet tested
- **tested**: 3+ successful executions, quality gates passed
- **proven**: 10+ executions, actively maintained
- **deprecated**: Superseded or failed; archived

---

## Usage Quick Reference

```
invoke:skill:01_source-intelligence
  -> produces: output/intelligence-brief.md

invoke:skill:02_column-writing
  -> requires: output/intelligence-brief.md
  -> produces: output/draft.md

invoke:skill:03_fact-checking
  -> requires: output/draft.md
  -> produces: output/verified-draft.md

invoke:skill:04_memory-curation
  -> requires: feedback, notes, draft history
  -> produces: updated memory files
```
