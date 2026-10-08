# Reference: Extraction Patterns

## Patterns for Extracting Data from Different Source Formats

This document defines the structured extraction patterns used by the Source Intelligence skill. Each pattern specifies what to look for, how to parse it, and how to handle failures.

---

### Pattern A: Standard HTML Article

**Applies to**: Most news sites, blogs with semantic markup

**Target structure**:
```html
<article>
  <h1>{headline}</h1>
  <time datetime="{ISO_date}">{display_date}</time>
  <address>{byline}</address>
  <div class="content">{body}</div>
</article>
```

**Extraction rules**:
1. Headline: first `<h1>` within `<article>` or `<main>`
2. Date: `datetime` attribute of `<time>` or meta tag `article:published_time`
3. Author: `<address>`, `<span class="author">`, or meta tag `author`
4. Body: text content of `<article>` or `<div class="content">`, excluding ads and comments

**Failure fallback**: If `<article>` missing, use Readability-style extraction (largest text block).

---

### Pattern B: JSON-LD Structured Data

**Applies to**: Sites using Schema.org NewsArticle markup

**Target structure**:
```json
{
  "@type": "NewsArticle",
  "headline": "...",
  "datePublished": "...",
  "author": {"name": "..."},
  "articleBody": "..."
}
```

**Extraction rules**:
1. Parse all `<script type="application/ld+json">` tags
2. Find object with `@type` containing `NewsArticle` or `Article`
3. Extract `headline`, `datePublished`, `author.name`, `articleBody`

**Failure fallback**: If JSON-LD malformed, fall back to Pattern A.

---

### Pattern C: RSS / Atom Feed

**Applies to**: RSS feeds, Atom feeds, JSON feeds

**Target structure**:
```xml
<item>
  <title>{headline}</title>
  <link>{url}</link>
  <pubDate>{date}</pubDate>
  <description>{summary}</description>
</item>
```

**Extraction rules**:
1. Parse feed XML
2. For each item: extract title, link, pubDate, description
3. Follow link to original article for full body extraction
4. Use feed data as metadata fallback

**Failure fallback**: If feed down, attempt direct site scrape using Pattern A.

---

### Pattern D: PDF Document

**Applies to**: Government reports, academic papers, whitepapers

**Extraction rules**:
1. Extract text using PDF text layer
2. First page: title, author, date, issuing body
3. Executive summary or abstract: first 500 words after title page
4. Tables: preserve structure as markdown tables
5. Page numbers: strip from body text

**Failure fallback**: If text layer missing, flag for OCR and queue for manual processing.

---

### Pattern E: API Response

**Applies to**: News APIs, social media APIs, data endpoints

**Extraction rules**:
1. Parse JSON response
2. Map API fields to standard signal schema:
   - `title` -> headline
   - `published_at` -> date
   - `url` -> source URL
   - `content` or `summary` -> body
3. Handle pagination (follow `next` links or offset parameters)
4. Respect rate limits (exponential backoff)

**Failure fallback**: If API returns error, cache last good response and retry with backoff.

---

### Pattern F: Newsletter Email

**Applies to**: Email-based newsletters in archive format

**Extraction rules**:
1. Extract plain text or HTML body
2. Subject line -> headline
3. Sender -> author/source
4. Date header -> publish date
5. Remove unsubscribe links and footer boilerplate

**Failure fallback**: If multipart MIME, prefer `text/html` part.

---

### Quality Checks for All Patterns

1. Extracted date must parse to a valid calendar date within last 10 years
2. Headline must be between 10 and 300 characters
3. Body must contain at least 100 characters
4. URL must be a valid HTTP(S) URL
5. If any check fails, flag signal as "low-confidence" and log pattern used
