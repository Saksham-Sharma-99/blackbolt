# BLACKBOLT PRD

# Part 4 --- AI Systems Architecture, Production Pipelines, Intelligence Layer & Technical Boundaries

------------------------------------------------------------------------

# Introduction

Part 3 defined:

- What users see
- How users interact
- Product workflows

Part 4 defines:

- How BLACKBOLT thinks
- How BLACKBOLT generates outputs
- Which AI systems exist
- Which models exist
- Which systems are deterministic
- Which systems require human review

This section intentionally avoids implementation details such as:

- Frameworks
- Languages
- APIs

Those belong in engineering design documents.

This section focuses entirely on product behavior and AI ownership.

------------------------------------------------------------------------

# Core AI Philosophy

BLACKBOLT does not attempt to solve comics with a single model.

Instead it uses specialized pipelines.

Reason:

Comic adaptation consists of multiple independent problems.

    Visual Understanding
    Character Recognition
    Dialogue Extraction
    Speaker Attribution
    Scene Understanding
    Emotion Understanding
    Voice Assignment
    Audio Production

No single model performs all of these well.

------------------------------------------------------------------------

# Complete System Overview

    Comic
     ↓

    Ingestion Layer

     ↓

    Vision Layer

     ↓

    Comic Understanding Layer

     ↓

    Human Review Layer

     ↓

    Production Layer

     ↓

    Publishing Layer

     ↓

    Viewer Experience

------------------------------------------------------------------------

# Pipeline 1 --- Ingestion Pipeline

Purpose:

Convert uploaded content into normalized pages.

------------------------------------------------------------------------

# Supported Inputs

    Single Image

    Multiple Images

    PDF

    CBZ

    CBR

------------------------------------------------------------------------

# Example

Input

    ASM_300.cbz

Output

    Page 1.png
    Page 2.png
    Page 3.png
    ...

------------------------------------------------------------------------

# Responsibilities

File extraction

Page ordering

Metadata extraction

Duplicate detection

Fork detection

Project creation

------------------------------------------------------------------------

# Edge Cases

Corrupt archive

Missing pages

Out-of-order pages

Duplicate uploads

Mixed image formats

------------------------------------------------------------------------

# Output

    Ordered Comic Pages

------------------------------------------------------------------------

# Pipeline 2 --- Panel Detection Pipeline

Purpose:

Understand comic structure.

------------------------------------------------------------------------

# Input

Comic page.

------------------------------------------------------------------------

# Output

    Panel 1
    Panel 2
    Panel 3
    ...

with coordinates.

------------------------------------------------------------------------

# Example

Page

    6 Panels

Output

    Panel A
    Panel B
    Panel C
    Panel D
    Panel E
    Panel F

------------------------------------------------------------------------

# Why This Exists

Reading order depends on panel understanding.

Scene detection depends on panel understanding.

Character context depends on panel understanding.

------------------------------------------------------------------------

# Failure Cases

Splash page

Overlapping panels

Non-rectangular panels

Double-page spreads

------------------------------------------------------------------------

# Human Review

No

System must handle automatically.

------------------------------------------------------------------------

# Pipeline 3 --- Speech Bubble Detection

Purpose:

Identify all spoken content.

------------------------------------------------------------------------

# Detect

    Dialogue Bubble

    Thought Bubble

    Caption Box

    Narration Box

    Sound Effect

------------------------------------------------------------------------

# Example

    Spider-Man:
    MJ!

Detected as:

    Dialogue Bubble

------------------------------------------------------------------------

# Example

    Meanwhile...

Detected as:

    Narration Box

------------------------------------------------------------------------

# Output

    Bubble Coordinates
    Bubble Type

------------------------------------------------------------------------

# Pipeline 4 --- Reading Order Pipeline

One of the most important BLACKBOLT systems.

------------------------------------------------------------------------

# Purpose

Determine:

    Which dialogue occurs first.

------------------------------------------------------------------------

# Why It Matters

Incorrect reading order destroys:

- script
- audio
- scene understanding

------------------------------------------------------------------------

# Example

Comic

    Bubble A
    Bubble B
    Bubble C

Must become

    1
    2
    3

------------------------------------------------------------------------

# Complexity

Traditional comics:

    Simple

Modern comics:

    Non-linear

------------------------------------------------------------------------

