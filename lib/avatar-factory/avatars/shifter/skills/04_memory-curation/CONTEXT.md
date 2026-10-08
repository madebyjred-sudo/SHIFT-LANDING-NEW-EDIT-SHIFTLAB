# Layer 1: Context — Memory Curation

## Internal Routing

The Memory Curation skill manages Shifter's long-term knowledge. This document defines how the skill routes decisions internally.

### Trigger Routing

```
INCOMING TRIGGER
  |
  +-- feedback received ----------------> FEEDBACK PROCESSING
  |
  +-- scheduled Friday heartbeat -------> FULL CURATION CYCLE
  |
  +-- column published -----------------> PUBLICATION ARCHIVAL
  |
  +-- operator requests memory review --> TARGETED REVIEW
```

### Processing Modes

| Mode | Scope | Priority |
|------|-------|----------|
| FEEDBACK PROCESSING | New feedback entries only | High (process within 24h) |
| FULL CURATION | All memory files, all inputs | Standard (weekly) |
| PUBLICATION ARCHIVAL | Single column's artifacts | High (process within 48h of publish) |
| TARGETED REVIEW | Specific entity, topic, or time range | As specified by operator |

### Input Triage

When feedback or inputs arrive, classify before processing:

| Category | Priority | Handler |
|----------|----------|---------|
| Error correction (factual) | Critical | Immediate update to MEMORY.md + confidence ledger |
| Tone complaint | High | Update learning-loop.md with voice calibration note |
| Source reliability report | High | Update source-coverage.db + entity graph |
| Suggestion / idea | Medium | Queue for next full curation cycle |
| Praise / confirmation | Low | Log as positive reinforcement for patterns |

### Distillation Routing

After collection, raw inputs are routed to the appropriate distillation subprocess:

```
RAW INPUT
  |
  +-- about source behavior --------> SOURCE RELIABILITY UPDATE
  |
  +-- about column quality --------> PATTERN EXTRACTION (voice, structure)
  |
  +-- about factual accuracy ------> CONFIDENCE ADJUSTMENT
  |
  +-- about entity relationships ----> ENTITY GRAPH UPDATE
  |
  +-- about prediction outcomes ----> PREDICTION TRACKING
```

### Confidence Update Rules

| Trigger | Action |
|---------|--------|
| New confirming evidence | Increase confidence by 0.1 (max 1.0) |
| New contradicting evidence | Decrease confidence by 0.15 (min 0.0) |
| No new evidence for 90 days | Decrease confidence by 0.05 (decay) |
| No new evidence for 180 days | Decrease confidence by 0.10 (accelerated decay) |
| Operator explicitly validates | Set confidence to operator-specified value |
| Operator explicitly invalidates | Set to 0.0 and flag for removal |

### Forgetting Protocol

Not everything deserves permanent memory. See `references/forgetting-policy.md` for detailed rules.

### Abort Conditions

Abort curation and escalate if:
- Feedback contains legal threat or defamation concern
- Source reliability update would reclassify a Tier 1 source as Tier 3
- Entity graph update creates unresolved contradiction affecting core knowledge
- Operator issues halt command
- Disk space for memory files exceeds 80%

### State Machine

```
IDLE -> COLLECTING -> DISTILLING -> SCORING -> UPDATING -> ARCHIVING -> DONE
         |            |           |          |          |
         v            v           v          v          v
       ABORTED     OVERWHELMED  DRIFT      CONFLICT   FULL
```

All non-DONE states require operator notification and remediation plan.
