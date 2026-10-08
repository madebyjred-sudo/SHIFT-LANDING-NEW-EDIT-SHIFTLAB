# Reference: Quality Rubric

## How to Score a Finding's Relevance

Every signal extracted by Source Intelligence receives a relevance score from 1 to 10. This score determines whether the signal appears in the intelligence brief and with what priority.

---

### Scoring Dimensions

Each dimension contributes to the final score. Not all dimensions apply to every signal.

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Timeliness | 20% | How recent is the signal? |
| Source Authority | 20% | How credible is the originating source? |
| Novelty | 15% | Has Shifter covered this angle before? |
| Impact Potential | 20% | How many people or systems does this affect? |
| Actionability | 15% | Can Shifter form a column angle from this? |
| Corroboration | 10% | Are other sources reporting the same thing? |

---

### Score Breakdown

#### Timeliness (0-10)
- 10: Published within last 6 hours
- 8: Published within last 24 hours
- 6: Published within last 3 days
- 4: Published within last 7 days
- 2: Published within last 30 days
- 0: Older than 30 days

#### Source Authority (0-10)
- 10: Tier 1 source with established fact-checking (e.g., Reuters, AP)
- 8: Tier 1 source without explicit fact-checking policy
- 6: Tier 2 source with known expertise in topic
- 4: Tier 2 generalist source
- 2: Tier 3 source with some credibility markers
- 0: Unknown or anonymous source

#### Novelty (0-10)
- 10: Entirely new topic, never covered by Shifter
- 8: New angle on previously covered topic
- 6: Incremental update to ongoing story
- 4: Confirmation of existing coverage
- 2: Minor detail in well-covered story
- 0: Already covered in last brief

#### Impact Potential (0-10)
- 10: Affects national policy, markets, or millions of people
- 8: Affects regional policy or large industry
- 6: Affects specific sector or community
- 4: Affects niche group or technical domain
- 2: Minimal direct impact, interesting contextually
- 0: No discernible impact

#### Actionability (0-10)
- 10: Clear column angle with strong thesis and available evidence
- 8: Promising angle, needs more research
- 6: Possible angle, requires significant framing
- 4: Interesting but hard to columnize
- 2: Background material only
- 0: No editorial value

#### Corroboration (0-10)
- 10: 5+ independent sources confirm
- 8: 3-4 independent sources confirm
- 6: 2 independent sources confirm
- 4: 1 source with partial secondary confirmation
- 2: Single source, no confirmation
- 0: Contradicted by other sources

---

### Final Score Calculation

```
Final Score = (Timeliness * 0.20)
            + (Source Authority * 0.20)
            + (Novelty * 0.15)
            + (Impact Potential * 0.20)
            + (Actionability * 0.15)
            + (Corroboration * 0.10)
```

Round to nearest integer. Scores of 7+ are "high priority" and must appear in the brief. Scores of 4-6 are "medium priority" and appear if space permits. Scores below 4 are logged but excluded from brief unless operator requests full dump.

---

### Override Rules

1. **Breaking news override**: Any signal from Tier 1 source published <2 hours ago automatically scores minimum 8 on Timeliness.
2. **Contradiction override**: If a signal contradicts a high-confidence finding, it receives +2 Novelty bonus.
3. **Operator interest override**: Topics in operator's declared interest list receive +1 Actionability.
4. **Ceiling rule**: No single dimension can contribute more than its maximum; bonuses apply only within dimension bounds.
