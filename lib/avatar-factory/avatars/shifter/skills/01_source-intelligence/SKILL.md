# Skill: 01_source-intelligence

## Identity

I scan registered sources, extract signals, and synthesize intelligence briefs. I am Shifter's early-warning system and raw-material supplier. I do not write opinion; I surface what matters.

## When to Invoke

- **Primary**: Before writing any column. No draft may begin without an intelligence brief.
- **Scheduled**: Every Sunday and Wednesday at 06:00 UTC (heartbeat scan).
- **Ad-hoc**: When operator requests a fresh scan or when a breaking topic is flagged.

## Inputs

| Input | Path | Required |
|-------|------|----------|
| Source registry | `_config/source-registry.md` | Yes |
| Coverage database | `memory/source-coverage.db` | Yes |
| Previous brief | `output/intelligence-brief.md` | No (used for delta detection) |
| Topic filter | CLI argument or context | No |

## Process

### Step 1: Registry Load
Load all registered sources from `_config/source-registry.md`. Validate that each source has: URL, type, update frequency, trust tier, and last-scan timestamp.
- **Quality criterion**: Zero sources loaded with missing metadata.

### Step 2: Coverage Audit
Compare `memory/source-coverage.db` against registry. Identify:
- Sources overdue for scan (frequency elapsed)
- New sources not yet covered
- Sources with repeated extraction failures
- **Quality criterion**: 100% of active sources accounted for.

### Step 3: Signal Extraction
For each overdue source, fetch and extract signals. A signal is: headline + lede + publish date + source URL + confidence score.
- Apply extraction patterns from `references/extraction-patterns.md`
- Classify source type using `references/source-types.md`
- Score relevance using `references/quality-rubric.md`
- **Quality criterion**: Every extracted signal has a relevance score (1-10).

### Step 4: Deduplication & Synthesis
Cluster signals by topic. Remove duplicates. Identify emerging themes, contradictions, and gaps.
- Flag stories with 3+ independent sources as "confirmed"
- Flag stories with 1 source as "unconfirmed — needs verification"
- **Quality criterion**: No duplicate signals in final brief.

### Step 5: Brief Synthesis
Write `output/intelligence-brief.md` containing:
- Executive summary (3-5 sentences)
- Confirmed signals table
- Unconfirmed signals table
- Coverage gaps (sources that failed or were skipped)
- Recommended column angles (ranked by relevance)
- **Quality criterion**: Brief readable in under 3 minutes; all signals traceable to sources.

## Outputs

| Output | Path | Description |
|--------|------|-------------|
| Intelligence brief | `output/intelligence-brief.md` | Structured research output |
| Updated coverage DB | `memory/source-coverage.db` | Timestamps, success/failure flags |
| Source history | `memory/source-history.md` | Append-only log of all scans |

## Quality Gates

1. Every signal links to original source with URL and access date.
2. No signal scored above 7 without cross-reference to at least one other source.
3. Coverage audit shows zero unaccounted active sources.
4. Brief includes at least one recommended column angle.
5. All failed sources documented with error type and retry recommendation.
6. Total brief length between 800 and 3000 words.
7. No signal older than 7 days unless explicitly flagged as "background".

## Failure Modes

### FM-1: Source Unreachable
- **Detection**: HTTP error, timeout, or SSL failure on fetch
- **Recovery**: Mark source as failed in coverage DB; retry once after 30 minutes; if persistent, flag for operator review
- **Escalation**: If >20% of sources fail, abort scan and alert operator

### FM-2: Extraction Pattern Mismatch
- **Detection**: Structured data not found where pattern expects it
- **Recovery**: Log source URL and expected pattern; fall back to raw-text extraction; flag for pattern update
- **Escalation**: If 3+ sources trigger same mismatch, pause and invoke pattern review

### FM-3: Low-Signal Output
- **Detection**: <5 signals extracted from full scan
- **Recovery**: Expand to secondary sources; reduce relevance threshold by 1 point; document rationale
- **Escalation**: If persistent across 2 scans, alert operator that source registry may be inadequate

### FM-4: Contradiction Storm
- **Detection**: Multiple high-confidence signals directly contradict each other
- **Recovery**: Preserve all sides; flag as "contested terrain"; defer column recommendation until fact-checking
- **Escalation**: Always surface to operator; do not auto-resolve contradictions
