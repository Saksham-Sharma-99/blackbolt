# TRD 05 — OCR Pipeline

## Layer
Vision

## Purpose
Extract text from each detected speech bubble, thought bubble, caption box, and narration box. Assign confidence scores to every extraction. High-confidence results are auto-approved; low-confidence results are flagged for producer review.

---

## Process Flow

```
Cropped Bubble Image (from Pipeline 03)
 │
 ▼
┌──────────────────────────┐
│ 1. Pre-processing         │
│                          │
│ - Clean bubble image     │
│ - Remove bubble border/  │
│   outline                │
│ - Enhance contrast       │
│ - Handle colored text    │
│   on colored backgrounds │
│ - Handle stylized fonts  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Text Extraction        │
│                          │
│ - Run OCR on cleaned     │
│   bubble image           │
│ - Extract raw text       │
│ - Preserve line breaks   │
│   where meaningful       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Confidence Scoring     │
│                          │
│ - Score extraction        │
│   confidence (0-100%)    │
│ - Based on:              │
│   - Character clarity    │
│   - Font regularity      │
│   - Image quality        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Confidence Routing     │
│                          │
│ High confidence (≥ X%):  │
│ → Auto-approve           │
│                          │
│ Low confidence (< X%):   │
│ → Flag as "Needs Review" │
│                          │
│ (Threshold X is          │
│  configurable)           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Text Cleanup           │
│                          │
│ - Fix common OCR errors  │
│   (0→O, l→I, etc.)      │
│ - Normalize whitespace   │
│ - Remove artifacts       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Dialogue Record        │
│   Creation                │
│                          │
│ - Create dialogue record │
│   with:                  │
│   - Raw text             │
│   - Confidence score     │
│   - Source bubble ref    │
│   - Global sequence idx  │
│   - Bubble type          │
│   - Flagged status       │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 08 Speaker Attribution, 09 Emotion Detection, 10 Scene Detection, 11 Narration
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Cropped bubble images | PNG from S3 | 03 Bubble Detection |
| Bubble type | Enum | 03 Bubble Detection |
| Global sequence index | Integer | 04 Reading Order |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Raw text per bubble | String | 08, 09, 10, 11 |
| Confidence score per bubble | Float (0-100%) | Flagging logic, Scene Review |
| Flagged status | Boolean | Scene Editor UI |
| Dialogue records | DB documents | All downstream |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Degraded/old scan (1960s comics) | Low confidence. Flag as "Needs Review". Producer fixes manually. |
| Stylized/hand-lettered fonts | Attempt extraction. Likely lower confidence. Flag if needed. |
| Text on colored background | Pre-processing enhances contrast. May still flag. |
| Sound effects (non-standard text) | Extract as-is. Bubble type = SFX distinguishes from dialogue. |
| Empty bubble (art-only, no text) | Return empty string. Flag for review. |
| Multi-language text | V1: English only. Non-English characters flagged. |
| All-caps comic text | Preserve as-is. Common in comics. |

---

## Human Review
**Automatic unless failure.** Low-confidence extractions appear as "Needs Review" in the Scene Editor. Producer can edit text manually or retry OCR.

---

## Parallelism
Each bubble can be OCR'd independently. Full bubble-level parallelism.

---

## Dependencies
- **Upstream:** 03 Bubble Detection (bubble images), 04 Reading Order (sequence index)
- **Downstream:** 08 Speaker Attribution, 09 Emotion Detection, 10 Scene Detection, 11 Narration
