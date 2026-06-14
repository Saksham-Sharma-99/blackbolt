# TRD 07 — Character Consolidation Pipeline

## Layer
Understanding

## Purpose
Merge duplicate character identities detected by pipeline 06. A single character may be detected under multiple names (e.g., "Spider-Man", "Peter Parker", "Masked Hero"). This pipeline identifies likely duplicates and presents merge suggestions to the producer during Character Review.

---

## Process Flow

```
Character Candidates (from Pipeline 06)
 │
 ▼
┌──────────────────────────┐
│ 1. Alias Detection        │
│                          │
│ - Compare candidate      │
│   names against known    │
│   alias patterns         │
│ - Check Registry for     │
│   known aliases          │
│ - Flag candidates with   │
│   overlapping panel      │
│   appearances (same      │
│   figure, different name)│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Visual Similarity      │
│   Comparison              │
│                          │
│ - Compare reference      │
│   images across          │
│   candidates             │
│ - Identify candidates    │
│   that look like the     │
│   same character         │
│ - Score similarity       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Merge Suggestion       │
│   Generation              │
│                          │
│ - Generate merge         │
│   proposals:             │
│   "Spider-Man" +         │
│   "Peter Parker" →       │
│   "Peter Parker /        │
│    Spider-Man"           │
│                          │
│ - Each suggestion        │
│   includes:              │
│   - Candidates to merge  │
│   - Combined image       │
│     gallery              │
│   - Confidence score     │
│   - Suggested primary    │
│     name                 │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Deduplicated Cast List │
│                          │
│ - Present to producer:   │
│   - Confirmed characters │
│   - Merge suggestions    │
│   - Unknown characters   │
│   - Image galleries      │
│   - Confidence scores    │
└────────┬─────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ 5. HUMAN REVIEW — Character Review  │
│    (MANDATORY GATE)                 │
│                                     │
│ Producer actions per character:     │
│ - Approve (accept as-is)            │
│ - Rename (change name)              │
│ - Merge (combine two candidates)    │
│ - Change Voice (assign/change)      │
│ - Preview Voice (hear sample)       │
│ - Reject (remove from cast)         │
│ - Approve All (bulk action)         │
│                                     │
│ On rename/merge:                    │
│ → All downstream references update  │
│   automatically                     │
│                                     │
│ This gate CANNOT be skipped.        │
└────────┬────────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Approved Cast Finalize │
│                          │
│ - Lock character list    │
│ - Assign character IDs   │
│ - Store voice assignments│
│ - Update Character       │
│   Registry with new      │
│   characters (if user    │
│   chooses)               │
│ - Transition project:    │
│   Character Review       │
│   Required → Producing   │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 08 Speaker Attribution, 10 Scene Detection, 12 Voice Assignment
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Character candidates | List with images, panel refs, confidence | 06 Character Detection |
| Character Registry | Existing characters with aliases | Workspace |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Approved character list | Finalized characters with IDs, names, images, voices | 08, 10, 12 |
| Updated Character Registry | New/modified registry entries | Future projects |
| Character-panel associations (updated) | Merged associations | 08 Speaker Attribution |

---

## Edge Cases

| Case | Behavior |
|------|----------|
| Spider-Man / Peter Parker split | Suggest merge. Producer confirms. All panel refs unify. |
| Two genuinely different characters that look similar | System suggests merge. Producer rejects merge — they stay separate. |
| Unknown character ("Unknown Male") | Producer renames manually. All references update. |
| Character appears only once | Still presented for review. May be minor character. |
| Producer rejects a character | Character removed from cast. Dialogue from that character's panels may need re-attribution. |
| Registry voice override | Producer can override registry voice for this project only, or update registry globally. User explicitly chooses scope. |

---

## Character State Machine

```
Detected → Reviewed → Approved
                   ↘
                    Rejected → Merged (into another character)
```

---

## Human Review
**Mandatory.** This is the first of two human review gates. The project cannot proceed to production without Character Review completion.

---

## Dependencies
- **Upstream:** 06 Character Detection
- **Downstream:** 08 Speaker Attribution, 10 Scene Detection, 12 Voice Assignment
