# TRD 19 — Playback & Sync Pipeline

## Layer
Delivery

## Purpose
Power the viewer experience — synchronized playback of comic pages, script/dialogue, and audio. When audio plays, the comic auto-scrolls to the correct panel, the current dialogue is highlighted in the script, and the current speaker is shown. This pipeline handles all real-time synchronization, playback controls, and speed adjustments.

---

## Process Flow

```
Viewer opens blackbolt.app/p/{id}
 │
 ▼
┌──────────────────────────┐
│ 1. Experience Loading     │
│                          │
│ Load from Published      │
│ Experience:              │
│ - Comic page images      │
│ - Scene audio files      │
│ - Sync manifests         │
│ - Script data (speakers, │
│   dialogue text)         │
│ - Scene metadata         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Playback               │
│   Initialization          │
│                          │
│ - Load first scene audio │
│ - Display first comic    │
│   page                   │
│ - Display script panel   │
│   with first dialogue    │
│ - Initialize playback    │
│   state (paused or       │
│   auto-play based on     │
│   setting)               │
│ - Set default speed: 1.0x│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Audio Playback Engine  │
│                          │
│ - Play scene audio       │
│   sequentially           │
│ - Track current playback │
│   timestamp              │
│ - Handle scene            │
│   transitions            │
│   (scene 1 ends →        │
│    scene 2 begins)       │
│ - Apply playback speed   │
│   multiplier             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Comic Sync Engine      │
│                          │
│ Using sync manifest:     │
│                          │
│ As audio timestamp       │
│ advances:                │
│ - Scroll to correct page │
│ - Highlight current      │
│   panel                  │
│ - Highlight current      │
│   speech bubble (if      │
│   visible)               │
│ - Smooth scroll between  │
│   panels/pages           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Script Sync Engine     │
│                          │
│ As audio timestamp       │
│ advances:                │
│ - Highlight current      │
│   dialogue line          │
│ - Show current speaker   │
│   name                   │
│ - Auto-scroll script     │
│   panel to keep current  │
│   dialogue visible       │
│ - Dim past dialogue,     │
│   highlight current      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Playback Controls      │
│                          │
│ - Play / Pause           │
│ - Seek (scrub progress   │
│   bar to any timestamp)  │
│ - Playback Speed:        │
│   0.5x, 0.75x, 1.0x,    │
│   1.25x, 1.5x, 2.0x     │
│ - Speed changes must     │
│   maintain sync across   │
│   all three layers       │
│   (audio, comic, script) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 7. Seek Handling          │
│                          │
│ When viewer seeks:       │
│ - Jump audio to          │
│   timestamp              │
│ - Jump comic to          │
│   corresponding page/    │
│   panel                  │
│ - Jump script to         │
│   corresponding          │
│   dialogue line          │
│ - All three sync         │
│   instantly              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 8. Scene Transition       │
│   Handling                │
│                          │
│ When current scene ends: │
│ - Seamlessly transition  │
│   to next scene's audio  │
│ - Load next scene's      │
│   comic pages            │
│ - Load next scene's      │
│   script                 │
│ - No buffering gap       │
│   (preload next scene    │
│   during current scene)  │
└────────┴─────────────────┘
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Published Experience | DB record with asset refs | 18 Publishing |
| Comic page images | PNG from S3 | 01 Ingestion |
| Scene audio files | Audio from S3 | 16 Audio Stitching |
| Sync manifests | JSON (timestamp → panel/dialogue) | 16 Audio Stitching |
| Script data | Speaker, text, emotion per line | 05, 08, 09 |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Synchronized playback experience | UI render | Viewer |
| Playback state | Current timestamp, scene, speed | Comments system |

---

## Three-Layer Synchronization

```
Layer 1: Audio     ──── "Parker... I've known all along."  ──── timestamp: 00:42
                                    │
                                    ▼
Layer 2: Comic     ──── Page 22, Panel 3 highlighted       ──── same timestamp
                                    │
                                    ▼
Layer 3: Script    ──── "Green Goblin: Parker..." highlighted ── same timestamp
```

All three layers must remain in sync at all times, including during:
- Normal playback
- Speed changes (0.5x - 2.0x)
- Seek (jump to any point)
- Scene transitions
- Pause and resume

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Viewer changes speed to 1.5x | Audio plays faster. Script and comic timing adjust proportionally. Sync maintained. |
| Viewer seeks to middle of scene | All three layers jump to correct position simultaneously. |
| Scene transition | Preload next scene assets. Seamless audio transition. |
| Very long production (30+ minutes) | Progressive loading. Don't load all assets upfront. |
| Slow network | Buffer audio ahead. Show loading indicator if buffer runs dry. |
| Viewer shares at specific timestamp | URL can include timestamp parameter for deep-linking. |

---

## Dependencies
- **Upstream:** 18 Publishing (published experience data)
- **Downstream:** Comment system (timestamp context)
