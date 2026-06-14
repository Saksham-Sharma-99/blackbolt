# BLACKBOLT System Overview — Master Pipeline Map

## Document Purpose

This document provides a complete map of every pipeline in the BLACKBOLT system, how they connect, what data flows between them, and their dependencies. Each pipeline has its own dedicated TRD in this directory.

---

## System Architecture Layers

```
Comic File (CBZ/CBR/PDF/JPG/PNG)
 │
 ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: INGESTION                                         │
│  ┌───────────────────┐                                      │
│  │ 01 Ingestion      │ → Ordered Page Images + Project      │
│  └───────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: VISION (per page, parallelizable)                 │
│                                                             │
│  ┌───────────────────┐                                      │
│  │ 02 Panel Detection│ → Panel bounding boxes + order       │
│  └────────┬──────────┘                                      │
│           ▼                                                 │
│  ┌───────────────────┐                                      │
│  │ 03 Bubble Detect. │ → Bubble coords, types, tails       │
│  └────────┬──────────┘                                      │
│           ▼                                                 │
│  ┌───────────────────┐                                      │
│  │ 04 Reading Order  │ → Global dialogue sequence           │
│  └────────┬──────────┘                                      │
│           ▼                                                 │
│  ┌───────────────────┐                                      │
│  │ 05 OCR            │ → Raw text + confidence scores       │
│  └───────────────────┘                                      │
└─────────────────────────────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: COMIC UNDERSTANDING                               │
│                                                             │
│  ┌───────────────────┐    ┌───────────────────────┐         │
│  │ 06 Character Det. │ →  │ 07 Char Consolidation │         │
│  └───────────────────┘    └───────────┬───────────┘         │
│                                       ▼                     │
│                           ┌───────────────────────┐         │
│                           │    HUMAN REVIEW        │         │
│                           │    (Character Review)  │         │
│                           └───────────┬───────────┘         │
│                                       ▼                     │
│  ┌───────────────────┐    ┌───────────────────────┐         │
│  │ 08 Speaker Attrib.│    │ 10 Scene Detection    │         │
│  └────────┬──────────┘    └───────────┬───────────┘         │
│           ▼                           ▼                     │
│  ┌───────────────────┐    ┌───────────────────────┐         │
│  │ 09 Emotion Detect.│    │ 11 Narration          │         │
│  └───────────────────┘    └───────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: PRODUCTION SETUP                                   │
│                                                             │
│  ┌───────────────────┐    ┌───────────────────────┐         │
│  │ 12 Voice Assign.  │    │ 13 Music Selection    │         │
│  └───────────────────┘    └───────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 5: AUDIO PRODUCTION (per scene, parallelizable)      │
│                                                             │
│  ┌───────────────────┐    ┌───────────────────────┐         │
│  │ 14 Dialogue Prod. │    │ 15 Ambient Audio      │         │
│  │    (TTS)          │    │                       │         │
│  └────────┬──────────┘    └───────────┬───────────┘         │
│           │                           │                     │
│           └─────────┬─────────────────┘                     │
│                     ▼                                       │
│           ┌───────────────────┐                              │
│           │ 16 Audio Stitching│ → Final scene audio         │
│           └───────────────────┘                              │
└─────────────────────────────────────────────────────────────┘
 │
 ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 6: ORCHESTRATION & DELIVERY                           │
│                                                             │
│  ┌───────────────────┐    ┌───────────────────────┐         │
│  │ 17 Progressive    │    │ 20 Regeneration       │         │
│  │    Generation     │    │                       │         │
│  └───────────────────┘    └───────────────────────┘         │
│                                                             │
│  ┌───────────────────┐    ┌───────────────────────┐         │
│  │ 18 Publishing     │    │ 19 Playback & Sync    │         │
│  └───────────────────┘    └───────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

---

## Pipeline Dependency Graph

```
01 Ingestion
 └──▶ 02 Panel Detection
       └──▶ 03 Bubble Detection
             ├──▶ 04 Reading Order
             │     └──▶ 08 Speaker Attribution
             └──▶ 05 OCR
                   └──▶ 08 Speaker Attribution
                   └──▶ 09 Emotion Detection

 └──▶ 06 Character Detection
       └──▶ 07 Character Consolidation
             └──▶ [HUMAN REVIEW — mandatory]
                   ├──▶ 08 Speaker Attribution
                   ├──▶ 12 Voice Assignment
                   └──▶ 10 Scene Detection

10 Scene Detection ──▶ 11 Narration
10 Scene Detection ──▶ 13 Music Selection
10 Scene Detection ──▶ 17 Progressive Generation (scene queue)

12 Voice Assignment ──▶ 14 Dialogue Production (TTS)
08 Speaker Attrib.  ──▶ 14 Dialogue Production (TTS)
09 Emotion Detect.  ──▶ 14 Dialogue Production (TTS)

10 Scene Detection  ──▶ 15 Ambient Audio
13 Music Selection  ──▶ 16 Audio Stitching
14 Dialogue Prod.   ──▶ 16 Audio Stitching
15 Ambient Audio    ──▶ 16 Audio Stitching

