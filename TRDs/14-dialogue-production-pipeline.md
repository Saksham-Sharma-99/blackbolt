# TRD 14 — Dialogue Production Pipeline (TTS)

## Layer
Audio Production

## Purpose
Generate spoken audio for every dialogue line and narration line. This is where text becomes voice. Each line is produced individually using the assigned character voice and detected emotion, enabling granular regeneration (single line changes don't require full scene re-production).

---

## Process Flow

```
Dialogue Text (from 05/11) + Speaker Voice (from 12) + Emotion (from 09)
 │
 ▼
┌──────────────────────────┐
│ 1. Production Request     │
│   Assembly                │
│                          │
│ Per dialogue line:       │
│ - Text to speak          │
│ - Voice ID (from voice   │
│   assignment)            │
│ - Emotion label          │
│ - Speaker name (for      │
│   reference)             │
│ - Bubble type (dialogue  │
│   vs narration vs        │
│   thought)               │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Emotion-to-Voice       │
│   Parameter Mapping       │
│                          │
│ Map BLACKBOLT emotions   │
│ to TTS API parameters:   │
│                          │
│ - Style/tone controls    │
│ - Speaking speed          │
│   adjustments            │
│ - Emphasis markers       │
│ - Pause insertion        │
│                          │
│ Each TTS provider maps   │
│ differently — this step  │
│ abstracts that           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. TTS API Call           │
│                          │
│ - Send request to TTS    │
│   provider (ElevenLabs,  │
│   Sarvam, etc.)          │
│ - Receive audio clip     │
│ - Handle rate limits,    │
│   retries, failures      │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Audio Post-Processing  │
│                          │
│ - Normalize audio levels │
│ - Trim silence from      │
│   start/end              │
│ - Ensure consistent      │
│   format (sample rate,   │
│   bit depth)             │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Timing Metadata        │
│   Extraction              │
│                          │
│ - Calculate clip duration│
│ - Extract word-level     │
│   timestamps if          │
│   available (for sync)   │
│ - Store start_time,      │
│   end_time relative to   │
│   scene timeline         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Clip Storage           │
│                          │
│ - Store audio clip to S3 │
│ - Store timing metadata  │
│   in DB                  │
│ - Associate with         │
│   dialogue record        │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 16 Audio Stitching
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Dialogue text | String | 05 OCR / 11 Narration |
| Voice ID | Voice profile identifier | 12 Voice Assignment |
| Emotion label | Enum | 09 Emotion Detection |
| Speaker identity | Character ID | 08 Speaker Attribution |
| Bubble type | Enum (dialogue/narration/thought) | 03 Bubble Detection |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Audio clip per dialogue line | Audio file in S3 | 16 Audio Stitching |
| Clip duration/timing metadata | Milliseconds, timestamps | 16 Audio Stitching, 19 Playback Sync |
| Word-level timestamps (if available) | Timestamp array | 19 Playback Sync (for highlight sync) |

---

## Special Voice Handling

| Speaker Type | Voice Behavior |
|-------------|---------------|
| Character dialogue | Character's assigned voice + emotion |
| Narrator | Dedicated narrator voice, Calm/Neutral emotion |
| Thought bubble | Character's voice, slightly softer/more intimate delivery |
| Caption/Narration box | Narrator voice |
| Sound effect | Not voiced here — handled by ambient/stitching |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| TTS API failure | Retry 2-3 times. If still fails, flag dialogue line as "needs regeneration". Skip & continue. |
| Very long dialogue line | Split into natural sentences if needed. Stitch resulting clips. |
| Very short line ("What?!") | Produce as-is. Short clips are valid. |
| Emotion not supported by TTS API | Map to closest available style parameter. Fall back to neutral + text modification. |
| Producer edits dialogue text | Only this single clip regenerates (pipeline 20). |
| Producer changes voice | All clips for that character regenerate (pipeline 20). |
| Producer changes emotion | Only this single clip regenerates (pipeline 20). |

---

## Parallelism
Each dialogue line can be produced independently. Full line-level parallelism (subject to TTS API rate limits).

---

## Dependencies
- **Upstream:** 05 OCR, 08 Speaker Attribution, 09 Emotion Detection, 11 Narration, 12 Voice Assignment
- **Downstream:** 16 Audio Stitching
