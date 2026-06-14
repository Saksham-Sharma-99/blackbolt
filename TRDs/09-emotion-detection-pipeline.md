# TRD 09 — Emotion Detection Pipeline

## Layer
Understanding

## Purpose
Determine the emotional delivery for each line of dialogue. The detected emotion directly controls how the TTS system voices the line — an "Angry" line sounds fundamentally different from a "Sarcastic" one. This pipeline analyzes dialogue text, speaker identity, and scene context to classify emotion.

---

## Process Flow

```
Dialogue Text (from 05) + Speaker (from 08) + Scene Context (from 10)
 │
 ▼
┌──────────────────────────┐
│ 1. Text-Based Emotion     │
│   Analysis                │
│                          │
│ - Analyze dialogue text  │
│   for emotional cues:    │
│   - Exclamation marks    │
│   - Question marks       │
│   - Ellipses (hesitation)│
│   - ALL CAPS (shouting)  │
│   - Word choice          │
│   - Punctuation patterns │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Speaker Context        │
│                          │
│ - Consider who is        │
│   speaking:              │
│   - Villain speaking →   │
│     bias toward menacing │
│     emotions             │
│   - Hero in danger →     │
│     bias toward desperate│
│   - Character personality│
│     influences default   │
│     emotion              │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Scene Context          │
│                          │
│ - Consider scene mood:   │
│   - Fight scene →        │
│     aggressive emotions  │
│   - Reveal scene →       │
│     shock/triumph        │
│   - Romance scene →      │
│     warm/calm emotions   │
│ - Adjacent dialogue      │
│   emotions influence     │
│   (emotional continuity) │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Emotion Classification │
│                          │
│ Classify into one of:    │
│ - Angry                  │
│ - Fearful                │
│ - Relieved               │
│ - Embarrassed            │
│ - Cocky                  │
│ - Sarcastic              │
│ - Triumphant             │
│ - Desperate              │
│ - Calm                   │
│ - Neutral                │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Confidence Scoring     │
│                          │
│ - Score confidence       │
│ - Some lines are clearly │
│   emotional ("What?!")   │
│ - Others are ambiguous   │
│   ("I see.")             │
│ - Ambiguous defaults to  │
│   Neutral                │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 14 Dialogue Production (TTS)
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Dialogue text | String | 05 OCR |
| Speaker identity | Character ID | 08 Speaker Attribution |
| Scene context | Scene description, mood, theme | 10 Scene Detection |
| Adjacent dialogue emotions | Emotion labels | Self (previous lines) |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Emotion label per dialogue line | Enum from supported list | 14 Dialogue Production |
| Confidence score | Float (0-100%) | Scene Editor (optional review) |

---

## Supported Emotions

| Emotion | Example Dialogue | Delivery Style |
|---------|-----------------|----------------|
| Angry | "Get out of here!" | Raised voice, aggression |
| Fearful | "No... please..." | Trembling, hesitant |
| Relieved | "Thank goodness you're safe." | Exhale, relaxed |
| Embarrassed | "I... didn't mean to..." | Stammering, quiet |
| Cocky | "Nice haircut." | Smirking, confident |
| Sarcastic | "Oh, wonderful." | Dry, deadpan |
| Triumphant | "I've known all along." | Bold, victorious |
| Desperate | "Someone help!" | Urgent, strained |
| Calm | "Let's talk about this." | Even, measured |
| Neutral | "The report is on your desk." | Flat, informational |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Ambiguous emotion | Default to Neutral. Producer can override in Scene Editor. |
| Single word ("What?!") | Rely heavily on punctuation and scene context. |
| Long monologue with shifting emotions | Split analysis by sentence if needed. Assign dominant emotion to the full line. |
| Narrator lines | Default to Calm/Neutral. Narration should sound measured. |
| Sound effects | Not applicable — SFX lines skip emotion detection. |

---

## Human Review
**Optional.** Emotion labels are editable during Scene Review. Producer can change any emotion via the Dialogue Editor.

---

## Dependencies
- **Upstream:** 05 OCR (text), 08 Speaker Attribution (speaker), 10 Scene Detection (context)
- **Downstream:** 14 Dialogue Production (TTS)
