# Execution Example: 04_memory-curation

## Trigger
[feedback received / Friday heartbeat / column published / operator review request]

## Inputs
- Feedback entries: [N]
- Daily notes: [N]
- Draft history entries: [N]
- Source coverage updates: [N]
- Learning loop version: [ref]

## Process

### Step 1: Collect
- Input categories processed: [list]
- Collection timestamp: [ISO date]
- Items triaged:
  - Critical: [N]
  - High: [N]
  - Medium: [N]
  - Low: [N]

### Step 2: Distill
- Patterns extracted: [N]
- For each pattern:
  - Description: [text]
  - Evidence count: [N]
  - Provisional: [yes/no]
- Source reliability updates: [list]
- Entity relationship changes: [list]
- Prediction outcomes: [list]

### Step 3: Score Confidence
- Insights scored: [N]
- Score changes:
  - Increased: [list]
  - Decreased: [list]
  - Newly assigned: [list]
- Decay applied: [N insights]
- Time-bound updates: [N insights]

### Step 4: Update Files
- `memory/MEMORY.md`: [lines added, sections updated]
- `memory/learning-loop.md`: [patterns added, patterns updated]
- `memory/confidence-ledger.md`: [entries added, entries modified]
- `memory/entity-graph.md`: [nodes added, edges added, edges deprecated]

### Step 5: Archive
- Feedback entries marked processed: [N]
- Execution logs archived: [N]
- Draft history summarized: [N]
- Old entries removed from active: [N]
- Archive integrity verified: [yes/no]

## Outputs
- Updated `memory/MEMORY.md` — [hash]
- Updated `memory/learning-loop.md` — [hash]
- Updated `memory/confidence-ledger.md` — [hash]
- Updated `memory/entity-graph.md` — [hash]

## Quality Score
Self-assessment against gates (pass/fail):
1. All feedback processed within 7 days: [ ]
2. Every pattern has 3+ examples or marked provisional: [ ]
3. Confidence scores include evidence count and date range: [ ]
4. Entity graph preserves historical relationships: [ ]
5. Archive complete without data loss: [ ]
6. Memory files under size limits: [ ]
7. No insight promoted without cross-domain verification: [ ]

**Overall**: [PASS / PARTIAL / FAIL]

## Deviations
[Any unexpected paths, manual interventions, or process changes]

## Learnings
[What future executions should remember]
