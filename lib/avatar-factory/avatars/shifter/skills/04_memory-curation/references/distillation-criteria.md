# Reference: Distillation Criteria

## What Deserves to Be Remembered vs. Forgotten

This document defines the criteria for promoting raw experience into institutional memory, and for demoting or removing knowledge that has lost its value.

---

### Remember: High-Value Patterns

Promote to `memory/MEMORY.md` and `memory/learning-loop.md` when:

1. **Repeated Observation**
   - The same pattern appears in 3+ independent instances
   - Examples: "Lede type X consistently outperforms on engagement," "Source Y fails on Friday afternoons"

2. **Causal Insight**
   - The pattern explains why something happens, not just that it happens
   - Example: "Columns published before 8 AM get more shares because the target audience checks news during commute"

3. **Predictive Power**
   - The pattern enables better predictions about future outcomes
   - Example: "When the central bank uses phrase Z, rate changes follow within 30 days"

4. **Failure Mode**
   - A specific failure recurs with identifiable causes
   - Example: "Drafts on topic W always trigger fact-checking failures because sources contradict within 24 hours"

5. **Relationship Change**
   - An entity's role, alliance, or status has shifted
   - Example: "Minister X moved from Economy to Interior; previous analysis of X's economic stance no longer applies"

---

### Conditionally Remember: Medium-Value Patterns

Store in `memory/learning-loop.md` with medium confidence when:

1. **Single Strong Example**
   - One compelling instance that might generalize
   - Requires monitoring for recurrence

2. **Tentative Correlation**
   - Two variables move together but causation is unproven
   - Example: "Column length and share count are inversely correlated (r=-0.4, n=12)"

3. **Operator Insight**
   - Direct feedback from operator that has not yet been tested
   - Example: "Try opening with a question instead of a statement"

---

### Forget: Low-Value or Harmful Patterns

Demote, archive, or remove when:

1. **Outdated Context**
   - The pattern depended on conditions that no longer exist
   - Example: "Source Z is reliable" when Z has had 3 retractions in the last month

2. **Overfitting**
   - The pattern is too specific to be generalizable
   - Example: "The column published on March 3 performed well" (no transferable lesson)

3. **Superseded by Better Model**
   - A new understanding replaces the old one
   - Example: "Entity A is neutral" replaced by "Entity A is aligned with B since June 2026"

4. **Noise**
   - Random variation mistaken for pattern
   - Example: "Tuesday columns do better" with n=4 and no controlling for topic

5. **Toxic Pattern**
   - A pattern that leads to poor outcomes if followed
   - Example: "Readers engage more with inflammatory ledes" if it leads to tone complaints

---

### Distillation Decision Tree

```
RAW OBSERVATION
  |
  +-- Has it occurred 3+ times? ----------------> Yes -> Remember
  |                                             No  -> Continue
  |
  +-- Does it explain causation? ---------------> Yes -> Remember
  |                                             No  -> Continue
  |
  +-- Does it predict future outcomes? ---------> Yes -> Remember
  |                                             No  -> Continue
  |
  +-- Is it a recurring failure? ---------------> Yes -> Remember
  |                                             No  -> Continue
  |
  +-- Is it a relationship change? -------------> Yes -> Remember
  |                                             No  -> Continue
  |
  +-- Is it a single strong example? -----------> Yes -> Conditionally remember
  |                                             No  -> Continue
  |
  +-- Is it outdated/superseded/noise/toxic? ---> Yes -> Forget
                                                  No  -> Conditionally remember
```

---

### Documentation Standard

For every remembered pattern, record:

```
Pattern: [concise description]
Evidence: [N examples, with dates]
Confidence: [score]
First observed: [date]
Last updated: [date]
Conditions: [when this pattern applies]
Exceptions: [when it does not apply]
Source: [which skill/operator generated this]
```

For every forgotten pattern, record:

```
Pattern: [concise description]
Reason for removal: [outdated/overfitting/superseded/noise/toxic]
Removed on: [date]
Replaced by: [if applicable]
Archive location: [path]
```

No pattern is silently deleted. All removals are logged.
