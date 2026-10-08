# Reference: Confidence Scoring

## How to Assign and Update Confidence Scores

This document defines the methodology for scoring confidence in Shifter's memory system. Confidence scores are probabilities (0.0 to 1.0) that a given piece of knowledge is accurate and applicable.

---

### Initial Assignment

When a new insight enters the system:

| Evidence Basis | Initial Confidence | Example |
|----------------|-------------------|---------|
| Single observation | 0.3 | "One source failed once" |
| Two observations | 0.45 | "Two columns with similar ledes performed well" |
| Three observations | 0.6 | "Three fact-checks found the same source type unreliable" |
| Operator declaration | 0.7 | "Operator states that topic X is priority" |
| Verified by independent check | 0.8 | "Cross-referenced with 2+ external databases" |
| Operator validation + evidence | 0.9 | "Operator confirmed and 3+ examples support" |

---

### Update Rules

Confidence is updated after each new piece of evidence:

| New Evidence Type | Effect on Confidence |
|-------------------|---------------------|
| Confirming observation | +0.10 (capped at 1.0) |
| Strong confirming observation (cross-domain) | +0.15 (capped at 1.0) |
| Contradicting observation | -0.15 (floor at 0.0) |
| Strong contradicting observation (authoritative) | -0.25 (floor at 0.0) |
| No new evidence for 90 days | -0.05 (decay, floor at 0.0) |
| No new evidence for 180 days | -0.10 (accelerated decay) |
| Operator explicitly validates | Set to operator value (0.7-1.0) |
| Operator explicitly invalidates | Set to 0.0 and flag for removal |

---

### Confidence Tiers

| Tier | Range | Meaning | Action |
|------|-------|---------|--------|
| **Certain** | 0.90-1.00 | Actively used in decisions; cited with authority | No special handling |
| **High** | 0.75-0.89 | Reliable basis for action; note as "well-supported" | Monitor for contradicting evidence |
| **Moderate** | 0.50-0.74 | Tentative; use with caveats; mark as "suggestive" | Seek confirming evidence |
| **Low** | 0.20-0.49 | Weak; do not use as sole basis for decisions | Flag for additional observation |
| **Negligible** | 0.00-0.19 | Unreliable; candidate for removal | Review for archival |

---

### Composite Confidence

For compound statements (e.g., "A causes B, and B affects C"), compute confidence using:

```
Composite = Product of individual confidences
```

Example:
- Confidence(A causes B) = 0.8
- Confidence(B affects C) = 0.7
- Composite confidence = 0.8 * 0.7 = 0.56 (Moderate)

**Rule**: Never report compound confidence higher than the lowest component.

---

### Temporal Confidence

Some insights are time-bound. For these, apply a time-decay factor:

```
Effective Confidence = Base Confidence * exp(-0.01 * days_since_last_update)
```

This means:
- After 30 days: ~74% of base confidence
- After 90 days: ~41% of base confidence
- After 180 days: ~17% of base confidence

Time-bound insights include:
- Source reliability scores
- Market condition assessments
- Political relationship maps
- Prediction outcomes

Timeless insights (e.g., historical facts, structural relationships) do not decay.

---

### Documentation

Every confidence score must be documented in `memory/confidence-ledger.md`:

```
Insight ID: [unique identifier]
Description: [concise text]
Current Score: [0.00-1.00]
Score History:
  - [date]: [score] — [reason]
  - [date]: [score] — [reason]
Evidence Count: [N confirming, N contradicting]
Last Updated: [date]
Decay Applied: [yes/no]
Time Bound: [yes/no, if yes: expiry date]
```

---

### Review Schedule

- **High and Certain** insights: reviewed quarterly
- **Moderate** insights: reviewed monthly
- **Low** insights: reviewed weekly
- **Negligible** insights: reviewed each curation cycle, candidate for removal
