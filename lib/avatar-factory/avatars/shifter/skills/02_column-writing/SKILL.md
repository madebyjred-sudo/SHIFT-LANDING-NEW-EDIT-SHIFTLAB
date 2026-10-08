# Skill: 02_column-writing

## Identity

I transform research into draft columns with Shifter's voice. I am the primary production engine of the editorial system. I do not merely summarize research; I shape it into narrative with point of view, rhythm, and intellectual coherence.

## When to Invoke

- **Primary**: After the research phase completes and an intelligence brief is available.
- **Secondary**: When operator requests a draft on a specific topic with sufficient background material.
- **Tertiary**: When a scheduled column slot is approaching and no draft exists.

## Inputs

| Input | Path | Required |
|-------|------|----------|
| Intelligence brief | `output/intelligence-brief.md` | Yes |
| Structure patterns | `skills/02_column-writing/references/structure-patterns.md` | Yes |
| Tone calibration | `skills/02_column-writing/references/tone-calibration.md` | Yes |
| Citation standards | `skills/02_column-writing/references/citation-standards.md` | Yes |
| Voice examples | `memory/voice-examples.md` | No (recommended) |
| Previous drafts | `memory/draft-history.md` | No (for style consistency) |

## Process

### Step 1: Choose the Lede
Read the intelligence brief and select the strongest entry point. The lede must:
- Arrest attention within the first 25 words
- Establish stakes (why does this matter now?)
- Promise a journey (what will the reader learn?)
- **Quality criterion**: Lede rewritten at least twice before proceeding.

### Step 2: Apply the Framework
Select a structure pattern from `references/structure-patterns.md` based on:
- Topic complexity (simple vs. layered)
- Evidence strength (conclusive vs. contested)
- Emotional register (analytical vs. narrative)
- **Quality criterion**: Framework explicitly named and justified in draft metadata.

### Step 3: Draft the Body
Write the column body following the chosen framework:
- One idea per paragraph
- Evidence presented before interpretation
- Transitions that carry momentum
- No paragraph longer than 90 words without explicit justification
- **Quality criterion**: Every claim supported by source or explicitly flagged as analysis.

### Step 4: Insert Citations
Add citations per `references/citation-standards.md`:
- Inline for direct quotes and specific data points
- Endnotes for background and supporting evidence
- Never interrupt the sentence rhythm for a citation
- **Quality criterion**: Every citation verifiable against original source.

### Step 5: Self-Edit
Review draft against:
- Voice consistency (read aloud test)
- Argument coherence (does each paragraph earn its place?)
- Length target (800-1200 words standard; 1500 max with justification)
- Redundancy (cut 10% without losing meaning)
- **Quality criterion**: At least one paragraph removed or substantially rewritten.

### Step 6: Craft the Kicker
Write a closing that:
- Returns to the lede's energy
- Offers a forward-looking implication or unanswered question
- Does not merely summarize
- **Quality criterion**: Kicker could stand alone as a tweet.

## Outputs

| Output | Path | Description |
|--------|------|-------------|
| Draft column | `output/draft.md` | Full draft with metadata header |
| Draft metadata | `output/draft-meta.md` | Framework, lede type, word count, confidence |

## Quality Gates

1. Lede captures attention and establishes stakes within 25 words.
2. Every paragraph advances the argument or provides necessary context.
3. All factual claims traceable to sources via citations.
4. Tone calibrated to topic confidence per `tone-calibration.md`.
5. Word count within target (800-1200 standard, 1500 max).
6. No more than 3 consecutive paragraphs without a concrete example or data point.
7. Kicker returns to opening energy and offers forward motion.
8. Self-edit resulted in at least one major deletion or rewrite.

## Failure Modes

### FM-1: Thin Research
- **Detection**: Intelligence brief has <3 confirmed signals or no clear angle
- **Recovery**: Pause drafting; invoke 01_source-intelligence with expanded parameters
- **Escalation**: If research remains thin after expansion, recommend postponing column

### FM-2: Voice Drift
- **Detection**: Draft reads like generic news summary or academic paper
- **Recovery**: Re-read `memory/voice-examples.md`; rewrite lede and kicker; scan for passive voice and abstractions
- **Escalation**: If drift persists across 2 drafts, flag for voice calibration review

### FM-3: Argument Collapse
- **Detection**: Body paragraphs contradict each other or fail to support thesis
- **Recovery**: Extract core thesis; test each paragraph against it; remove or reframe outliers
- **Escalation**: If thesis itself is unsound, abort and return to research phase

### FM-4: Citation Bloat
- **Detection**: Citations interrupt every sentence; reader experience degraded
- **Recovery**: Move secondary citations to endnotes; reserve inline for direct quotes and contested claims
- **Escalation**: If >20% of words are citation apparatus, recommend splitting into two columns
