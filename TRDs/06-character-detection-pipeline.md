# TRD 06 — Character Detection Pipeline

## Layer
Understanding

## Purpose
Identify which characters appear in the comic by analyzing panel images. Match detected characters against the Character Registry for returning users. Label unrecognized characters as "Unknown Male/Female".

**NOTE: Model approach is TBD. This document defines the flow and interface only — the detection model architecture will be designed separately.**

---

## Process Flow

```
Panel Images (from Pipeline 02) + Character Registry
 │
 ▼
┌──────────────────────────┐
│ 1. Figure Detection       │
│                          │
│ - Detect humanoid/       │
│   character figures in   │
│   each panel             │
│ - Extract bounding boxes │
│   around each figure     │
│ - Handle partial figures │
│   (face only, hand only) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Feature Extraction     │
│                          │
│ - Extract visual features│
│   for each detected      │
│   figure                 │
│ - Costume, colors, body  │
│   shape, mask, symbols   │
│ - Crop reference images  │
│   for each character     │
│   candidate              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Within-Issue Clustering│
│                          │
│ - Group figures that     │
│   appear to be the same  │
│   character across       │
│   different panels       │
│ - Cluster by visual      │
│   similarity             │
│ - Each cluster = one     │
│   character candidate    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Registry Matching      │
│                          │
│ - Compare candidates     │
│   against Character      │
│   Registry entries       │
│ - If match found:        │
│   assign registry name   │
│   + voice                │
│ - If no match:           │
│   label as "Unknown      │
│   Male" / "Unknown       │
│   Female"                │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Confidence Scoring     │
│                          │
│ - Score each candidate:  │
│   - Cluster cohesion     │
│   - Registry match       │
│     confidence           │
│   - Number of            │
│     appearances          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Character Candidate    │
│   List Assembly           │
│                          │
│ - Per character:         │
│   - Name (or Unknown)    │
│   - Reference images     │
│     (gallery)            │
│   - Panels appeared in   │
│   - Confidence score     │
│   - Registry match (if   │
│     any)                 │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 07 Character Consolidation
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Cropped panel images | PNG from S3 | 02 Panel Detection |
| Panel metadata | Coordinates, page/panel indices | 02 Panel Detection |
| Character Registry | DB records (name, images, voice) | Workspace |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Character candidates | List of candidates with images, panel refs, confidence | 07 Character Consolidation |
| Character-panel associations | Which characters appear in which panels | 08 Speaker Attribution |
| Reference image galleries | Cropped images per character in S3 | Character Review UI |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Character in costume vs. civilian clothing | Clustering should identify as same person if visual overlap exists. Otherwise, two candidates (consolidated in pipeline 07). |
| Background/crowd characters | Detect but assign low importance. May be filtered as minor characters. |
| Non-human characters (animals, robots) | Detect as characters. Label appropriately. |
| Character partially obscured | Detect with lower confidence. Include in clustering. |
| Same character drawn by different artists | Within single issue this shouldn't happen. Cross-issue handled by Registry. |
| No characters detected in a panel | Valid (establishing shots, backgrounds). No candidate generated. |

---

## Human Review
**Mandatory.** Character Detection output always goes through Character Review (pipeline 07 → Human Review Gate). Producer must approve, rename, merge, or reject each candidate.

---

## Parallelism
Panel-level parallelism for figure detection. Clustering is a cross-panel operation (runs after all panels are processed).

---

## Dependencies
- **Upstream:** 01 Ingestion (page images), 02 Panel Detection (panel images), Character Registry
- **Downstream:** 07 Character Consolidation
