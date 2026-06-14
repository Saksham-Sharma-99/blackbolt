# BLACKBOLT PRD

# Part 3 --- Complete UX Specification, Screen Designs, Wireframes & User Journeys

------------------------------------------------------------------------

# Introduction

This section defines every major screen in BLACKBOLT.

The purpose of this section is to answer:

- What screens exist?
- What is displayed?
- What actions are available?
- What states can occur?
- What happens after every action?
- What are the happy paths?
- What are the failure states?
- How should the UI behave?

This section intentionally goes beyond visual layout and specifies expected behavior.

------------------------------------------------------------------------

# User Journey Overview

## Producer Journey

    Landing
     ↓
    Create Project
     ↓
    Upload Comic
     ↓
    Analysis
     ↓
    Character Review
     ↓
    Voice Assignment
     ↓
    Scene Queue
     ↓
    Scene Review
     ↓
    Publishing
     ↓
    Shareable Experience

------------------------------------------------------------------------

## Viewer Journey

    Open Shared Link
     ↓
    Playback Experience
     ↓
    Comments
     ↓
    Sharing

------------------------------------------------------------------------

# Screen 1 --- Landing Page

## Purpose

Explain BLACKBOLT in under 15 seconds.

User should understand:

    Upload Comic
    ↓
    Review Cast
    ↓
    Publish Audio Experience

------------------------------------------------------------------------

# Wireframe

    +--------------------------------------------------+
    | BLACKBOLT                                        |
    | AI Comic Adaptation Studio                       |
    |                                                  |
    | Turn static comics into fully voiced experiences |
    |                                                  |
    | [ Create Project ]                               |
    |                                                  |
    | Demo Preview                                     |
    |                                                  |
    | [Comic]  [Script]  [Voices Playing]              |
    +--------------------------------------------------+

    +--------------------------------------------------+
    | How It Works                                     |
    |                                                  |
    | Upload                                           |
    | Character Review                                 |
    | Scene Review                                     |
    | Publish                                           |
    +--------------------------------------------------+

    +--------------------------------------------------+
    | Featured Productions                             |
    +--------------------------------------------------+

------------------------------------------------------------------------

# Primary CTA

    Create Project

------------------------------------------------------------------------

# Secondary CTA

    Watch Demo

------------------------------------------------------------------------

# Success Metric

User starts project.

------------------------------------------------------------------------

# Screen 2 --- Dashboard

## Purpose

Project management.

------------------------------------------------------------------------

# Wireframe

    +------------------------------------------------+
    | BLACKBOLT                                      |
    +------------------------------------------------+

    Projects

    [ New Project ]

    --------------------------------------------------

    ASM #300
    Ready
    Last Edited 2 days ago

    --------------------------------------------------

    ASM #121
    Producing

    Scene 4 Processing

    --------------------------------------------------

    ASM #122
    Published

------------------------------------------------------------------------

# Actions

Create

Open

Delete

Fork

Publish

------------------------------------------------------------------------

# Empty State

    No projects yet.

    Create your first adaptation.

------------------------------------------------------------------------

# Screen 3 --- Create Project

------------------------------------------------------------------------

# Purpose

Upload source material.

------------------------------------------------------------------------

# Wireframe

    +----------------------------------+
    | Create Project                   |
    +----------------------------------+

    Project Name

    [________________]

    Upload

    [ Drag Files Here ]

    Supported

    JPG
    PNG
    PDF
    CBZ
    CBR

    [ Start Analysis ]

------------------------------------------------------------------------

# Supported Uploads

Single image

Multiple images

Entire issue

------------------------------------------------------------------------

# Edge Case

User uploads mixed file types.

System:

    Unsupported files removed.

------------------------------------------------------------------------

# Screen 4 --- Analysis Progress

## Purpose

Build confidence.

Show system intelligence.

------------------------------------------------------------------------

# Wireframe

    Project:
    ASM #300

    Analyzing...

    ✓ OCR
    ✓ Character Detection
    ✓ Scene Detection

    Processing:

    Speaker Attribution...

    32%

    Estimated:
    2 minutes

------------------------------------------------------------------------

# User Can

Cancel

Leave Page

Return Later

------------------------------------------------------------------------

# Important Behavior

Processing continues in background.

------------------------------------------------------------------------

# Screen 5 --- Character Review

Most important screen in BLACKBOLT.

------------------------------------------------------------------------

# Purpose

Verify AI understanding.

