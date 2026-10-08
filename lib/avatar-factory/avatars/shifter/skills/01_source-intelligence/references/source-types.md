# Reference: Source Types

## How to Treat Each Source Type

Different information sources require different handling. This document defines extraction strategies, trust baselines, and update expectations for each category.

---

### News Site

**Examples**: Reuters, AP, BBC, national newspapers

**Treatment**:
- **Trust baseline**: High (Tier 1)
- **Extraction**: Full article text, headline, byline, publish date
- **Update frequency**: Real-time to hourly
- **Special handling**: Check for correction notices; prefer canonical URL; ignore comment sections
- **Citation format**: `Outlet Name, "Headline", Date, URL`

---

### Blog / Newsletter

**Examples**: Substack, Medium, company blogs

**Treatment**:
- **Trust baseline**: Medium (Tier 2)
- **Extraction**: Full post, author name, publish date, any embedded data/charts
- **Update frequency**: Daily to weekly
- **Special handling**: Distinguish opinion from reporting; note conflicts of interest; check author credentials
- **Citation format**: `Author Name, "Title", Blog Name, Date, URL`

---

### Government / Official Report

**Examples**: Ministry releases, regulatory filings, census data

**Treatment**:
- **Trust baseline**: High (Tier 1)
- **Extraction**: PDF or structured data, report date, issuing body, key findings table
- **Update frequency**: Monthly to annually
- **Special handling**: Note methodology; distinguish preliminary from final; watch for politically timed releases
- **Citation format**: `Issuing Body, "Report Title", Date, URL or Reference Number`

---

### Research Paper / Academic

**Examples**: arXiv, JSTOR, university repositories

**Treatment**:
- **Trust baseline**: High (Tier 1) for peer-reviewed; Medium (Tier 2) for preprints
- **Extraction**: Abstract, methodology, key findings, limitations, citation count
- **Update frequency**: Static (check for retractions)
- **Special handling**: Do not generalize beyond paper's scope; note sample size and methodology limits
- **Citation format**: `Author(s), "Title", Journal/Repository, Date, DOI/URL`

---

### Social Media / Forum

**Examples**: Twitter/X, Reddit, LinkedIn, WhatsApp channels

**Treatment**:
- **Trust baseline**: Low (Tier 3)
- **Extraction**: Post text, timestamp, engagement metrics, author handle
- **Update frequency**: Real-time
- **Special handling**: NEVER cite as primary source; use only as signal of sentiment or to flag emerging topics; screenshot and archive
- **Citation format**: `Platform, @handle, "Excerpt", Date, Archived URL`

---

### Podcast / Video

**Examples**: YouTube, Spotify, interview transcripts

**Treatment**:
- **Trust baseline**: Medium (Tier 2)
- **Extraction**: Transcript (if available), title, speaker names, publish date, key quotes
- **Update frequency**: Weekly
- **Special handling**: Distinguish scripted from improvised; note speaker expertise; transcribe key segments
- **Citation format**: `Show Name, "Episode Title", Speaker(s), Date, URL`

---

### Aggregator / RSS

**Examples**: Google News, Feedly, custom aggregators

**Treatment**:
- **Trust baseline**: Variable (inherit from linked source)
- **Extraction**: Link to original, headline, snippet
- **Update frequency**: Real-time
- **Special handling**: Always trace to original source; never cite aggregator as source
- **Citation format**: Follow original source format

---

### Source Type Decision Matrix

| Question | Action |
|----------|--------|
| Is this primary or secondary? | Primary = direct witness/data; Secondary = analysis/opinion |
| Is there a paywall? | Note access limitations; try archive.org; do not bypass illegally |
| Is the source known for corrections? | Check correction history; downgrade if pattern of retractions |
| Does the source have a stated bias? | Document bias in coverage DB; do not exclude solely for bias |
