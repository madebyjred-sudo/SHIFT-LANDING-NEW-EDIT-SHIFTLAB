# Execution Example: 03_fact-checking

## Trigger
[draft complete / operator demand / source flagged / urgent deadline]

## Inputs
- Draft: [path, word count, hash]
- Research brief: [path]
- Sources cited: [N unique sources]
- Verification protocol version: [ref]

## Process

### Step 1: Citation Audit
- Inline citations found: [N]
- Endnotes found: [N]
- Format errors: [list]
- Unsourced claims flagged: [list]
- Inaccessible sources: [list]

### Step 2: Fact Check
- Hard facts checked: [N]
- Soft facts checked: [N]
- Inferences checked: [N]
- Predictions checked: [N]
- Anecdotes checked: [N]
- Verifications by protocol:
  - Protocol A (quotations): [N pass, N fail]
  - Protocol B (statistics): [N pass, N fail]
  - Protocol C (names/titles): [N pass, N fail]
  - Protocol D (chronology): [N pass, N fail]
  - Protocol E (legal): [N pass, N fail]
  - Protocol F (economic): [N pass, N fail]

### Step 3: Tone Review
- Thesis confidence level: [high/medium/low/contested]
- Draft tone: [assertive/exploratory/tentative/balanced]
- Alignment: [aligned / underplayed / overplayed]
- Flagged passages: [list]

### Step 4: Rule Check
- Prohibited sources: [none / list]
- Citation chains: [none / list]
- Fabrication risk: [none / list]
- Plagiarism checks: [N flags]
- Disclosure compliance: [pass / fail]

## Outputs
- `output/verified-draft.md` — [pass/fail status]
- `output/verification-log.md` — [entries]
- `output/issue-report.md` — [blocking N, advisory N]

## Quality Score
Self-assessment against gates (pass/fail):
1. Every citation traced to accessible source: [ ]
2. Every quote verified verbatim: [ ]
3. Every statistic confirmed: [ ]
4. Tone-confidence alignment documented: [ ]
5. Zero rule violations: [ ]
6. Issues categorized as blocking/advisory: [ ]
7. Log complete for third-party audit: [ ]

**Overall**: [PASS / PARTIAL / FAIL]

## Deviations
[Any unexpected paths, manual interventions, or process changes]

## Learnings
[What future executions should remember]