------------------------------------------------------------------------

# Wireframe

    +----------------------------------------------------------+
    | Character Review                                         |
    +----------------------------------------------------------+

    Detected Cast

    ----------------------------------------------------------

    Spider-Man

    [img][img][img][img]

    Confidence: 98%

    Voice:
    Friendly Hero

    [ Preview ]

    ----------------------------------------------------------

    Green Goblin

    [img][img][img]

    Confidence: 97%

    Voice:
    Maniacal Villain

    [ Preview ]

    ----------------------------------------------------------

    Mary Jane

    [img][img][img]

    Voice:
    Warm Female

    ----------------------------------------------------------

    [ Approve All ]

------------------------------------------------------------------------

# User Actions

Approve

Rename

Merge

Change Voice

Preview Voice

Reject

------------------------------------------------------------------------

# Example

AI:

    Norman Osborn

User:

    Green Goblin

All references update.

------------------------------------------------------------------------

# Edge Case

Same character split.

    Spider-Man

    Peter Parker

User merges.

------------------------------------------------------------------------

# Screen 6 --- Voice Assignment

Integrated into character review.

------------------------------------------------------------------------

# Voice Categories

Heroes

Villains

Supporting Characters

Narrators

Civilian Archetypes

------------------------------------------------------------------------

# Example

    Spider-Man

    Voice:

    ○ Friendly Hero
    ○ Cocky Hero
    ○ Young Hero
    ○ Reserved Hero

------------------------------------------------------------------------

# Preview Flow

User clicks:

    Preview

System generates:

    Hey MJ!
    Looks like somebody forgot
    to brush their teeth.

using selected voice.

------------------------------------------------------------------------

# Screen 7 --- Scene Queue

After cast approval.

------------------------------------------------------------------------

# Purpose

Progressive generation.

------------------------------------------------------------------------

# Wireframe

    Scenes

    ✓ Scene 1 Ready

    Generating...
    Scene 2

    Queued
    Scene 3

    Queued
    Scene 4

    Queued

------------------------------------------------------------------------

# Behavior

Scene 1 immediately editable.

Scene 2 generated in background.

------------------------------------------------------------------------

# Screen 8 --- Scene Editor

The core BLACKBOLT screen.

------------------------------------------------------------------------

# Purpose

Producer workspace.

------------------------------------------------------------------------

# Wireframe

    +-----------------------------------------------------------+
    | Scene 3 - Goblin Reveal                                   |
    +-----------------------------------------------------------+

    +-------------+----------------------+----------------------+
    |             |                      |                      |
    |             |                      |                      |
    |             |                      | Suspense Theme       |
    | Comic       | Script               |                      |
    |             |                      | Volume: 65%          |
    |             |                      |                      |
    |             |                      | [ Change ]           |
    |             |                      |                      |
    +-------------+----------------------+----------------------+

------------------------------------------------------------------------

# Left Panel

Comic.

------------------------------------------------------------------------

# Behavior

Scrolls with playback.

Highlights current panel.

Highlights current bubble.

------------------------------------------------------------------------

# Center Panel

Script.

------------------------------------------------------------------------

Example

    Green Goblin

    Parker...
    I've known all along.

    Spider-Man

    What?!

------------------------------------------------------------------------

# Current dialogue highlighted.

------------------------------------------------------------------------

# Right Panel

Music controls.

------------------------------------------------------------------------

# User Actions

Change music.

Adjust volume.

Remove music.

Preview.

------------------------------------------------------------------------

# Screen 9 --- Dialogue Editor

Click dialogue.

------------------------------------------------------------------------

