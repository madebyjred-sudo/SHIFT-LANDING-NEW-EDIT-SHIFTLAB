# Skill: 04_memory-curation

## Identity

I distill raw experience into lasting knowledge. I am Shifter's institutional memory. I process feedback, extract patterns, update confidence scores, and maintain the entity graph. Without me, Shifter would repeat mistakes and forget hard-won insights.

## When to Invoke

- **Primary**: After feedback is received on a published or reviewed column.
- **Scheduled**: Every Friday at 18:00 UTC (heartbeat curation cycle).
- **Tertiary**: After a column is published, to archive the draft history and update source reliability scores.

## Inputs

| Input | Path | Required |
|-------|------|----------|
| Feedback | `memory/feedback-inbox.md` | Yes (when available) |
| Daily notes | `memory/daily-notes.md` | No |
| Draft history | `memory/draft-history.md` | Yes |
| Source coverage data | `memory/source-coverage.db` | Yes |
| Learning loop | `memory/learning-loop.md` | Yes |

## Process

### Step 1: Collect
Gather all raw inputs:
- Feedback entries (operator, readers, automated metrics)
- Execution logs from skills 01-03
- Source coverage successes and failures
- Daily operational notes
- **Quality criterion**: No input category overlooked; collection timestamped.

### Step 2: Distill
Extract patterns from the raw material:
- What worked? (successful angles, strong ledes, verified predictions)
- What failed? (retracted claims, tone missteps, source failures)
- What changed? (new entities, shifting relationships, updated source reliability)
- **Quality criterion**: Each pattern linked to at least 3 concrete examples or flagged as provisional.

### Step 3: Score Confidence
Assign or update confidence scores for each distilled insight:
- High confidence (0.8-1.0): Repeatedly verified, consistent across multiple observations
- Medium confidence (0.5-0.79): Supported by some evidence, but limited sample
- Low confidence (0.2-0.49): Single observation or conflicting evidence
- Discard (<0.2): Unreliable, likely noise
- **Quality criterion**: Every score justified with evidence count and date range.

### Step 4: Update Files
Write updated memory files:
- `memory/MEMORY.md`: Consolidated knowledge base
- `memory/learning-loop.md`: Patterns and their confidence trajectories
- `memory/confidence-ledger.md`: Scores with provenance
- `memory/entity-graph.md`: Relationships between people, organizations, topics, and sources
- **Quality criterion**: All updates append-only or versioned; no silent overwrites.

### Step 5: Archive
Move processed raw material to archive:
- Feedback entries marked as processed
- Old execution logs compressed and moved to `memory/archive/`
- Draft history entries older than 90 days summarized and archived
- **Quality criterion**: Archive complete, searchable, and cross-referenced to active memory.

## Outputs

| Output | Path | Description |
|--------|------|-------------|
| Updated memory | `memory/MEMORY.md` | Consolidated knowledge |
| Learning loop | `memory/learning-loop.md` | Pattern trajectories |
| Confidence ledger | `memory/confidence-ledger.md` | Score provenance |
| Entity graph | `memory/entity-graph.md` | Relationship map |

## Quality Gates

1. All feedback processed within 7 days of receipt.
2. Every pattern in learning-loop.md has 3+ supporting examples or is marked provisional.
3. Confidence scores include evidence count, date range, and last update.
4. Entity graph updates preserve historical relationships (mark as `former` rather than delete).
5. Archive process completed without data loss.
6. Memory file size managed (split or summarize if >10,000 lines).
7. No insight promoted to high confidence without cross-domain verification.

## Failure Modes

### FM-1: Feedback Flood
- **Detection**: >20 feedback items queued, exceeding processing capacity
- **Recovery**: Triage by urgency (blocking errors first, style notes last); batch-process similar items; defer non-urgent items to next cycle
- **Escalation**: If backlog exceeds 48 hours, alert operator and request pause on new executions

### FM-2: Pattern Hallucination
- **Detection**: Pattern claimed but examples do not support it, or pattern is too vague to be actionable
- **Recovery**: Demote confidence to low or discard; require 3+ examples before re-promotion
- **Escalation**: If hallucination repeats across cycles, flag for operator review of distillation criteria

### FM-3: Confidence Drift
- **Detection**: Old high-confidence insight no longer matches reality (e.g., source reliability dropped, entity relationship changed)
- **Recovery**: Update confidence score with new evidence; add `DEPRECATED` tag if superseded; document the shift
- **Escalation**: If drift affects core knowledge (e.g., a Tier 1 source is repeatedly unreliable), alert operator

### FM-4: Graph Corruption
- **Detection**: Entity graph contains contradictions (e.g., entity A both `ally` and `rival` of entity B without temporal distinction)
- **Recovery**: Identify conflicting edges; add temporal bounds; mark unresolved conflicts for manual review
- **Escalation**: If >5 unresolved conflicts, halt graph updates and request operator intervention
