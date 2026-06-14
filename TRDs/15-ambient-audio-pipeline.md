# TRD 15 — Ambient Audio Pipeline

## Layer
Audio Production

## Purpose
Create atmospheric background audio for each scene. Ambient audio fills the sonic space — city sounds during a rooftop conversation, office noise at the Daily Bugle, wind during a swinging sequence. Ambient audio supports the scene but never dominates dialogue or music.

---

## Process Flow

```
Scene Definitions (from 10) + Panel Content (from 02) + Silent Panels
 │
 ▼
┌──────────────────────────┐
│ 1. Environment            │
│   Classification          │
│                          │
│ Per scene:               │
│ - Analyze scene          │
│   description, location  │
│   cues, panel content    │
│ - Classify environment:  │
│   - Outdoor / Indoor     │
│   - Urban / Rural        │
│   - Specific locations   │
│     (office, rooftop,    │
│      street, lab, etc.)  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Ambient Sound Profile  │
│   Selection               │
│                          │
│ Map environment to       │
│ ambient layers:          │
│                          │
│ Rooftop:                 │
│ - Wind, distant traffic, │
│   city hum               │
│                          │
│ Daily Bugle Office:      │
│ - Phones, typing,        │
│   murmuring, HVAC        │
│                          │
│ City Street:             │
│ - Traffic, horns,        │
│   pedestrians, sirens    │
│                          │
│ Lab/Lair:                │
│ - Hum of equipment,      │
│   echoing, drips         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Silent Panel Handling  │
│                          │
│ - Identify panels with   │
│   no dialogue            │
│ - These moments get      │
│   ambient audio only     │
│ - No narration added     │
│   (silent panels are     │
│   intentionally silent   │
│   of speech)             │
│ - Ambient fills the space│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Track Selection /      │
│   Generation              │
│                          │
│ - Select appropriate     │
│   ambient track from     │
│   library                │
│ - OR generate ambient    │
│   audio if needed        │
│ - Track duration should  │
│   cover entire scene     │
│   length                 │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Volume Calibration     │
│                          │
│ - Set ambient volume     │
│   low enough to not      │
│   interfere with         │
│   dialogue or music      │
│ - Typical: 15-30%        │
│ - Slightly louder during │
│   silent panels          │
│   (ambient is the only   │
│   audio)                 │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Track Storage          │
│                          │
│ - Store ambient track    │
│   to S3                  │
│ - Associate with scene   │
│ - Store volume metadata  │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 16 Audio Stitching
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Scene definitions | Description, location cues, page ranges | 10 Scene Detection |
| Panel content | Visual context, backgrounds | 02 Panel Detection |
| Silent panel flags | Panels with no dialogue | 03 Bubble Detection / 05 OCR |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Ambient audio track per scene | Audio file in S3 | 16 Audio Stitching |
| Volume metadata | Volume level, per-segment adjustments | 16 Audio Stitching |

---

## Environment → Ambient Mapping Examples

| Environment | Ambient Layers |
|-------------|---------------|
| City rooftop | Wind, distant traffic, city hum |
| Office (Daily Bugle) | Phones ringing, keyboard typing, murmuring, HVAC |
| Street | Traffic, car horns, pedestrians, distant sirens |
| Alley | Echo, dripping, distant muffled sounds |
| Lab / Villain Lair | Equipment hum, echoes, electrical buzzing |
| Apartment | Muffled street noise, clock, room tone |
| Swinging through city | Rushing wind, whoosh, distant street noise |

---

## Core Principle
**Ambient audio supports. Never dominates.**

- Dialogue should always be clearly audible over ambient
- Music takes priority over ambient
- Ambient fills the silence, does not compete with content

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Unidentifiable location | Use generic "room tone" — minimal, neutral ambient. |
| Scene spans multiple locations | May need ambient transition. Use crossfade between environments. |
| Silent panel (no dialogue) | Ambient volume slightly increases. This is the primary audio. |
| Fight scene | Ambient may include impact sounds, but major SFX are separate concern. |
| No ambient needed (dialogue-heavy indoor scene) | Minimal room tone. Ambient can be very subtle. |

---

## Human Review
**Not directly reviewed.** Ambient audio is part of the overall scene audio. Producer hears it during Scene Review playback. No dedicated ambient editing UI in V1.

---

## Dependencies
- **Upstream:** 02 Panel Detection, 10 Scene Detection
- **Downstream:** 16 Audio Stitching