16 Audio Stitching  ──▶ 17 Progressive Generation (scene complete)
17 Progressive Gen. ──▶ [HUMAN REVIEW — scene review]

All Scenes Approved ──▶ 18 Publishing
18 Publishing       ──▶ 19 Playback & Sync

User Edit Event     ──▶ 20 Regeneration ──▶ (re-enters relevant pipeline)
```

---

## Two Mandatory Human Review Gates

| Gate | When | What User Reviews | Blocks |
|------|------|-------------------|--------|
| **Character Review** | After pipelines 06 + 07 complete | Character identities, names, merges, voice assignments | All production (pipelines 08-16) |
| **Scene Review** | After each scene's audio is produced (pipeline 16) | Script, speaker attribution, dialogue, emotion, music | Publishing (pipeline 18) |

---

## Data Flow Summary

| Pipeline | Produces | Consumed By |
|----------|----------|-------------|
| 01 Ingestion | Ordered page images, project record | 02, 06 |
| 02 Panel Detection | Panel bounding boxes per page | 03, 06, 08, 10 |
| 03 Bubble Detection | Bubble coordinates, types, tail directions | 04, 05, 08 |
| 04 Reading Order | Global dialogue sequence | 05, 08, 10 |
| 05 OCR | Raw text per bubble + confidence | 08, 09, 10, 11 |
| 06 Character Detection | Character candidates per panel | 07 |
| 07 Character Consolidation | Deduplicated character list | Human Review → 08, 10, 12 |
| 08 Speaker Attribution | Speaker per dialogue line + confidence | 09, 14, Script assembly |
| 09 Emotion Detection | Emotion label per dialogue line | 14 |
| 10 Scene Detection | Scene definitions (page ranges, metadata) | 11, 13, 15, 17 |
| 11 Narration | Narration lines inserted into script | 14 |
| 12 Voice Assignment | Character → Voice mappings | 14 |
| 13 Music Selection | Music theme + volume per scene | 16 |
| 14 Dialogue Production | Audio clips + timing metadata | 16 |
| 15 Ambient Audio | Ambient tracks per scene | 16 |
| 16 Audio Stitching | Final mixed audio + sync manifest | 17, 19 |
| 17 Progressive Generation | Scene queue state, status events | WebSocket → Frontend |
| 18 Publishing | Published Experience + URL | 19 |
| 19 Playback & Sync | Synchronized viewer experience | End user |
| 20 Regeneration | Re-queued pipeline jobs | Re-enters 14, 15, 16 etc. |

---

## Parallelism Model

**Page-level parallelism (Layer 2):** Pipelines 02-05 can run on multiple pages simultaneously.

**Independent parallel tracks (Layer 3):** Character Detection (06-07) runs in parallel with Vision pipelines (02-05). Both must complete before Speaker Attribution (08).

**Scene-level parallelism (Layer 5):** Once scenes are defined, each scene's production (14, 15, 16) runs independently and in parallel.

**Progressive model:** Scene 1 production can complete and enter review while Scene 2+ are still generating.

---

## Failure Philosophy

Every pipeline follows **skip & flag**:
- Mark the failed item (bubble, character, scene) as "needs review"
- Continue processing everything else
- Never block the entire project on a single failure
- Producer resolves flagged items during review

---

## Pipeline Index

| # | Pipeline | TRD File | Layer |
|---|----------|----------|-------|
| 01 | Ingestion | `01-ingestion-pipeline.md` | Ingestion |
| 02 | Panel Detection | `02-panel-detection-pipeline.md` | Vision |
| 03 | Bubble Detection | `03-bubble-detection-pipeline.md` | Vision |
| 04 | Reading Order | `04-reading-order-pipeline.md` | Vision |
| 05 | OCR | `05-ocr-pipeline.md` | Vision |
| 06 | Character Detection | `06-character-detection-pipeline.md` | Understanding |
| 07 | Character Consolidation | `07-character-consolidation-pipeline.md` | Understanding |
| 08 | Speaker Attribution | `08-speaker-attribution-pipeline.md` | Understanding |
| 09 | Emotion Detection | `09-emotion-detection-pipeline.md` | Understanding |
| 10 | Scene Detection | `10-scene-detection-pipeline.md` | Understanding |
| 11 | Narration | `11-narration-pipeline.md` | Understanding |
| 12 | Voice Assignment | `12-voice-assignment-pipeline.md` | Production Setup |
| 13 | Music Selection | `13-music-selection-pipeline.md` | Production Setup |
| 14 | Dialogue Production (TTS) | `14-dialogue-production-pipeline.md` | Audio Production |
| 15 | Ambient Audio | `15-ambient-audio-pipeline.md` | Audio Production |
| 16 | Audio Stitching | `16-audio-stitching-pipeline.md` | Audio Production |
| 17 | Progressive Generation | `17-progressive-generation-pipeline.md` | Orchestration |
| 18 | Publishing | `18-publishing-pipeline.md` | Delivery |
| 19 | Playback & Sync | `19-playback-sync-pipeline.md` | Delivery |
| 20 | Regeneration | `20-regeneration-pipeline.md` | Orchestration |