# Expected Output

    Page
     ↓
    Panels
     ↓
    Bubbles
     ↓
    Ordered Sequence

------------------------------------------------------------------------

# Human Review

Optional future feature.

Not required in V1.

------------------------------------------------------------------------

# Pipeline 5 --- OCR Pipeline

Purpose:

Extract text.

------------------------------------------------------------------------

# Input

Speech Bubble.

------------------------------------------------------------------------

# Output

    Raw Text

------------------------------------------------------------------------

# Example

Image

    Parker...
    I've known all along.

↓

Output

    Parker...
    I've known all along.

------------------------------------------------------------------------

# Confidence Scoring

Every OCR result receives confidence.

------------------------------------------------------------------------

Example

    98%

Approved automatically.

------------------------------------------------------------------------

Example

    52%

Flagged.

------------------------------------------------------------------------

# OCR Failure Strategy

    Needs Review

appears in scene editor.

------------------------------------------------------------------------

# Pipeline 6 --- Character Detection Pipeline

One of the most valuable systems.

------------------------------------------------------------------------

# Purpose

Determine:

    Who appears in comic.

------------------------------------------------------------------------

# Input

Panels.

------------------------------------------------------------------------

# Output

Detected Character Candidates.

------------------------------------------------------------------------

# Example

    Spider-Man
    Green Goblin
    MJ

------------------------------------------------------------------------

# Character Registry Matching

System attempts:

    Detected Character
     ↓
    Registry Match

------------------------------------------------------------------------

Example

    Spider-Man

matches:

    Spider-Man Registry Entry

------------------------------------------------------------------------

# Unknown Character

Output

    Unknown Male

or

    Unknown Female

------------------------------------------------------------------------

# Human Review

Mandatory.

------------------------------------------------------------------------

# Pipeline 7 --- Character Consolidation Pipeline

Purpose:

Merge duplicate identities.

------------------------------------------------------------------------

# Example

Detected

    Spider-Man
    Peter Parker
    Masked Hero

System suggests:

    Peter Parker / Spider-Man

------------------------------------------------------------------------

# Human Review

Required.

------------------------------------------------------------------------

# Pipeline 8 --- Speaker Attribution Pipeline

Arguably the hardest AI problem.

------------------------------------------------------------------------

# Purpose

Determine:

    Who spoke each line.

------------------------------------------------------------------------

# Inputs

Bubble position

Tail direction

Panel composition

Dialogue content

Nearby characters

Reading order

------------------------------------------------------------------------

# Example

Panel

    Spider-Man
    Green Goblin

Bubble:

    Parker...
    I've known all along.

Output

    Green Goblin

------------------------------------------------------------------------

# Confidence

Every attribution gets confidence.

------------------------------------------------------------------------

# Low Confidence

Producer review required.

------------------------------------------------------------------------

# Pipeline 9 --- Emotion Detection Pipeline

Purpose:

Determine emotional delivery.

------------------------------------------------------------------------

# Example

Dialogue

    What?!

Output

    Shocked

------------------------------------------------------------------------

# Supported Emotions

    Angry
    Fearful
    Relieved
    Embarrassed
    Cocky
    Sarcastic
    Triumphant
    Desperate
    Calm
    Neutral

------------------------------------------------------------------------

# Example

Spider-Man

    Nice haircut.

↓

    Sarcastic

------------------------------------------------------------------------

# Human Override

Always available.

------------------------------------------------------------------------

# Pipeline 10 --- Scene Detection Pipeline

Purpose:

Break issue into production units.

------------------------------------------------------------------------

# Why

Entire issue generation is too slow.

Scene generation enables progressive production.

------------------------------------------------------------------------

# Inputs

Page transitions

Location changes

Character changes

Dialogue shifts

Narrative transitions

------------------------------------------------------------------------

# Example

Pages

    1-4
    Daily Bugle

    5-8
    Rooftop

    9-12
    Fight

↓

Three scenes.

------------------------------------------------------------------------

# Human Editing

Allowed.

------------------------------------------------------------------------

# Pipeline 11 --- Narration Pipeline

Purpose:

Generate missing context.

------------------------------------------------------------------------

# Philosophy

Minimal narration.

------------------------------------------------------------------------

# Example

Allowed

    Narrator:
    Spider-Man lands on the rooftop.

------------------------------------------------------------------------

# Example

Not Allowed

    Narrator:
    Spider-Man reflects on the meaning of life...

