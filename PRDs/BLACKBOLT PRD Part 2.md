# BLACKBOLT PRD

# Part 2 --- Information Architecture, Core Objects, State Machines & End-to-End Flows

------------------------------------------------------------------------

# 14. Information Architecture

BLACKBOLT is fundamentally a project-based production system.

Users do not create audio files.

Users create adaptation projects.

Every screen, workflow, and backend service should reinforce this model.

------------------------------------------------------------------------

# System Hierarchy

    Workspace
    │
    ├── Character Registry
    │
    ├── Projects
    │   │
    │   ├── Project
    │   │   │
    │   │   ├── Comic Pages
    │   │   ├── Scenes
    │   │   ├── Characters
    │   │   ├── Voice Assignments
    │   │   ├── Scripts
    │   │   ├── Music Segments
    │   │   ├── Comments
    │   │   └── Productions
    │   │
    │   └── Forked Projects
    │
    └── Published Experiences

------------------------------------------------------------------------

# 15. Core Object Model

BLACKBOLT revolves around nine primary entities.

Every feature maps back to one of these.

------------------------------------------------------------------------

# Object 1: Workspace

Represents a user's top-level environment.

Contains:

    Workspace
    ├── Projects
    ├── Character Registry
    ├── Published Experiences
    └── Settings

------------------------------------------------------------------------

Example:

    Saksham Workspace

    Projects:
    - ASM #300 Adaptation
    - ASM #121 Adaptation

    Registry:
    - Spider-Man
    - Green Goblin
    - MJ
    - Venom

------------------------------------------------------------------------

# Object 2: Project

The most important object.

A project represents a comic adaptation.

------------------------------------------------------------------------

Example

    Project:
    Amazing Spider-Man #300

Contains:

    Pages
    Characters
    Scripts
    Scenes
    Voice Assignments
    Audio
    Comments
    Publishing Metadata

------------------------------------------------------------------------

Project States

    Draft
    Analyzing
    Character Review Required
    Producing
    Scene Review Required
    Ready
    Published
    Archived

------------------------------------------------------------------------

# Object 3: Scene

Scene is BLACKBOLT's primary production unit.

Not page.

Not issue.

Scene.

------------------------------------------------------------------------

Example

    Scene 1

    Peter arrives at Daily Bugle

Contains:

    Panels
    Dialogue
    Music
    Characters
    Audio

------------------------------------------------------------------------

Why Scenes?

Users understand stories in scenes.

Users do NOT understand:

    Page 17 Bubble 4

------------------------------------------------------------------------

Scene Metadata

    scene_id
    title
    start_page
    end_page
    description
    music_theme
    status

------------------------------------------------------------------------

Example

    Scene 3

    Goblin Reveals Identity

    Pages:
    21-24

    Theme:
    Suspense

------------------------------------------------------------------------

# Object 4: Character

Character is a first-class entity.

------------------------------------------------------------------------

Character Structure

    Character

    id
    name
    images
    voice
    confidence
    aliases
    metadata

------------------------------------------------------------------------

Example

    Spider-Man

    Aliases:
    Peter Parker

    Voice:
    Friendly Hero

    Confidence:
    98%

------------------------------------------------------------------------

Character Status

    Detected
    Reviewed
    Approved
    Modified
    Rejected

------------------------------------------------------------------------

# Object 5: Voice Assignment

Represents:

    Character
    →
    Voice

------------------------------------------------------------------------

Example

    Green Goblin

    Voice:
    Maniacal Villain

------------------------------------------------------------------------

Contains

    voice_id
    emotion_overrides
    custom_settings

------------------------------------------------------------------------

# Object 6: Dialogue

Represents a spoken line.

------------------------------------------------------------------------

Structure

    Dialogue

    speaker
    text
    emotion
    start_time
    end_time

------------------------------------------------------------------------

Example

    Speaker:
    Green Goblin

    Emotion:
    Triumphant

    Text:
    Parker...
    I've known all along.

------------------------------------------------------------------------

# Object 7: Music Segment

Represents scene-level soundtrack.

------------------------------------------------------------------------

Structure

    theme
    volume
    start_dialogue
    end_dialogue

------------------------------------------------------------------------

Example

    Suspense Theme

    Dialogue:
    21-45

------------------------------------------------------------------------

# Object 8: Production

Represents generated output.

------------------------------------------------------------------------

Contains

    voice tracks
    music tracks
    timings
    script sync

------------------------------------------------------------------------

# Object 9: Published Experience

Public artifact.

Viewer consumes this.

------------------------------------------------------------------------

Contains

    Comic
    Audio
    Script
    Comments
    Playback Data

------------------------------------------------------------------------

# 16. Character Registry

One of BLACKBOLT's core differentiators.

------------------------------------------------------------------------

Purpose

Maintain continuity across projects.

------------------------------------------------------------------------

Example

User adapts:

    ASM #300
    ASM #301
    ASM #302

Spider-Man should not randomly receive different voices.

------------------------------------------------------------------------

Registry Structure

    Spider-Man
    → Friendly Hero

    MJ
    → Warm Female

    Goblin
    → Maniacal Villain

------------------------------------------------------------------------

Registry Rules

Global defaults.

Projects may override.

------------------------------------------------------------------------

Example

    Registry

    Spider-Man
    → Friendly Hero

    Project Override

    Spider-Man
    → Cocky Hero

------------------------------------------------------------------------

# 17. Project Forking Model

A major system feature.

------------------------------------------------------------------------

Scenario

User uploads:

    ASM #300

already processed.

------------------------------------------------------------------------

BLACKBOLT creates:

    Fork

rather than duplicate project.

------------------------------------------------------------------------

Example

    Original

    ASM #300

↓

    Fork

    ASM #300 (Saksham Edition)

