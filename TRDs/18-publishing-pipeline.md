# TRD 18 — Publishing Pipeline

## Layer
Delivery

## Purpose
Transform a completed, fully-approved project into a Published Experience — a shareable artifact with a public URL that viewers can access for playback. Publishing creates a snapshot of the project at publication time.

---

## Process Flow

```
All Scenes Approved (project status: Ready)
 │
 ▼
┌──────────────────────────┐
│ 1. Pre-publish Validation │
│                          │
│ Verify:                  │
│ - All scenes status =    │
│   Approved               │
│ - Character review       │
│   completed              │
│ - No unresolved flags    │
│   (or user has           │
│   acknowledged them)     │
│ - At least one scene     │
│   has audio              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Production Summary     │
│   Generation              │
│                          │
│ Calculate and display:   │
│ - Total characters       │
│ - Total scenes           │
│ - Total dialogue lines   │
│ - Total music segments   │
│ - Estimated runtime      │
│   (sum of all scene      │
│    durations)            │
│                          │
│ Present to producer for  │
│ final confirmation       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Publish Metadata       │
│   Collection              │
│                          │
│ Producer provides:       │
│ - Title (auto-populated  │
│   from project name)     │
│ - Description            │
│ - Visibility:            │
│   Public or Unlisted     │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Snapshot Creation      │
│                          │
│ - Freeze current state   │
│   of project             │
│ - Copy/reference all     │
│   assets:                │
│   - Comic page images    │
│   - Scene audio files    │
│   - Sync manifests       │
│   - Script data          │
│   - Character data       │
│ - Snapshot is immutable  │
│   (project can still be  │
│    edited post-publish,  │
│    but published version │
│    doesn't change until  │
│    re-published)         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. URL Generation         │
│                          │
│ - Generate unique        │
│   shareable URL:         │
│   blackbolt.app/p/{id}   │
│ - URL is permanent       │
│ - Accessible immediately │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Published Experience   │
│   Record Creation         │
│                          │
│ Create record with:      │
│ - Title, description     │
│ - Visibility setting     │
│ - URL                    │
│ - Asset references       │
│ - Publisher info          │
│ - Publish timestamp      │
│ - Runtime                │
│ - Scene count            │
│                          │
│ Transition project       │
│ status: Published        │
└────────┬─────────────────┘
         │
         ▼
Output → Published Experience accessible at URL. Feeds into 19 Playback & Sync
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Completed project | All scenes approved | 17 Progressive Generation |
| All scene audio files | Audio in S3 | 16 Audio Stitching |
| All sync manifests | JSON | 16 Audio Stitching |
| Comic page images | PNG in S3 | 01 Ingestion |
| Script data | Dialogue records | 05, 08, 09 |
| Publish metadata | Title, description, visibility | Producer input |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Published Experience record | DB document | 19 Playback & Sync |
| Shareable URL | String (blackbolt.app/p/{id}) | Viewer, sharing |
| Immutable asset snapshot | S3 references | 19 Playback & Sync |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Producer tries to publish with unapproved scenes | Block. Show which scenes need approval. |
| Producer edits project after publishing | Project can be edited. Published version stays frozen. Must re-publish for changes to go live. |
| Re-publish (update published version) | Create new snapshot. Update URL to point to new version. Old version replaced. |
| Unlisted → Public (visibility change) | Allow without re-publishing. Metadata update only. |

---

## Dependencies
- **Upstream:** 17 Progressive Generation (all scenes approved)
- **Downstream:** 19 Playback & Sync
