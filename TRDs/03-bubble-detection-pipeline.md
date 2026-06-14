# TRD 03 — Bubble Detection Pipeline

## Layer
Vision

## Purpose
Identify all speech bubbles, thought bubbles, caption boxes, narration boxes, and sound effects within each panel. Classify their type and detect tail direction (critical for speaker attribution).

---

## Process Flow

```
Panel Image (from Pipeline 02)
 │
 ▼
┌──────────────────────────┐
│ 1. Bubble/Box Detection   │
│                          │
│ - Scan panel for all     │
│   text-containing        │
│   elements               │
│ - Detect enclosed        │
│   regions (bubbles,      │
│   boxes, captions)       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Type Classification    │
│                          │
│ Classify each detected   │
│ element:                 │
│                          │
│ - Dialogue Bubble        │
│   (rounded, with tail)   │
│ - Thought Bubble         │
│   (cloud-shaped)         │
│ - Caption Box            │
│   (rectangular, no tail) │
│ - Narration Box          │
│   (rectangular, distinct │
│    styling)              │
│ - Sound Effect           │
│   (stylized text, no     │
│    enclosure)            │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Coordinate Extraction  │
│                          │
│ - Bounding box coords    │
│   for each bubble/box    │
│ - Position relative to   │
│   panel                  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Tail Direction Detect.│
│                          │
│ For Dialogue Bubbles:    │
│ - Detect tail/pointer    │
│ - Calculate direction    │
│   vector (which character│
│   the tail points toward)│
│                          │
│ For other types:         │
│ - No tail (caption,      │
│   narration, thought     │
│   bubbles have different │
│   pointer styles)        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Bubble-to-Panel Map   │
│                          │
│ - Associate each bubble  │
│   with its parent panel  │
│ - Handle bubbles that    │
│   span panel boundaries  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Bubble Image Cropping │
│                          │
│ - Crop each bubble as    │
│   separate image         │
│ - Store for OCR input    │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 04 Reading Order, 05 OCR, 08 Speaker Attribution
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Cropped panel images | PNG from S3 | 02 Panel Detection |
| Panel metadata | Coordinates, page number, panel index | 02 Panel Detection |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Bubble bounding boxes | Coordinates per bubble | 04 Reading Order, 05 OCR |
| Bubble type | Enum (dialogue/thought/caption/narration/sfx) | 04, 05, 08 |
| Tail direction vector | Angle/vector per dialogue bubble | 08 Speaker Attribution |
| Panel-bubble associations | Mapping | 04, 08 |
| Cropped bubble images | PNG in S3 | 05 OCR |

---

## Bubble Types

| Type | Visual Characteristics | Has Tail | Contains |
|------|----------------------|----------|----------|
| Dialogue Bubble | Rounded/oval, white fill | Yes — points to speaker | Character speech |
| Thought Bubble | Cloud-shaped, dotted trail | Dot trail toward thinker | Internal monologue |
| Caption Box | Rectangular, colored/bordered | No | Narration, location, time |
| Narration Box | Rectangular, distinct styling | No | Story narration |
| Sound Effect | Stylized text, no enclosure | No | "THWIP", "BOOM", etc. |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Bubble spans two panels | Assign to the panel containing most of the bubble area. |
| Multiple tails on one bubble | Record all tail directions. Multiple speakers possible. |
| No tail detected on dialogue bubble | Flag bubble — tail direction = unknown. Speaker Attribution will use other signals. |
| Overlapping bubbles | Detect each independently. Ordering handled by Reading Order pipeline. |
| Sound effects without enclosure | Detect via text styling analysis (large, stylized, colored text). |
| Very small bubble (single letter) | Still detect. OCR will handle. |

---

## Human Review
**Not required.** Automatic. Failures surface during Scene Review when script is incorrect.

---

## Parallelism
Each panel can be processed independently. Full panel-level parallelism.

---

## Dependencies
- **Upstream:** 02 Panel Detection (panel images)
- **Downstream:** 04 Reading Order, 05 OCR, 08 Speaker Attribution
