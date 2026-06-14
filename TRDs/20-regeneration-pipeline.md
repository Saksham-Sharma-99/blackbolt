# TRD 20 — Regeneration Pipeline

## Layer
Orchestration

## Purpose
Handle selective regeneration when a producer edits something after initial generation. BLACKBOLT never regenerates entire projects unnecessarily. This pipeline performs impact analysis to determine exactly which assets need to be re-produced, then re-enters only the affected pipelines with the minimum scope.

---

## Process Flow

```
Producer makes an edit (voice, dialogue, emotion, music, scene boundary)
 │
 ▼
┌──────────────────────────┐
│ 1. Edit Event Detection   │
│                          │
│ Classify the edit type:  │
│                          │
│ A. Dialogue text change  │
│ B. Speaker change        │
│ C. Emotion change        │
│ D. Voice change          │
│ E. Music theme change    │
│ F. Music volume change   │
│ G. Scene boundary change │
│ H. Character rename      │
│ I. Pause length change   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Impact Analysis        │
│                          │
│ Determine blast radius:  │
│                          │
│ A. Dialogue text →       │
│    Single clip only      │
│                          │
│ B. Speaker change →      │
│    Single clip (new      │
│    voice for that line)  │
│                          │
│ C. Emotion change →      │
│    Single clip only      │
│                          │
│ D. Voice change →        │
│    ALL clips for that    │
│    character across ALL  │
│    scenes they appear in │
│                          │
│ E. Music theme change →  │
│    Music asset for that  │
│    scene only. Dialogue  │
│    untouched.            │
│                          │
│ F. Volume change →       │
│    Re-stitch only. No    │
│    regeneration needed.  │
│                          │
│ G. Scene boundary →      │
│    Affected scenes       │
│    re-structured. May    │
│    need full scene       │
│    regeneration.         │
│                          │
│ H. Character rename →    │
│    Metadata update only. │
│    No audio regeneration │
│    (voice stays same).   │
│                          │
│ I. Pause length →        │
│    Re-stitch only. No    │
│    clip regeneration.    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Affected Asset         │
│   Identification          │
│                          │
│ Build list of exactly    │
│ which assets need        │
│ regeneration:            │
│                          │
│ - Specific dialogue clip │
│   IDs                    │
│ - Specific scene IDs     │
│ - Specific music         │
│   segments               │
│ - Re-stitch requirements │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Selective Re-queue     │
│                          │
│ Re-enter only the needed │
│ pipelines:               │
│                          │
│ - Dialogue text change → │
│   Re-enter pipeline 14   │
│   (TTS) for that clip    │
│   Then pipeline 16       │
│   (re-stitch scene)      │
│                          │
│ - Voice change →         │
│   Re-enter pipeline 14   │
│   for all affected clips │
│   Then pipeline 16 for   │
│   all affected scenes    │
│                          │
│ - Music change →         │
│   Re-enter pipeline 16   │
│   (re-stitch with new    │
│    music) for that scene │
│                          │
│ - Scene boundary →       │
│   Re-enter pipeline 10   │
│   (scene restructure)    │
│   Then full production   │
│   for affected scenes    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Regeneration           │
│   Execution               │
│                          │
│ - Run affected pipelines │
│ - Mark affected scenes   │
│   as: Regenerating       │
│ - Broadcast status via   │
│   WebSocket              │
│ - Other scenes remain    │
│   unaffected             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Merge Back             │
│                          │
│ - Replace old assets     │
│   with regenerated ones  │
│ - Update sync manifest   │
│ - Update scene duration  │
│ - Mark scene as:         │
│   Ready For Review       │
│   (if was approved,      │
│    returns to review)    │
└────────┬─────────────────┘
         │
         ▼
Scene returns to review. Producer re-approves.
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Edit event | Type + changed data | Scene Editor UI |
| Current project state | All assets, scenes, characters | Project record |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Regenerated assets | New audio clips / stitched audio in S3 | Replaces old assets |
| Updated sync manifest | New timestamp mappings | 19 Playback Sync |
| Status updates | WebSocket events | Frontend UI |

---

## Regeneration Scope Matrix

| Edit Type | Regenerates | Does NOT Regenerate |
|-----------|-------------|---------------------|
| Dialogue text (1 line) | That 1 TTS clip + scene re-stitch | All other clips, other scenes |
| Speaker change (1 line) | That 1 TTS clip + scene re-stitch | All other clips, other scenes |
| Emotion change (1 line) | That 1 TTS clip + scene re-stitch | All other clips, other scenes |
| Voice change (character) | ALL clips for that character + affected scene re-stitches | Clips for other characters, unaffected scenes |
| Music theme change | Scene re-stitch with new music | All dialogue clips, other scenes |
| Volume change | Scene re-stitch only | All clips (no regeneration) |
| Pause length change | Scene re-stitch only | All clips (no regeneration) |
| Scene boundary edit | Full production for affected scenes | Unaffected scenes |
| Character rename | Nothing (metadata update) | Everything (no audio change) |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Multiple edits in quick succession | Batch/debounce edits. Don't regenerate after every keystroke. Wait for explicit save. |
| Edit to already-published project | Regeneration affects project. Published version stays frozen until re-publish. |
| Voice change affects 10+ scenes | Queue all affected scenes for regeneration. Process in parallel. Progressive status updates. |
| Edit during ongoing generation | Queue the regeneration. Don't interrupt in-progress generation. |
| Producer edits, then edits again before regeneration completes | Cancel in-progress regeneration for that item. Start new one with latest edit. |

---

## Core Principle
**Minimum blast radius.** Always regenerate the smallest possible set of assets. A single dialogue text change should never cause an entire project to regenerate.

---

## Dependencies
- **Upstream:** Scene Editor UI (edit events)
- **Downstream:** Re-enters pipelines 14, 15, 16 (or 10 for scene boundary changes)
