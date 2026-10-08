# Layer 1: Context — Source Intelligence

## Internal Routing

The Source Intelligence skill acts as the sensory cortex of Shifter's ICM. This document defines how the skill routes decisions internally.

### Trigger Routing

```
INCOMING TRIGGER
  |
  +-- scheduled heartbeat (Sun/Wed) ---> FULL SCAN
  |
  +-- pre-column request -------------> TARGETED SCAN (topic-filtered)
  |
  +-- operator ad-hoc ----------------> ADAPTIVE SCAN (follow operator params)
  |
  +-- breaking topic flag ------------> EMERGENCY SCAN (priority sources only)
```

### Decision Tree: Source Selection

For each scan type, which sources are included?

| Scan Type | Source Tiers Included | Max Sources | Timeout |
|-----------|----------------------|-------------|---------|
| FULL SCAN | Tier 1 + Tier 2 | All registered | 60s per source |
| TARGETED SCAN | Tier 1 + matching Tier 2 | Top 15 by relevance | 45s per source |
| ADAPTIVE SCAN | As specified by operator | As specified | As specified |
| EMERGENCY SCAN | Tier 1 only | All Tier 1 | 30s per source |

**Tier Definitions** (from source registry):
- **Tier 1**: Primary outlets, official channels, established agencies
- **Tier 2**: Specialist blogs, newsletters, industry reports
- **Tier 3**: Forums, social feeds, aggregators (manual review only)

### Priority Scoring

When signal volume exceeds processing capacity, rank by:

1. Source tier (Tier 1 > Tier 2)
2. Recency (hours since publish)
3. Historical accuracy of source (from source-history.md)
4. Operator topic preferences (from memory/learning-loop.md)
5. Novelty (not covered in previous brief)

### Conflict Resolution

When two signals contradict:
- If same tier: preserve both, flag as contested
- If different tiers: weight Tier 1 higher but still preserve both
- Never auto-resolve by suppression

### Subprocess Activation

| Condition | Activated Subprocess |
|-----------|---------------------|
| New source detected | Source onboarding (validation + pattern matching) |
| Pattern mismatch | Pattern adaptation (fallback extraction) |
| Coverage gap >24h | Gap filler (expand to secondary sources) |
| Contradiction detected | Contested terrain protocol (preserve all sides) |

### Abort Conditions

Abort scan and escalate if:
- >50% of Tier 1 sources unreachable
- Contradiction storm on a topic flagged as "sensitive"
- Operator issues a halt command (checked at end of each step)
- Disk or memory threshold exceeded

### State Machine

```
IDLE -> SCANNING -> EXTRACTING -> SYNTHESIZING -> WRITING -> DONE
         |             |              |              |
         v             v              v              v
       ABORTED     FAILED       DEGRADED      PARTIAL
```

All non-DONE states require a final log entry in `memory/execution-log.md`.
