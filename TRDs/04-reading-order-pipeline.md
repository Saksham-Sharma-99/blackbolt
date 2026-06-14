# TRD 04 — Reading Order Pipeline

## Layer
Vision

## Purpose
Determine the correct sequential order of all dialogue across panels and pages. Incorrect reading order destroys the script, audio timing, and scene understanding. This pipeline establishes the global sequence that everything downstream depends on.

---

## Process Flow

```
Panel positions (from 02) + Bubble positions (from 03)
 │
 ▼
┌──────────────────────────┐
│ 1. Within-Panel Ordering  │
│                          │
│ For each panel:          │
│ - Order bubbles by       │
│   spatial position       │
│ - Western comics rule:   │
│   Top→Bottom,            │
│   Left→Right             │
│ - Handle vertical        │
│   stacking               │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Cross-Panel Ordering   │
│                          │
│ - Order panels within    │
│   each page (already     │
│   from pipeline 02)      │
│ - Interleave bubble      │
│   sequences from panel   │
│   order                  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Cross-Page Ordering    │
│                          │
│ - Chain page sequences   │
│   by page number         │
│ - Handle double-page     │
│   spreads (treated as    │
│   single reading unit)   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Global Sequence        │
│   Assembly                │
│                          │
│ - Assign global index    │
│   to every dialogue item │
│   across entire comic    │
│ - Sequence: 1, 2, 3...N  │
│ - Include bubble type    │
│   in sequence metadata   │
│   (dialogue vs caption   │
│    vs narration)         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Ambiguity Flagging     │
│                          │
│ - Flag sequences where   │
│   ordering is ambiguous  │
│   (modern non-linear     │
│    layouts)              │
│ - These surface during   │
│   Scene Review           │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 05 OCR (ordering context), 08 Speaker Attribution, 10 Scene Detection
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Panel positions + reading order | Coordinates, page-level index | 02 Panel Detection |
| Bubble positions + types | Coordinates within panels | 03 Bubble Detection |
| Page metadata | Page numbers, dimensions | 01 Ingestion |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Global dialogue sequence | Ordered list with global index per bubble | 05 OCR, 08 Speaker Attribution, 10 Scene Detection |
| Ambiguity flags | Flag per sequence segment | Surfaces in Scene Review |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Non-linear modern layout | Best-effort ordering. Flag ambiguous segments. |
| Narration box at top of page (applies to all panels below) | Position in sequence before first panel's dialogue. |
| Caption boxes between panels | Order based on spatial position relative to surrounding panels. |
| Double-page spread | Treat as single reading unit. Order left-to-right across both pages. |
| Single bubble on page | Trivial — index = 1 for that page's contribution. |

---

## Human Review
**Not required in V1.** Optional future feature. Errors surface during Scene Review when script order seems wrong.

---

## Parallelism
Pages can be ordered independently. Final cross-page assembly is sequential but fast (metadata-only operation).

---

## Dependencies
- **Upstream:** 02 Panel Detection, 03 Bubble Detection
- **Downstream:** 05 OCR, 08 Speaker Attribution, 10 Scene Detection
