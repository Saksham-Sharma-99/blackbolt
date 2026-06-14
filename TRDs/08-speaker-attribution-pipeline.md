# TRD 08 — Speaker Attribution Pipeline

## Layer
Understanding

## Purpose
Determine which character spoke each line of dialogue. This is described in the PRD as "arguably the hardest AI problem" in BLACKBOLT. It combines spatial analysis (bubble tail direction, character proximity), content analysis (dialogue text), and context (reading order, scene) to attribute each bubble to a speaker.

---

## Process Flow

```
Bubbles (from 03) + Characters per panel (from 06/07) + OCR text (from 05) + Reading Order (from 04)
 │
 ▼
┌──────────────────────────┐
│ 1. Tail Vector Analysis   │
│                          │
│ - For each dialogue      │
│   bubble with a tail:    │
│ - Calculate tail         │
│   direction vector       │
│ - Identify which         │
│   character the tail     │
│   points toward          │
│ - Score: direct/near/    │
│   ambiguous              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Proximity Analysis     │
│                          │
│ - Calculate distance     │
│   from bubble to each    │
│   character in the panel │
│ - Nearest character is   │
│   a candidate            │
│ - Weight by position     │
│   (above character's     │
│   head = strong signal)  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Content Analysis       │
│                          │
│ - Analyze dialogue text  │
│   for speaker clues:     │
│   - Names mentioned      │
│     ("Parker..." likely  │
│      NOT Parker speaking)│
│   - Tone/vocabulary      │
│     matching character   │
│     patterns             │
│   - Conversational       │
│     context (response    │
│     to previous line)    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Reading Order Context  │
│                          │
│ - Consider conversation  │
│   flow:                  │
│   - Alternating speakers │
│     in dialogue          │
│   - Response patterns    │
│   - Who was addressed    │
│     in the previous line │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Signal Aggregation     │
│                          │
│ - Combine all signals:   │
│   - Tail vector          │
│   - Proximity            │
│   - Content analysis     │
│   - Reading order context│
│ - Weight signals and     │
│   select best candidate  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Confidence Scoring     │
│                          │
│ - Score attribution      │
│   confidence (0-100%)    │
│ - High confidence:       │
│   tail + proximity +     │
│   content all agree      │
│ - Low confidence:        │
│   signals conflict or    │
│   are ambiguous          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 7. Attribution Routing    │
│                          │
│ High confidence:         │
│ → Assign speaker         │
│                          │
│ Low confidence:          │
│ → Flag for producer      │
│   review with options:   │
│   "Who is speaking?"     │
│   ○ Character A          │
│   ○ Character B          │
│                          │
│ Never silently guess.    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 8. Special Case Handling  │
│                          │
│ - Caption/Narration box: │
│   → Assign to "Narrator" │
│ - Thought bubble:        │
│   → Assign to nearest    │
│     character (thinking) │
│ - Sound effect:          │
│   → No speaker. Tag as   │
│     SFX.                 │
│ - Off-panel speaker:     │
│   → Content analysis     │
│     only. Flag if unsure.│
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 09 Emotion Detection, 14 Dialogue Production, Script Assembly
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Bubble positions + types + tail vectors | Coordinates, enum, vectors | 03 Bubble Detection |
| Characters per panel | Character IDs + positions | 06/07 (post Character Review) |
| OCR text per bubble | String | 05 OCR |
| Global reading order | Sequence indices | 04 Reading Order |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Speaker assignment per dialogue line | Character ID per line | 09, 14, Script, Scene Editor |
| Confidence score per attribution | Float (0-100%) | Flagging logic |
| Flagged attributions | List of low-confidence lines with candidate options | Scene Editor UI |

---

## Attribution Signals (by weight)

| Signal | Strength | When Reliable |
|--------|----------|---------------|
| Tail direction | Strongest | Tail clearly points to one character |
| Character proximity | Strong | Bubble is directly above/near one character |
| Content analysis | Medium | Dialogue contains clear speaker clues |
| Reading order / conversation flow | Medium | Clear back-and-forth dialogue |
| Panel composition | Weak | Only one character in panel |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Two characters, one bubble, no clear tail | Flag for producer. Present both as options. |
| Single character in panel | Assign to that character (high confidence). |
| Off-panel speaker (voice from outside frame) | Content analysis + reading order only. Flag if unsure. |
| Narration box | Assign to "Narrator" (not a character — system role). |
| Internal monologue (thought bubble) | Assign to character nearest the thought trail. |
| Sound effect | No speaker. Mark as SFX. Used in ambient/production layer. |
| Crowd scene (5+ characters) | Tail direction is primary signal. Flag if ambiguous. |

---

## Human Review
**Mandatory for low-confidence attributions.** High-confidence attributions are auto-assigned but editable during Scene Review.

---

## Dependencies
- **Upstream:** 03 Bubble Detection, 04 Reading Order, 05 OCR, 07 Character Consolidation (approved cast)
- **Downstream:** 09 Emotion Detection, 14 Dialogue Production, Script assembly
