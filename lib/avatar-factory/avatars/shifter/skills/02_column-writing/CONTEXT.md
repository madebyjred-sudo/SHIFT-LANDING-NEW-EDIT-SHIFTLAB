# Layer 1: Context — Column Writing

## Internal Routing

The Column Writing skill transforms intelligence into narrative. This document defines how the skill routes decisions internally.

### Trigger Routing

```
INCOMING TRIGGER
  |
  +-- research complete + brief available ---> STANDARD FLOW
  |
  +-- operator requests specific topic ---> TOPIC-DIRECTED FLOW
  |
  +-- scheduled slot approaching, no draft ---> URGENT FLOW
  |
  +-- brief exists but is thin ---> RESEARCH-EXPANSION FLOW
```

### Flow Definitions

| Flow | Characteristics | Framework Priority |
|------|-----------------|-------------------|
| STANDARD | Full time budget, all references available | Complex frameworks allowed |
| TOPIC-DIRECTED | Operator provides angle; brief is supplementary | Match framework to operator's intent |
| URGENT | Compressed timeline, minimal self-edit | Inverted pyramid or tension-data-resolution only |
| RESEARCH-EXPANSION | Brief inadequate; drafting deferred | N/A — drafting blocked |

### Framework Selection Matrix

| Brief Characteristics | Recommended Framework | Rationale |
|----------------------|----------------------|-----------|
| Strong data, clear trend | Inverted Pyramid | Lead with finding, explain significance |
| Contested issue, polarized | Tension-Data-Resolution | Present conflict, introduce evidence, offer synthesis |
| Human story with policy angle | Narrative Arc | Follow individual, zoom to system |
| Complex system change | Layered Explanation | Build understanding incrementally |
| Urgent breaking news | Inverted Pyramid | Speed and clarity paramount |

### Tone Calibration Routing

```
TOPIC CONFIDENCE ASSESSMENT
  |
  +-- high confidence (evidence conclusive) ---> ASSERTIVE TONE
  |
  +-- medium confidence (evidence suggestive) ---> EXPLORATORY TONE
  |
  +-- low confidence (evidence preliminary) ---> TENTATIVE TONE
  |
  +-- contested (evidence contradictory) ---> BALANCED TONE
```

See `references/tone-calibration.md` for detailed tone parameters.

### Paragraph Flow Rules

- Maximum 3 analytical paragraphs before a concrete example
- Maximum 2 quotes per 500 words
- Maximum 1 rhetorical question per column
- No paragraph may begin with "However," more than once per column

### Abort Conditions

Abort draft and escalate if:
- Intelligence brief is missing or corrupted
- Research contains a contradiction that undermines the chosen angle
- Operator issues a halt command
- Draft exceeds 2000 words (indicates scope creep)

### State Machine

```
IDLE -> OUTLINING -> DRAFTING -> CITING -> EDITING -> KICKER -> DONE
         |            |          |         |         |
         v            v          v         v         v
       ABORTED     STALLED    CITE-FAIL  REVERT   WEAK-END
```

All non-DONE states log reason and last stable output to `memory/draft-history.md`.
