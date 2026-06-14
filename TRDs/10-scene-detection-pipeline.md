# TRD 10 — Scene Detection Pipeline

## Layer
Understanding

## Purpose
Break the entire comic issue into discrete scenes — the primary production unit in BLACKBOLT. Scenes enable progressive generation (produce scene-by-scene rather than entire issue) and provide the unit of editing, review, and publishing. Scene detection must identify meaningful narrative boundaries.

---

## Process Flow

```
All Pages + Panels (from 02) + Characters (from 07) + Dialogue (from 05) + Reading Order (from 04)
 │
 ▼
┌──────────────────────────┐
│ 1. Location Change        │
│   Detection               │
│                          │
│ - Analyze panel           │
│   backgrounds for         │
│   setting changes         │
│ - Indoor → Outdoor        │
│ - Different rooms/        │
│   buildings               │
│ - Caption boxes with      │
│   location hints          │
│   ("Meanwhile...",        │
│    "At the Daily Bugle")  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Character Group        │
│   Change Detection        │
│                          │
│ - Track which characters │
│   appear across panels   │
│ - Significant change in  │
│   character group =      │
│   potential scene break   │
│ - Example: Panels 1-8    │
│   have Spider-Man + MJ   │
│   Panels 9+ have         │
│   Spider-Man + Goblin    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Narrative Transition   │
│   Detection               │
│                          │
│ - Detect narrative cues: │
│   - "Meanwhile..."       │
│   - "Later that night..."│
│   - "Elsewhere..."       │
│   - Time skips            │
│ - Page break patterns    │
│   (full page transition)  │
│ - Tonal shifts in         │
│   dialogue                │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Scene Boundary         │
│   Proposal                │
│                          │
│ - Combine all signals:   │
│   location + characters  │
│   + narrative transitions│
│ - Propose scene breaks   │
│   at strongest boundary  │
│   points                 │
│ - Each scene = contiguous│
│   page range             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Scene Metadata         │
│   Generation              │
│                          │
│ Per scene:               │
│ - scene_id               │
│ - title (auto-generated  │
│   from content)          │
│ - start_page             │
│ - end_page               │
│ - description            │
│ - characters present     │
│ - dialogue count         │
│ - suggested music_theme  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Scene Queue Creation   │
│                          │
│ - Create scene records   │
│   in order               │
│ - Set all to status:     │
│   Queued                 │
│ - Feed into Progressive  │
│   Generation pipeline    │
│   (17)                   │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 11 Narration, 13 Music Selection, 15 Ambient Audio, 17 Progressive Generation
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| All panel images + metadata | Panel data per page | 02 Panel Detection |
| Approved character list | Character IDs, panel appearances | 07 Character Consolidation |
| Dialogue text | Ordered text per bubble | 05 OCR |
| Reading order | Global sequence | 04 Reading Order |
| Page metadata | Page numbers, count | 01 Ingestion |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Scene definitions | Page ranges, titles, descriptions | 11, 13, 15, 17 |
| Scene character lists | Characters per scene | 13, 14, 15 |
| Scene queue | Ordered scene records with status | 17 Progressive Generation |

---

## Scene Boundary Signals

| Signal | Strength | Example |
|--------|----------|---------|
| Location change | Strong | Daily Bugle → Rooftop |
| "Meanwhile..." caption | Strong | Explicit narrative transition |
| Character group change | Medium | Different characters appear |
| Page break after splash page | Medium | Dramatic moment often = scene end |
| Tonal shift in dialogue | Weak | Action → conversation |
| Time skip caption | Strong | "Later that night..." |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Entire issue is one continuous scene | Create single scene. Still valid. |
| Very short scene (1-2 pages) | Allow. Some scenes are brief. |
| Ambiguous boundary | Make a decision. Producer can edit scene boundaries in Scene Editor. |
| Flashback within a scene | Treat as same scene unless location/characters change significantly. |
| Intercut scenes (A-B-A-B cutting) | Each location segment = separate scene. |

---

## Human Review
**Allowed (optional).** Producer can:
- Split a scene into two scenes
- Merge two scenes into one
- Edit scene titles/descriptions
- Scene boundary edits trigger regeneration of affected scenes only

---

## Dependencies
- **Upstream:** 02 Panel Detection, 04 Reading Order, 05 OCR, 07 Character Consolidation
- **Downstream:** 11 Narration, 13 Music Selection, 15 Ambient Audio, 17 Progressive Generation
