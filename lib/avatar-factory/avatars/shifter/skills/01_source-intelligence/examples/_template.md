# Execution Example: 01_source-intelligence

## Trigger
[scheduled heartbeat / pre-column request / operator ad-hoc / breaking topic flag]

## Inputs
- Source registry: [version or hash]
- Coverage database: [last updated]
- Topic filter: [if any]
- Previous brief: [if used for delta]

## Process

### Step 1: Registry Load
- Sources loaded: [N]
- Validation issues: [any]
- Time elapsed: [minutes]

### Step 2: Coverage Audit
- Overdue sources: [N]
- New sources: [N]
- Failed sources (persistent): [N]

### Step 3: Signal Extraction
- Sources scanned: [N]
- Signals extracted: [N]
- Average relevance score: [X]
- Top-scoring signal: [brief description]

### Step 4: Deduplication & Synthesis
- Clusters formed: [N]
- Duplicates removed: [N]
- Contradictions flagged: [N]
- Confirmed signals: [N]
- Unconfirmed signals: [N]

### Step 5: Brief Synthesis
- Brief length: [words]
- Recommended angles: [list]
- Coverage gaps noted: [list]

## Outputs
- `output/intelligence-brief.md` — [size, hash]
- `memory/source-coverage.db` — [updated entries]
- `memory/source-history.md` — [new entries]

## Quality Score
Self-assessment against gates (pass/fail for each):
1. Every signal links to original source: [ ]
2. No signal scored >7 without cross-reference: [ ]
3. Coverage audit complete: [ ]
4. At least one column angle recommended: [ ]
5. Failed sources documented: [ ]
6. Brief length 800-3000 words: [ ]
7. No stale signals unflagged: [ ]

**Overall**: [PASS / PARTIAL / FAIL]

## Deviations
[Any unexpected paths, manual interventions, or process changes]

## Learnings
[What future executions should remember about this run]
