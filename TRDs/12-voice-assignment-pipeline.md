# TRD 12 — Voice Assignment Pipeline

## Layer
Production Setup

## Purpose
Map each approved character to a voice profile. Uses a priority hierarchy: Project Override > Character Registry > Archetype default. Enables voice preview so the producer can hear how a character will sound before production begins.

---

## Process Flow

```
Approved Characters (from 07) + Character Registry + Project Settings
 │
 ▼
┌──────────────────────────┐
│ 1. Registry Lookup        │
│                          │
│ For each character:      │
│ - Check Character        │
│   Registry for existing  │
│   voice assignment       │
│ - If found: use registry │
│   voice as default       │
│ - If not found: proceed  │
│   to archetype           │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 2. Project Override Check │
│                          │
│ - Check if this project  │
│   has a voice override   │
│   for the character      │
│ - Project override takes │
│   priority over registry │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 3. Archetype Fallback     │
│                          │
│ If no registry or        │
│ override exists:         │
│                          │
│ - Classify character     │
│   archetype:             │
│   - Hero                 │
│   - Villain              │
│   - Supporting           │
│   - Narrator             │
│   - Civilian             │
│ - Assign default voice   │
│   from archetype         │
│   category               │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 4. Voice Assignment       │
│   Presentation            │
│                          │
│ Present to producer      │
│ during Character Review: │
│                          │
│ Per character:           │
│ - Current voice          │
│ - Voice category options │
│   (e.g., Friendly Hero,  │
│    Cocky Hero, Young     │
│    Hero, Reserved Hero)  │
│ - Preview button         │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 5. Voice Preview          │
│   Generation              │
│                          │
│ When producer clicks     │
│ Preview:                 │
│ - Generate sample        │
│   dialogue using         │
│   selected voice         │
│ - Sample text is         │
│   character-appropriate  │
│ - Quick generation       │
│   (single line, not full │
│   production pipeline)   │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ 6. Final Assignment       │
│   Storage                 │
│                          │
│ - Store voice_id per     │
│   character for this     │
│   project                │
│ - Store emotion_overrides│
│   if any                 │
│ - Optionally update      │
│   Registry (user chooses │
│   scope: project-only or │
│   global)                │
└────────┬─────────────────┘
         │
         ▼
Output → Feeds into 14 Dialogue Production (TTS)
```

---

## Inputs

| Input | Format | Source |
|-------|--------|--------|
| Approved character list | Character IDs, names | 07 Character Consolidation |
| Character Registry | Global voice defaults | Workspace |
| Project settings | Project-level overrides | Project record |

## Outputs

| Output | Format | Consumed By |
|--------|--------|-------------|
| Character → Voice mappings | voice_id per character | 14 Dialogue Production |
| Voice preview audio | Sample clips | Character Review UI |
| Registry updates (optional) | Updated global defaults | Future projects |

---

## Voice Categories

| Category | Example Voices |
|----------|---------------|
| Heroes | Friendly Hero, Cocky Hero, Young Hero, Reserved Hero |
| Villains | Maniacal Villain, Deep Villain, Calculating Villain |
| Supporting | Warm Female, Gruff Male, Elder, Professional |
| Narrators | Default Narrator |
| Civilians | Generic Male, Generic Female |

---

## Priority Hierarchy

```
1. Project Override    (highest — user set a voice for THIS project)
     ↓
2. Character Registry  (global default from previous projects)
     ↓
3. Archetype Fallback  (system default based on character type)
```

---

## Edge Cases

| Case | Behavior |
|------|----------|
| New character not in registry | Archetype fallback assigns a default. Producer can change. |
| Producer changes voice after production started | Triggers regeneration of affected scenes only (pipeline 20). |
| Same character, different voice across projects | Valid. Registry = default, project override = per-project. |
| Registry voice update | User explicitly chooses: apply to current project only, or update global registry. |

---

## Human Review
**Integrated into Character Review.** Voice assignment is part of the Character Review screen. Producer approves characters and voices together.

---

## Dependencies
- **Upstream:** 07 Character Consolidation (approved characters), Character Registry
- **Downstream:** 14 Dialogue Production
