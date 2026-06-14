# TRD 01 — Ingestion Pipeline

## Layer
Ingestion

## Purpose
Convert uploaded comic files into normalized, ordered page images and create the project record. This is the entry point for all BLACKBOLT projects.

---

## Process Flow

```
User Uploads File(s)
 │
 ▼
┌─────────────────────┐
│ 1. Format Detection  │
│                     │
│ Identify file type: │
│ - Single Image      │
│ - Multiple Images   │
│ - PDF               │
│ - CBZ               │
│ - CBR               │
│ - Mixed upload      │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 2. Validation       │
│                     │
│ - File size limits  │
│ - Format supported? │
│ - File corrupted?   │
│ - Remove unsupported│
│   files from mixed  │
│   uploads           │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 3.Archive Extraction│
│                     │
│ CBZ → unzip         │
│ CBR → unrar         │
│ PDF → page-to-image │
│ Images → pass-thru  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 4.Page Normalization│
│                     │
│ - Convert all to    │
│   consistent format │
│   (e.g., PNG)       │
│ - Normalize DPI/    │
│   resolution        │
│ - Handle mixed      │
│   image formats     │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 5. Page Ordering    │
│                     │
│ - Sort by filename  │
│   convention        │
│ - Handle out-of-    │
│   order pages       │
│ - Detect and handle │
│   double-page       │
│   spreads           │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 6. Metadata Extract.│
│                     │
│ - Page count        │
│ - Image dimensions  │
│ - Archive metadata  │
│   (if available)    │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 7. Duplicate Detect.│
│                     │
│ - Hash page images  │
│ - Compare against   │
│   existing projects │
│ - Flag if same comic│
│   already uploaded  │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 8. Fork Detection   │
│                     │
│ - If duplicate found│
│   offer Fork instead│
│   of new project    │
│ - Fork inherits:    │
│   characters, voices│
│   scripts, scenes   │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 9. Project Creation │
│                     │
│ - Create Project    │
│   record in DB      │
│ - Set status: Draft │
│ - Associate pages   │
│ - Store user/       │
│   workspace context │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ 10. Page Storage    │
│                     │
│ - Upload normalized │
│   pages to S3       │
│ - Store S3 paths in │
│   project record    │
│ - Transition project│
│   status: Analyzing │
└────────┬────────────┘
         │
         ▼
Trigger Layer 2 pipelines (02 Panel Detection, 06 Character Detection)
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Comic file(s) | CBZ, CBR, PDF, JPG, PNG | User upload |
| Project name | String | User input |
| Workspace context | ID | Session/auth |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Ordered page images | PNG files in S3 | 02 Panel Detection, 06 Character Detection |
| Project record | DB document | All downstream pipelines |
| Page metadata | DB document | 02, 04, 10 |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Corrupt archive | Fail with clear error. User retries upload. |
| Missing pages (gaps in numbering) | Proceed with available pages. Flag gap in metadata. |
| Out-of-order filenames | Best-effort sort. Flag for user if ambiguous. |
| Duplicate upload (same comic) | Offer Fork option. User decides. |
| Mixed file types in upload | Filter unsupported files. Proceed with valid ones. |
| Extremely large file | Enforce size limit. Reject with message. |
| Zero valid pages extracted | Fail project creation. User retries. |

---

## State Transitions

| From | To | Trigger |
|------|----|---------|
| (none) | Draft | Project record created |
| Draft | Analyzing | Pages stored, downstream pipelines triggered |

---

## Dependencies
- **Upstream:** None (entry point)
- **Downstream:** 02 Panel Detection, 06 Character Detection
