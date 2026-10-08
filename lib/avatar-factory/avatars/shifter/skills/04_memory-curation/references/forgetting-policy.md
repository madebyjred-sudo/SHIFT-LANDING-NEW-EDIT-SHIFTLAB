# Reference: Forgetting Policy

## When and How to Remove Outdated Information

Memory without forgetting becomes noise. This document defines when and how Shifter's memory system removes or archives outdated knowledge.

---

### Principles

1. **Append-only by default**: Active memory files are append-only. Removal means moving to archive, not deletion.
2. **Versioned updates**: When confidence or status changes, add a new entry; do not silently overwrite.
3. **Justified forgetting**: Every removal must have a documented reason.
4. **Recoverable**: Archived knowledge must remain searchable for 12 months.

---

### Automatic Forgetting Triggers

The following trigger automatic archival:

| Trigger | Threshold | Action |
|---------|-----------|--------|
| Confidence decay | Score <0.2 for 30+ days | Archive to `memory/archive/low-confidence/` |
| Source death | Source unreachable for 90+ days with no replacement | Remove from active source registry; archive coverage data |
| Entity obsolescence | Entity dissolved or renamed for 180+ days | Archive entity node; create redirect to successor |
| Prediction expiry | Prediction date passed and outcome recorded | Archive to `memory/archive/predictions/` |
| Duplicate insight | Same insight recorded in 3+ places | Consolidate to canonical location; mark others as redirects |

---

### Manual Forgetting Triggers

These require operator approval:

| Trigger | Rationale |
|---------|-----------|
| Operator explicitly invalidates insight | Direct human judgment overrides system |
| Legal or ethical concern | Information should not be retained |
| Major system refactor | Memory structure changes; old format incompatible |
| Privacy request | Personal data needs removal per policy |

---

### Archival Process

1. **Identify**: Mark item for archival with reason and date
2. **Copy**: Write full item to archive with original timestamp and all history
3. **Cross-reference**: Add archive path to any active items that referenced this item
4. **Deprecate**: In active memory, replace content with deprecation notice:
   ```
   [DEPRECATED — moved to archive/XXXX on YYYY-MM-DD]
   Reason: [reason]
   See: [archive path]
   ```
5. **Verify**: Confirm archive is accessible and searchable
6. **Log**: Record operation in `memory/archive/log.md`

---

### Retention Schedule

| Archive Category | Retention Period | After Expiry |
|-----------------|------------------|--------------|
| Low-confidence insights | 12 months | Compress and move to cold storage |
| Source coverage data | 24 months | Summarize; discard raw logs |
| Entity graph versions | 12 months | Keep latest 4 versions permanently |
| Prediction outcomes | 36 months | Summarize accuracy statistics; discard details |
| Execution logs | 6 months | Summarize; discard raw logs |
| Feedback entries | 24 months | Anonymize; compress |

---

### Search and Recovery

Archived knowledge remains searchable via:

- `memory/archive/index.md`: Chronological index of all archived items
- `memory/archive/search-keywords.md`: Keyword-indexed reference
- Full-text search through compressed archives

Recovery process:
1. Search archive index for item
2. Retrieve from archive path
3. If reinstating: create new active entry with confidence 0.3, note recovery provenance
4. Do not simply "undelete"; treat recovered insight as new observation requiring validation

---

### Exceptions

The following are never forgotten, only updated:

- Shifter's core identity and voice definitions
- ICM architecture and skill system constitution
- Historical facts with permanent relevance (e.g., "Chile gained independence in 1810")
- Operator preferences explicitly marked as permanent

---

### Annual Memory Audit

Once per year, conduct a full audit:
1. Review all active memory files for staleness
2. Verify archive integrity
3. Check retention schedule compliance
4. Identify consolidation opportunities
5. Produce `memory/audit-report-YYYY.md`
