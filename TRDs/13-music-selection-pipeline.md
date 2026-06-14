# TRD 13 — Music Selection Pipeline

## Layer
Production Setup

## Purpose
Assign a music theme to each scene (or dialogue range within a scene). Music sets the emotional atmosphere — a fight scene needs a different soundtrack than a romantic conversation. The system auto-selects based on scene content; the producer can override.

---

## Process Flow

```
Scene Definitions (from 10) + Dialogue Emotions (from 09) + Scene Descriptions
 │
 ▼
┌──────────────────────────┐
│ 1. Scene Content Analysis │
│                          │
│ Per scene:               │
│ - Analyze description    │
│ - Analyze characters     │
│   present                │
│ - Analyze dominant       │
│   emotions from dialogue │
│ - Analyze action content │
│   (fight, chase, reveal) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Theme Classification   │
│                          │
│ Map scene content to     │
│ music theme:             │
│                          │
│ - Hero Theme             │
│   (heroic moments,       │
│    victories)            │
│ - Suspense Theme         │
│   (reveals, tension,     │
│    stalking)             │
│ - Fight Theme            │
│   (action, combat)       │
│ - Romance Theme          │
│   (intimate moments,     │
│    love scenes)          │
│ - Investigation Theme    │
│   (detective work,       │
│    mystery)              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Scope Assignment       │
│                          │
│ - Assign theme to entire │
│   scene, or to specific  │
│   dialogue ranges within │
│   the scene              │
│ - A scene may have       │
│   multiple themes if     │
│   mood shifts            │
│   (e.g., conversation →  │
│    fight)                │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Volume Defaults        │
│                          │
│ - Set default volume     │
│   (0-100%)               │
│ - Music should support   │
│   dialogue, never        │
│   overpower it           │
│ - Typical range: 40-70%  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Music Segment Records  │
│                          │
│ Create music segments:   │
│ - theme                  │
│ - volume                 │
│ - start_dialogue index   │
│ - end_dialogue index     │
│ - scene_id               │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 16 Audio Stitching
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Scene definitions | Page ranges, descriptions, character lists | 10 Scene Detection |
| Dialogue emotions | Emotion labels per line | 09 Emotion Detection |
| Scene descriptions | Text descriptions | 10 Scene Detection |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Music theme per scene/range | Theme enum + volume | 16 Audio Stitching |
| Music segment records | DB documents | Scene Editor UI, 16 |

---

## Available Themes

| Theme | When to Use | Mood |
|-------|-------------|------|
| Hero Theme | Heroic moments, victories, saving someone | Uplifting, triumphant |
| Suspense Theme | Reveals, tension, villain scheming | Tense, building |
| Fight Theme | Action sequences, combat | Intense, fast |
| Romance Theme | Intimate moments, emotional conversations | Warm, tender |
| Investigation Theme | Detective work, mystery, discovering clues | Curious, measured |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Scene with mixed moods | Assign multiple music segments to dialogue ranges within the scene. |
| Silent scene (no dialogue, ambient only) | Still assign a theme. Music plays over ambient audio. |
| No clear mood match | Default to Investigation Theme (neutral/curious). |
| Producer changes music theme | Only music assets regenerate. Dialogue untouched. (Pipeline 20) |

---

## Human Review
**Optional.** Music selections are shown in the Scene Editor (right panel). Producer can:
- Change theme
- Adjust volume
- Remove music entirely
- Preview before committing

---

## Dependencies
- **Upstream:** 09 Emotion Detection, 10 Scene Detection
- **Downstream:** 16 Audio Stitching