when comic does not imply it.

------------------------------------------------------------------------

# Rule

Narration supplements.

Never rewrites.

------------------------------------------------------------------------

# Pipeline 12 --- Music Selection Pipeline

Purpose:

Assign music themes.

------------------------------------------------------------------------

# Input

Scene.

------------------------------------------------------------------------

# Output

    Hero Theme

    Suspense Theme

    Fight Theme

    Romance Theme

------------------------------------------------------------------------

# Example

Green Goblin Reveal

↓

    Suspense Theme

------------------------------------------------------------------------

# User Control

Producer can change.

------------------------------------------------------------------------

# Pipeline 13 --- Voice Assignment Pipeline

Purpose:

Map characters to voices.

------------------------------------------------------------------------

# Inputs

Character

Registry

Project Overrides

------------------------------------------------------------------------

# Output

    Character
     ↓
    Voice

------------------------------------------------------------------------

# Example

Spider-Man

↓

    Friendly Hero

------------------------------------------------------------------------

# Registry Priority

    Project Override

    ↓

    Registry

    ↓

    Archetype

------------------------------------------------------------------------

# Pipeline 14 --- Dialogue Production Pipeline

Purpose:

Generate spoken audio.

------------------------------------------------------------------------

# Inputs

Speaker

Dialogue

Emotion

Voice

------------------------------------------------------------------------

# Output

Audio Clip.

------------------------------------------------------------------------

# Example

    Spider-Man

    Emotion:
    Cocky

    Dialogue:
    Nice haircut.

↓

Cocky delivery.

------------------------------------------------------------------------

# Pipeline 15 --- Ambient Audio Pipeline

Optional enhancement layer.

------------------------------------------------------------------------

# Purpose

Create atmosphere.

------------------------------------------------------------------------

# Example

Silent City Scene

↓

    Traffic
    Wind
    Distant Sirens

------------------------------------------------------------------------

# Example

Daily Bugle

↓

    Office Ambience
    Phones
    Typing

------------------------------------------------------------------------

# Principle

Ambient audio supports.

Never dominates.

------------------------------------------------------------------------

# Pipeline 16 --- Audio Stitching Pipeline

Purpose

Combine outputs.

------------------------------------------------------------------------

# Inputs

Dialogue

Music

Ambient Audio

Silence

------------------------------------------------------------------------

# Output

Scene Production.

------------------------------------------------------------------------

# Responsibilities

Timing

Volume balancing

Transitions

Crossfades

Pauses

------------------------------------------------------------------------

# Pipeline 17 --- Progressive Generation Pipeline

The most important architectural system.

------------------------------------------------------------------------

# Traditional Systems

    Generate Everything
     ↓
    Wait

------------------------------------------------------------------------

# BLACKBOLT

    Generate Scene 1
     ↓
    User Reviews Scene 1

    while

    Generate Scene 2
    Generate Scene 3

------------------------------------------------------------------------

# Benefits

Reduced perceived latency.

Continuous engagement.

Incremental correction.

------------------------------------------------------------------------

# Regeneration Strategy

BLACKBOLT never regenerates entire projects.

------------------------------------------------------------------------

# Example

Change:

    Spider-Man Voice

Only affected scenes regenerate.

------------------------------------------------------------------------

# Example

Change:

    Dialogue Line

Only affected dialogue regenerates.

------------------------------------------------------------------------

# AI Confidence Framework

Every pipeline emits confidence.

------------------------------------------------------------------------

# Example

Character Detection

    Spider-Man

    98%

------------------------------------------------------------------------

# Example

Speaker Attribution

    Green Goblin

    61%

------------------------------------------------------------------------

# Low Confidence Policy

Flag for producer review.

Never silently guess.

------------------------------------------------------------------------

# Human Review Boundaries

Mandatory Review

    Characters
    Voices
    Low-confidence speakers

------------------------------------------------------------------------

Optional Review

    Music
    Emotion
    Narration

------------------------------------------------------------------------

Automatic

    OCR
    Panel Detection
    Bubble Detection

unless failures occur.

------------------------------------------------------------------------

# Core Architectural Principle

BLACKBOLT's intelligence comes from combining:

    Vision
    Context
    Human Review
    Production Workflows

rather than relying on a single foundation model.

Every AI decision should be:

Explainable Editable Regenerable Incremental

Those four principles govern the entire system.