------------------------------------------------------------------------

Fork inherits

    characters
    scripts
    voices
    scene definitions

------------------------------------------------------------------------

Fork may modify

    voices
    dialogue
    music

------------------------------------------------------------------------

Fork may NOT modify original.

------------------------------------------------------------------------

# 18. State Machines

Every object follows explicit states.

------------------------------------------------------------------------

Project State Machine

    Draft
     ↓
    Analyzing
     ↓
    Character Review Required
     ↓
    Producing
     ↓
    Scene Review Required
     ↓
    Ready
     ↓
    Published

------------------------------------------------------------------------

Transitions

Example:

    Character Review Complete

moves:

    Character Review Required

↓

    Producing

------------------------------------------------------------------------

# Scene State Machine

    Queued
     ↓
    Processing
     ↓
    Ready For Review
     ↓
    Approved
     ↓
    Published

------------------------------------------------------------------------

Alternative Path

    Approved
     ↓
    Modified
     ↓
    Regenerating
     ↓
    Approved

------------------------------------------------------------------------

# Character State Machine

    Detected
     ↓
    Reviewed
     ↓
    Approved

or

    Detected
     ↓
    Rejected
     ↓
    Merged

------------------------------------------------------------------------

# 19. End-to-End Flow

This section defines BLACKBOLT's core experience.

------------------------------------------------------------------------

Flow Overview

    Upload
     ↓
    Analyze
     ↓
    Character Review
     ↓
    Voice Assignment
     ↓
    Scene Generation
     ↓
    Scene Review
     ↓
    Production
     ↓
    Publishing
     ↓
    Viewer Experience

------------------------------------------------------------------------

# 20. Upload Flow

Supported Inputs

    Single Image

    Multiple Images

    PDF

    CBZ

    CBR

------------------------------------------------------------------------

Happy Path

User uploads:

    ASM_300.cbz

↓

BLACKBOLT extracts pages.

↓

Creates Project.

↓

Starts analysis.

------------------------------------------------------------------------

# 21. Analysis Flow

Pipeline

    Page Detection
     ↓
    Panel Detection
     ↓
    Bubble Detection
     ↓
    OCR
     ↓
    Character Detection
     ↓
    Scene Detection

------------------------------------------------------------------------

Output

    Characters
    Scenes
    Dialogue

------------------------------------------------------------------------

# 22. Character Review Flow

This is mandatory.

Cannot be skipped.

------------------------------------------------------------------------

Purpose

Verify AI understanding.

------------------------------------------------------------------------

Flow

    AI detects cast
     ↓
    User reviews cast
     ↓
    User approves

------------------------------------------------------------------------

Example

Detected:

    Spider-Man
    Goblin
    MJ
    Police Officer

------------------------------------------------------------------------

User changes:

    Police Officer

↓

    Captain Stacy

------------------------------------------------------------------------

All downstream references update automatically.

------------------------------------------------------------------------

# 23. Voice Assignment Flow

Occurs during character review.

------------------------------------------------------------------------

User sees

    Spider-Man

    Images:
    [gallery]

    Voice:
    Friendly Hero

------------------------------------------------------------------------

Can change

    Voice

before production.

------------------------------------------------------------------------

Voice preview available.

------------------------------------------------------------------------

# 24. Progressive Scene Production

Most important workflow in BLACKBOLT.

------------------------------------------------------------------------

Traditional Systems

    Generate Entire Comic
     ↓
    Wait

------------------------------------------------------------------------

BLACKBOLT

    Generate Scene 1
     ↓
    Review Scene 1

    while

    Generate Scene 2
    Generate Scene 3

------------------------------------------------------------------------

Benefits

- Lower perceived latency
- Continuous engagement
- Faster corrections

------------------------------------------------------------------------

# 25. Scene Review Flow

Scene becomes available.

------------------------------------------------------------------------

Producer sees

    Comic
    Script
    Music

------------------------------------------------------------------------

Can edit:

    Speaker
    Dialogue
    Emotion
    Music

------------------------------------------------------------------------

Changes automatically update production.

------------------------------------------------------------------------

# 26. Publishing Flow

Requirements

All scenes approved.

------------------------------------------------------------------------

User clicks:

    Publish

------------------------------------------------------------------------

System creates

    Published Experience

------------------------------------------------------------------------

Returns

    Shareable URL

------------------------------------------------------------------------

# 27. Viewer Flow

Viewer receives:

    blackbolt.app/p/project-id

------------------------------------------------------------------------

Viewer enters playback experience.

Can:

    Play
    Pause
    Seek
    Comment
    Change Speed

Cannot:

    Edit

------------------------------------------------------------------------

# 28. Comment System

Viewer comments attach to:

    Scene
    Dialogue
    Timestamp

------------------------------------------------------------------------

Example

    00:32

    Goblin voice sounds amazing.

------------------------------------------------------------------------

# 29. Regeneration Rules

BLACKBOLT should never regenerate entire projects unnecessarily.

------------------------------------------------------------------------

Example

User changes:

    Spider-Man voice

------------------------------------------------------------------------

Affected scenes:

    Scene 1
    Scene 3
    Scene 7

------------------------------------------------------------------------

Only these scenes regenerate.

------------------------------------------------------------------------

# 30. Failure Recovery

Example

OCR fails.

------------------------------------------------------------------------

Scene marked:

    Needs Attention

------------------------------------------------------------------------

User may:

    Edit manually
    Retry OCR

------------------------------------------------------------------------

Generation continues.

------------------------------------------------------------------------

# 31. Core Architectural Principle

Everything in BLACKBOLT should optimize for:

    Fast Feedback

    Human Review

    Incremental Production

Never:

    Massive Generate Button

The system should always keep the producer engaged while generation continues in the background.
