# TRD 02 — Panel Detection Pipeline

## Layer
Vision

## Purpose
Detect individual panels within each comic page and determine their spatial coordinates and reading order. Panel detection is foundational — reading order, bubble detection, character context, and scene detection all depend on accurate panel boundaries.

---

## Process Flow

```
Page Image (from Pipeline 01)
 │
 ▼
┌──────────────────────────┐
│ 1. Page Layout Analysis   │
│                          │
│ - Classify page type:    │
│   - Standard grid        │
│   - Irregular layout     │
│   - Splash page (single  │
│     panel = full page)   │
│   - Double-page spread   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Panel Boundary Detect.│
│                          │
│ - Detect panel edges     │
│   (gutters, borders,     │
│    white space)          │
│ - Extract bounding box   │
│   coordinates for each   │
│   panel                  │
│ - Handle overlapping     │
│   panels                 │
│ - Handle non-rectangular │
│   panels (irregular      │
│   shapes, bleed panels)  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Panel Cropping        │
│                          │
│ - Crop each panel as a   │
│   separate image         │
│ - Store cropped panels   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Reading Order Assign. │
│   (within page)          │
│                          │
│ - Assign sequential      │
│   order to panels on     │
│   the page               │
│ - Western comics:        │
│   Left→Right, Top→Bottom │
│ - Handle ambiguous       │
│   layouts                │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Panel Metadata Storage│
│                          │
│ - Store per panel:       │
│   - Bounding box coords  │
│   - Page number          │
│   - Panel index (order)  │
│   - Panel type (standard │
│     /splash/bleed)       │
│   - Cropped image path   │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 03 Bubble Detection, 06 Character Detection, 08 Speaker Attribution, 10 Scene Detection
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Page images | PNG from S3 | 01 Ingestion |
| Page metadata | Page number, dimensions | 01 Ingestion |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Panel bounding boxes | Coordinates (x, y, w, h) per panel | 03, 06, 08 |
| Panel reading order | Sequential index per page | 03, 04, 10 |
| Cropped panel images | PNG in S3 | 03, 06, 08 |
| Panel type classification | Enum per panel | 10 Scene Detection |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Splash page (full-page art) | Detect as single panel. Entire page = 1 panel. |
| Double-page spread | Detect as single panel spanning two pages. Flag for page-ordering context. |
| Overlapping panels | Detect each panel independently. Overlapping regions assigned to foreground panel. |
| Non-rectangular panels (diagonal, circular) | Best-effort bounding box. Include panel type = "irregular". |
| Borderless panels (art bleeds to edge) | Detect via content boundaries rather than drawn borders. |
| No panels detected | Flag page as "needs review". Skip & continue. |

---

## Human Review
**Not required.** System must handle automatically. Failures are flagged for downstream review.

---

## Parallelism
Each page can be processed independently. Full page-level parallelism.

---

## Dependencies
- **Upstream:** 01 Ingestion (page images)
- **Downstream:** 03 Bubble Detection, 06 Character Detection, 04 Reading Order, 10 Scene Detection
