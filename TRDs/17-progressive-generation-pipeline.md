# TRD 17 — Progressive Generation Pipeline (Orchestration)

## Layer
Orchestration

## Purpose
Manage the end-to-end generation workflow across all scenes. This is the brain of BLACKBOLT's production system — it controls scene queueing, parallel generation, real-time status broadcasting, and coordinates the transition from analysis to production to review. The key principle: the producer should never wait for the entire comic to be processed before starting review.

---

## Process Flow

```
Scene Queue (from 10) + Approved Characters (from 07)
 │
 ▼
┌──────────────────────────┐
│ 1. Scene Prioritization   │
│                          │
│ - Order scenes by        │
│   sequence (Scene 1      │
│   first)                 │
│ - Scene 1 gets highest   │
│   priority so producer   │
│   can review ASAP        │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Parallel Scene         │
│   Generation              │
│                          │
│ - Start producing        │
│   multiple scenes in     │
│   parallel               │
│ - Scene 1 prioritized    │
│ - Scenes 2, 3, ...       │
│   processed concurrently │
│   based on available     │
│   resources              │
│                          │
│ Per scene, trigger:      │
│ - 08 Speaker Attribution │
│ - 09 Emotion Detection   │
│ - 11 Narration           │
│ - 13 Music Selection     │
│ - 14 Dialogue Production │
│ - 15 Ambient Audio       │
│ - 16 Audio Stitching     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Status Broadcasting    │
│                          │
│ Via WebSocket, broadcast │
│ to frontend:             │
│                          │
│ - Scene statuses:        │
│   ✓ Scene 1 Ready        │
│   ⟳ Scene 2 Generating   │
│   ◻ Scene 3 Queued       │
│   ◻ Scene 4 Queued       │
│                          │
│ - Pipeline progress      │
│   within each scene      │
│ - Estimated completion   │
│ - Error/flag             │
│   notifications          │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Scene Completion       │
│   Handling                │
│                          │
│ When a scene finishes:   │
│ - Mark status:           │
│   Ready For Review       │
│ - Notify frontend        │
│   (WebSocket)            │
│ - Scene becomes          │
│   immediately available  │
│   in Scene Editor        │
│ - Producer can review    │
│   while other scenes     │
│   continue generating    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Failure Isolation      │
│                          │
│ If a scene fails:        │
│ - Mark scene as          │
│   "Needs Attention"      │
│ - Continue generating    │
│   other scenes           │
│ - Never block entire     │
│   project on one scene's │
│   failure                │
│ - Producer can retry or  │
│   edit the failed scene  │
│   later                  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Background Processing  │
│                          │
│ - Generation continues   │
│   even if producer       │
│   leaves the page        │
│ - Even if browser is     │
│   closed                 │
│ - Producer returns later │
│   to find completed      │
│   scenes                 │
│ - Project state is       │
│   preserved              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 7. All Scenes Complete    │
│                          │
│ When all scenes reach    │
│ Ready For Review:        │
│ - Transition project     │
│   status: Scene Review   │
│   Required               │
│                          │
│ When all scenes Approved:│
│ - Transition project     │
│   status: Ready          │
│ - Publishing enabled     │
└────────┴─────────────────┘
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Scene definitions + queue | Ordered scene records | 10 Scene Detection |
| Approved characters + voices | Character data | 07, 12 |
| Dialogue with speakers + emotions | Complete script data | 05, 08, 09, 11 |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Scene status updates | WebSocket events | Frontend UI (Scene Queue screen) |
| Pipeline progress per scene | Percentage, current step | Frontend UI (Analysis Progress) |
| Completed scene notifications | WebSocket event | Frontend UI |
| Project state transitions | Status changes | Dashboard, all screens |

---

## Scene State Machine (managed by this pipeline)

```
Queued → Processing → Ready For Review → Approved → Published
                                      ↗
                   Modified → Regenerating
```

---

## Project State Machine (managed by this pipeline)

```
Analyzing → Character Review Required → Producing → Scene Review Required → Ready → Published
```

---

## Progressive Model Visualization

```
Time →

Scene 1: [===GENERATING===] [READY ✓] [REVIEWING...] [APPROVED ✓]
Scene 2:    [===GENERATING===] [READY ✓]     [REVIEWING...]
Scene 3:       [===GENERATING===]   [READY ✓]
Scene 4:          [===GENERATING===]

Producer:       Reviews 1    Reviews 2      Reviews 3
                while 2-4    while 3-4      while 4
                generate     generate       generates
```

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Producer closes browser mid-generation | Generation continues server-side. State preserved. |
| TTS API down for one scene | Scene flagged. Other scenes continue. Retry later. |
| Producer edits already-approved scene | Scene re-enters Modified → Regenerating → Approved cycle. |
| All scenes fail | Project marked as "Needs Attention". Producer can retry individual scenes. |
| Single scene takes very long | Other scenes complete and are reviewable. Long scene doesn't block. |
| Producer approves scenes out of order | Allowed. No requirement to review in sequence. |

---

## Dependencies
- **Upstream:** 10 Scene Detection (scene queue), 07 Character Consolidation (approved cast), all production pipelines
- **Downstream:** 18 Publishing (when all scenes approved)
