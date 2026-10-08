# Layer 1: Context — Fact Checking

## Internal Routing

The Fact Checking skill is the last automated gate before human review. This document defines how the skill routes decisions internally.

### Trigger Routing

```
INCOMING TRIGGER
  |
  +-- draft complete, standard path ---> FULL VERIFICATION
  |
  +-- operator demand, fragment -------> TARGETED VERIFICATION
  |
  +-- source flagged post-draft --------> RE-VERIFICATION
  |
  +-- urgent deadline ------------------> PRIORITY VERIFICATION
```

### Verification Scope by Trigger

| Trigger | Scope | Depth |
|---------|-------|-------|
| FULL VERIFICATION | All claims, all citations, all rules | Maximum |
| TARGETED VERIFICATION | Specified claims or passages only | As specified |
| RE-VERIFICATION | Claims dependent on flagged source | Maximum for affected claims |
| PRIORITY VERIFICATION | Thesis, key statistics, named claims | High (defer endnotes if needed) |

### Claim Classification

Every claim in the draft is classified before verification:

| Class | Definition | Verification Action |
|-------|-----------|---------------------|
| **Hard Fact** | Verifiable datum (statistic, date, name, quote) | Source lookup, verbatim check |
| **Soft Fact** | Interpretation presented as fact ("markets reacted negatively") | Source context check, alternative source search |
| **Inference** | Logical conclusion from facts | Check that premises are verified; flag if presented as direct fact |
| **Prediction** | Forward-looking statement | Check basis in verified data; flag if presented as certainty |
| **Anecdote** | Single example used illustratively | Verify event occurred as described; flag if presented as trend |

### Priority Order

When time-constrained, verify in this order:

1. Thesis claim (the central argument)
2. Statistics in the first 200 words
3. Named individuals and their attributed statements
4. Any claim that could be legally sensitive
5. Supporting statistics and data
6. Background context and endnotes

### Decision Matrix

After verification, each claim receives a status:

| Status | Meaning | Draft Action |
|--------|---------|--------------|
| **VERIFIED** | Confirmed against primary source | No action |
| **VERIFIED WITH CAVEAT** | Confirmed but with limitation noted | Add caveat or adjust tone |
| **UNVERIFIED** | Source inaccessible or claim not found in source | Flag in issue report |
| **DISPUTED** | Other credible sources contradict | Adjust tone to contested; note dispute |
| **FALSE** | Directly contradicted by reliable source | Mark [BLOCKING]; recommend removal |

### Abort Conditions

Abort verification and escalate if:
- Draft contains a claim that is demonstrably false and central to thesis
- Operator issues halt command
- >50% of primary sources are inaccessible
- Legal risk detected (defamation, classified information, etc.)

### State Machine

```
IDLE -> SCANNING -> AUDITING -> CHECKING -> REVIEWING -> REPORTING -> DONE
         |           |           |           |            |
         v           v           v           v            v
       ABORTED    CORRUPTED   STALLED    CONFLICT      ESCALATED
```

All non-DONE states require immediate operator notification.
