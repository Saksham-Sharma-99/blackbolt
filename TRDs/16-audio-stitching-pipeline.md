# TRD 16 — Audio Stitching Pipeline

## Layer
Audio Production

## Purpose
Combine all audio assets for a scene — dialogue clips, music tracks, and ambient audio — into a single mixed audio production with proper timing, volume balancing, crossfades, and pauses. Also generate the synchronization manifest that maps audio timestamps to comic panels and dialogue lines.

---

## Process Flow

```
Dialogue Clips (from 14) + Music Track (from 13) + Ambient Track (from 15) + Timing Metadata
 │
 ▼
┌──────────────────────────┐
│ 1. Timeline Assembly      │
│                          │
│ - Place dialogue clips   │
│   in sequence based on   │
│   reading order          │
│ - Calculate total scene  │
│   duration               │
│ - Each clip gets a       │
│   start_time in the      │
│   scene timeline         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Pause Insertion        │
│                          │
│ - Insert natural pauses  │
│   between dialogue lines │
│ - Pause duration based   │
│   on:                    │
│   - Same speaker         │
│     continuing → short   │
│   - Speaker change →     │
│     medium pause         │
│   - Scene beat / dramatic│
│     moment → longer      │
│   - Panel transition →   │
│     slight pause         │
│ - Producer can adjust    │
│   pause lengths          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Music Layer            │
│                          │
│ - Overlay music track(s) │
│   on timeline            │
│ - Music starts at scene  │
│   beginning (or at       │
│   specified dialogue     │
│   index)                 │
│ - Apply volume from      │
│   music selection        │
│ - Add fade-in at start   │
│ - Add fade-out at end    │
│ - If multiple themes     │
│   within scene: crossfade│
│   between them           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Ambient Layer          │
│                          │
│ - Overlay ambient track  │
│   across entire scene    │
│   duration               │
│ - Ambient runs           │
│   continuously           │
│ - Lower volume during    │
│   dialogue               │
│ - Slightly higher during │
│   pauses/silent moments  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Volume Balancing       │
│                          │
│ Priority (loudest →      │
│ softest):                │
│ 1. Dialogue              │
│ 2. Music                 │
│ 3. Ambient               │
│                          │
│ - Dialogue must always   │
│   be clearly audible     │
│ - Duck music/ambient     │
│   during speech          │
│ - Normalize overall      │
│   output level           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Transitions &          │
│   Crossfades              │
│                          │
│ - Smooth transitions     │
│   between music themes   │
│ - Crossfade ambient if   │
│   environment changes    │
│   within scene           │
│ - Avoid hard cuts        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 7. Sync Manifest          │
│   Generation              │
│                          │
│ Create mapping:          │
│ - timestamp → panel      │
│ - timestamp → dialogue   │
│   line                   │
│ - timestamp → speaker    │
│ - timestamp → page       │
│                          │
│ This manifest powers:    │
│ - Comic auto-scroll      │
│ - Script highlight       │
│ - Seek functionality     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 8. Final Audio Export     │
│                          │
│ - Render final mixed     │
│   audio file for the     │
│   scene                  │
│ - Store to S3            │
│ - Store sync manifest    │
│   in DB                  │
│ - Mark scene as:         │
│   Ready For Review       │
└────────┬─────────────────┘
         │
         ▼
Output → Scene ready for review. Feeds into 17 Progressive Generation (status update), 19 Playback Sync
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Dialogue audio clips | Audio files from S3 | 14 Dialogue Production |
| Clip timing metadata | Duration, sequence index per clip | 14 Dialogue Production |
| Music track + volume | Audio file + volume level | 13 Music Selection |
| Ambient track + volume | Audio file + volume level | 15 Ambient Audio |
| Dialogue reading order | Global sequence | 04 Reading Order |
| Panel-dialogue associations | Which panels correspond to which dialogue | 02, 03, 04 |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Final mixed audio per scene | Audio file in S3 | 19 Playback Sync, Scene Review |
| Synchronization manifest | JSON mapping timestamps → panels/dialogue/pages | 19 Playback Sync |
| Scene duration | Milliseconds | 17 Progressive Generation, 18 Publishing |

---

## Volume Priority Stack

```
Layer 1 (loudest):  Dialogue clips         — always clearly audible
Layer 2 (medium):   Music                  — supports mood, never overpowers speech
Layer 3 (softest):  Ambient audio          — fills silence, background texture

During dialogue:    Music ducks, Ambient ducks
During pauses:      Music normal, Ambient slightly louder
During silent panel: Music normal, Ambient at full ambient volume
```

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Scene with no music | Dialogue + Ambient only. Valid. |
| Scene with no ambient | Dialogue + Music only. Valid. |
| Scene with no dialogue (silent/ambient only) | Music + Ambient. Scene still gets an audio track. |
| Very short scene (1-2 dialogue lines) | Still produce full scene audio. Short scenes are valid. |
| Very long scene (50+ lines) | Produce normally. Timeline grows accordingly. |
| Missing dialogue clip (TTS failure) | Insert silence gap. Flag in manifest. Scene flagged "needs review". |

---

## Human Review
**Scene Review.** Producer plays back the stitched scene and can:
- Edit dialogue (triggers single clip regeneration)
- Change music (triggers music-only regeneration)
- Adjust timing/pauses
- Approve or request changes

---

## Dependencies
- **Upstream:** 13 Music Selection, 14 Dialogue Production, 15 Ambient Audio, 04 Reading Order
- **Downstream:** 17 Progressive Generation, 19 Playback Sync
