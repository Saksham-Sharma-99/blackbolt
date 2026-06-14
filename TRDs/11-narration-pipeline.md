# TRD 11 — Narration Pipeline

## Layer
Understanding

## Purpose
Generate minimal narration to fill gaps where the comic conveys information visually that would be lost in audio-only consumption. Narration supplements the comic — it never rewrites or editorializes. This pipeline is deliberately conservative.

---

## Process Flow

```
Scene Structure (from 10) + Dialogue Sequence (from 05/08) + Panel Content (from 02)
 │
 ▼
┌──────────────────────────┐
│ 1. Gap Detection          │
│                          │
│ Identify moments where   │
│ audio-only listeners     │
│ would lose context:      │
│                          │
│ - Silent panels (no      │
│   dialogue, no captions) │
│ - Scene transitions with │
│   no caption box         │
│ - Long action sequences  │
│   with no dialogue       │
│ - Location changes shown │
│   only visually          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Context Analysis       │
│                          │
│ - What is happening in   │
│   the panel visually?    │
│ - What information does  │
│   the listener need?     │
│ - Is existing dialogue   │
│   sufficient context?    │
│                          │
│ If existing dialogue is  │
│ sufficient → skip        │
│ narration for this gap   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Narration Need         │
│   Decision                │
│                          │
│ Generate narration ONLY  │
│ when:                    │
│ - Location context lost  │
│ - Action context lost    │
│ - Scene transition needs │
│   bridging               │
│                          │
│ DO NOT generate when:    │
│ - Dialogue already       │
│   provides context       │
│ - Visual-only moment is  │
│   atmospheric (silent    │
│   panels are valid)      │
│ - It would editorialize  │
│   beyond what the comic  │
│   shows                  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Narration Generation   │
│                          │
│ Generate minimal text:   │
│                          │
│ ALLOWED:                 │
│ "Spider-Man lands on     │
│  the rooftop."           │
│                          │
│ NOT ALLOWED:             │
│ "Spider-Man reflects on  │
│  the meaning of life..." │
│  (if comic doesn't       │
│   imply this)            │
│                          │
│ Rules:                   │
│ - Factual, brief         │
│ - Describes visible      │
│   action only            │
│ - Third person           │
│ - Present tense          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Script Insertion       │
│                          │
│ - Insert narration lines │
│   at correct position in │
│   the dialogue sequence  │
│ - Mark as speaker:       │
│   "Narrator"             │
│ - Mark emotion: Calm     │
│ - Assign sequence index  │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 14 Dialogue Production (narration is voiced by Narrator voice)
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Scene definitions | Page ranges, descriptions | 10 Scene Detection |
| Dialogue sequence | Ordered dialogue lines with speakers | 05 OCR, 08 Speaker Attribution |
| Panel images/content | Visual context | 02 Panel Detection |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Narration lines | Text lines with "Narrator" speaker, inserted into dialogue sequence | 14 Dialogue Production |
| Updated dialogue sequence | Original dialogue + narration interleaved | 14, 16 Audio Stitching |

---

## Core Rule
**Narration supplements. Never rewrites.**

| Allowed | Not Allowed |
|---------|-------------|
| "Spider-Man lands on the rooftop." | "Spider-Man ponders his destiny." |
| "The Daily Bugle, morning." | "A typical chaotic morning at the Bugle." |
| "Green Goblin appears behind him." | "The villain's dark plan unfolds." |
| (Silence — no narration needed) | Adding narration to fill every gap |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Silent panel (Spider-Man swinging) | No narration. Ambient audio only. Silent panels are valid. |
| Location change with no caption | May generate: "At the Daily Bugle." Only if context would be lost. |
| Long action sequence (fight) | Minimal narration at most. Sound effects + ambient carry the scene. |
| Caption box already exists in comic | Use the existing caption text. Do not add more. |
| Scene transition between two scenes | May generate brief bridging narration if no comic caption exists. |

---

## Human Review
**Optional.** Narration lines appear in the Scene Editor and can be edited, removed, or rewritten by the producer.

---

## Dependencies
- **Upstream:** 05 OCR, 08 Speaker Attribution, 10 Scene Detection, 02 Panel Detection
- **Downstream:** 14 Dialogue Production