# Wireframe

    Speaker

    [ Green Goblin ▼ ]

    Emotion

    [ Triumphant ▼ ]

    Dialogue

    [Parker...
    I've known all along.]

    [ Save ]

------------------------------------------------------------------------

# Editable Fields

Speaker

Emotion

Dialogue

Pause Length

------------------------------------------------------------------------

# Emotion Types

Angry

Cocky

Fearful

Embarrassed

Triumphant

Desperate

Calm

Sarcastic

------------------------------------------------------------------------

# Regeneration

Only affected dialogue regenerated.

------------------------------------------------------------------------

# Screen 10 --- Music Assignment

------------------------------------------------------------------------

# Wireframe

    Theme

    ○ Hero Theme
    ○ Suspense Theme
    ○ Romance Theme
    ○ Fight Theme
    ○ Investigation Theme

    Volume

    --------|----

------------------------------------------------------------------------

# Scope

Assigned to dialogue ranges.

------------------------------------------------------------------------

Example

    Dialogue 1-12

    Suspense Theme

------------------------------------------------------------------------

# Screen 11 --- Production Review

Purpose:

Review before publish.

------------------------------------------------------------------------

# Wireframe

    Production Summary

    Characters:
    12

    Scenes:
    9

    Dialogue:
    245

    Music Segments:
    11

    Estimated Runtime:
    23 Minutes

    [ Publish ]

------------------------------------------------------------------------

# Screen 12 --- Publish Modal

------------------------------------------------------------------------

# Wireframe

    Publish Production

    Title

    ASM #300

    Description

    [____________]

    Visibility

    ○ Public
    ○ Unlisted

    [ Publish ]

------------------------------------------------------------------------

# Output

Shareable URL.

------------------------------------------------------------------------

# Screen 13 --- Viewer Experience

The final product.

------------------------------------------------------------------------

# Wireframe

    +----------------------------------------------------------+

    ASM #300

    +----------------+-----------------------------------------+
    |                |                                         |
    |                | Green Goblin                            |
    | Comic          |                                         |
    |                | Parker...                               |
    |                | I've known all along.                   |
    |                |                                         |
    |                | Spider-Man                              |
    |                |                                         |
    |                | What?!                                  |
    |                |                                         |
    +----------------+-----------------------------------------+

    Play Pause

    Progress Bar

    1.0x

------------------------------------------------------------------------

# Behavior

Comic auto-scrolls.

Script auto-scrolls.

Current dialogue highlighted.

Current speaker highlighted.

------------------------------------------------------------------------

# Viewer Controls

Play

Pause

Seek

Playback Speed

Comments

Share

------------------------------------------------------------------------

# Screen 14 --- Comments

------------------------------------------------------------------------

# Wireframe

    Comments

    00:42

    Goblin voice is incredible.

    --------------------------------

    01:12

    Music fits perfectly.

------------------------------------------------------------------------

# Attachment Options

Scene

Dialogue

Timestamp

------------------------------------------------------------------------

# Screen 15 --- Fork Project

------------------------------------------------------------------------

# Purpose

Reuse existing adaptation.

------------------------------------------------------------------------

# Wireframe

    Fork Project

    Source:
    ASM #300

    Includes

    ✓ Characters
    ✓ Voices
    ✓ Scripts
    ✓ Scene Definitions

    [ Create Fork ]

------------------------------------------------------------------------

# Result

    ASM #300 (Fork)

created.

------------------------------------------------------------------------

# Screen 16 --- Character Registry

Global settings.

------------------------------------------------------------------------

# Wireframe

    Spider-Man

    Friendly Hero

    --------------------------------

    Green Goblin

    Maniacal Villain

    --------------------------------

    Mary Jane

    Warm Female

------------------------------------------------------------------------

# Actions

Edit Default Voice

Preview

Override

Delete

------------------------------------------------------------------------

# Complete Happy Path

    Upload ASM #300
     ↓
    Analyze
     ↓
    Review Characters
     ↓
    Assign Voices
     ↓
    Scene 1 Generated
     ↓
    Review Scene
     ↓
    Scene 2 Generated
     ↓
    Review Scene
     ↓
    Publish
     ↓
    Viewer Consumes

------------------------------------------------------------------------

# Critical Edge Cases

------------------------------------------------------------------------

# Edge Case 1

Unknown Character

AI:

    Unknown Male

User:

    Captain Stacy

All scenes update.

------------------------------------------------------------------------

# Edge Case 2

Speaker Ambiguity

Two characters.

One speech bubble.

System asks:

    Who is speaking?

------------------------------------------------------------------------

# Edge Case 3

Silent Panel

No dialogue.

BLACKBOLT:

    Ambient City Sounds

No narration.

------------------------------------------------------------------------

# Edge Case 4

Failed OCR

Dialogue:

    Unreadable

Scene flagged.

User edits manually.

------------------------------------------------------------------------

# Edge Case 5

Character Voice Change

Producer changes:

    Spider-Man Voice

Only affected scenes regenerate.

------------------------------------------------------------------------

# UX Principles

Every screen should optimize for:

    Fast Feedback
    Human Control
    Incremental Progress

The producer should always feel that the project is moving forward while AI work continues in the background.

This principle governs every workflow in BLACKBOLT.
