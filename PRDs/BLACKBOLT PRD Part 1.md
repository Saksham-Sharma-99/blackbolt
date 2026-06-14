# BLACKBOLT PRD

## Part 1 --- Vision, Strategy, Product Principles, Personas & Core Architecture

Version: 1.0

Status: Draft

Author: Saksham

Product Name: BLACKBOLT

Tagline: Turn static comics into directed, voice-cast, shareable audio experiences.

------------------------------------------------------------------------

# 1. Executive Summary

BLACKBOLT is an AI-powered Comic Adaptation Studio that transforms static comic books into fully produced, voice-acted, audio-enhanced experiences.

Unlike traditional text-to-speech tools, BLACKBOLT does not merely read comic dialogue aloud.

Instead, BLACKBOLT analyzes a comic, identifies characters, extracts dialogue, determines speakers, constructs a script, assigns voices, generates ambient audio, organizes scenes, and allows a human producer to review and direct the adaptation before publishing.

The final output is not simply an MP3.

The primary output is a shareable BLACKBOLT Experience:

- Comic displayed visually
- Script synchronized to playback
- Character voices
- Scene music
- Ambient audio
- Playback controls
- Comments and sharing

BLACKBOLT positions itself as a production platform rather than a generation platform.

The user is the director.

The AI is the production crew.

------------------------------------------------------------------------

# 2. Product Vision

## Vision Statement

Create the world's best platform for transforming comics into immersive audio experiences.

------------------------------------------------------------------------

## Long-Term Vision

A comic should be consumable in multiple ways:

- Read
- Listen
- Watch
- Adapt
- Share

BLACKBOLT focuses on enabling listening without losing the identity of comics.

The goal is not to replace comics.

The goal is to unlock a new mode of consumption.

------------------------------------------------------------------------

## Product Philosophy

Most AI products attempt to automate everything.

BLACKBOLT intentionally inserts human review into the workflow.

Reason:

Comic readers immediately notice:

- Wrong character
- Wrong voice
- Wrong emotion
- Wrong speaker attribution

These errors destroy immersion.

Therefore BLACKBOLT optimizes for:

Human-approved productions.

Not autonomous productions.

------------------------------------------------------------------------

# 3. Why Now

Several technologies have matured simultaneously:

## Computer Vision

Modern vision models can:

- detect comic panels
- detect speech bubbles
- detect characters
- perform OCR

with acceptable quality.

------------------------------------------------------------------------

## Local TTS

Modern local models can generate:

- high-quality voices
- multiple speakers
- emotional speech

without requiring expensive APIs.

------------------------------------------------------------------------

## LLMs

Modern LLMs can:

- infer speakers
- infer emotion
- infer narration
- identify scene transitions

from comic context.

------------------------------------------------------------------------

## Consumer Behavior

People increasingly consume content while:

- walking
- commuting
- exercising
- working

Comics remain a visually constrained medium.

BLACKBOLT expands where comics can be consumed.

------------------------------------------------------------------------

# 4. Problem Statement

## Current State

Comics require visual attention.

Users cannot:

- consume comics while walking
- consume comics while driving
- consume comics while multitasking

without losing context.

------------------------------------------------------------------------

## Existing Solutions

### Audiobooks

Good audio.

No visuals.

------------------------------------------------------------------------

### Motion Comics

Expensive to produce.

Require manual animation.

------------------------------------------------------------------------

### Screen Readers

No character awareness.

No voices.

No emotion.

No production value.

------------------------------------------------------------------------

### AI TTS Readers

Read text.

Do not understand comics.

------------------------------------------------------------------------

## Core Problem

Comic books contain:

- dialogue
- characters
- emotion
- scene transitions
- action
- atmosphere

Traditional TTS systems only understand text.

BLACKBOLT understands the comic.

------------------------------------------------------------------------

# 5. Product Principles

These principles drive every product decision.

------------------------------------------------------------------------

## Principle 1

Human Verified \> AI Generated

Every major AI output must be reviewable.

Examples:

- Character identity
- Voices
- Speakers
- Dialogue
- Music

------------------------------------------------------------------------

## Principle 2

Characters Are First-Class Objects

Characters are not labels.

Characters are assets.

Every character has:

- identity
- images
- voice
- emotion profile

------------------------------------------------------------------------

## Principle 3

Production Over Generation

BLACKBOLT is a studio.

Not a one-click generator.

------------------------------------------------------------------------

## Principle 4

Scene-Based Editing

Users think in scenes.

Not pages.

Not OCR blocks.

Not bubbles.

Therefore the editing workflow is scene-centric.

------------------------------------------------------------------------

## Principle 5

Shareable Experiences Matter More Than Files

The primary output is:

Published Experience

Not:

MP3

------------------------------------------------------------------------

## Principle 6

Progressive Production

Users should never wait for an entire issue.

Generation should occur continuously.

------------------------------------------------------------------------

# 6. Target Users

BLACKBOLT serves two primary personas.

------------------------------------------------------------------------

# Persona 1 --- Producer

The creator.

Produces adaptations.

------------------------------------------------------------------------

## Description

Comic fan creating productions.

------------------------------------------------------------------------

## Goals

- Adapt comics
- Improve immersion
- Create shareable experiences
- Customize voices

------------------------------------------------------------------------

## Actions

Can:

- Upload
- Review
- Edit
- Publish

------------------------------------------------------------------------

## Pain Points

- Incorrect speakers
- Incorrect voices
- Long generation times

------------------------------------------------------------------------

## Success Criteria

Produces a finished adaptation.

------------------------------------------------------------------------

# Persona 2 --- Viewer

Consumes productions.

------------------------------------------------------------------------

## Description

End user listening to finished productions.

------------------------------------------------------------------------

## Goals

- Enjoy story
- Listen passively
- Follow script

------------------------------------------------------------------------

## Actions

Can:

- Listen
- Comment
- Change speed

Cannot:

- Modify project

------------------------------------------------------------------------

## Success Criteria

Completes listening session.

Shares production.

------------------------------------------------------------------------

# 7. Product Positioning

BLACKBOLT is not:

- Audible for comics
- OCR + TTS
- Screen reader

BLACKBOLT is:

AI Comic Adaptation Studio

------------------------------------------------------------------------

# 8. Product Scope

## V1 Scope

Supported:

- English comics
- Spider-Man focused optimization
- Desktop only
- Voice casting
- Character review
- Scene music
- Shareable experiences

------------------------------------------------------------------------

## Explicit Non-Goals

Not in V1:

- Translation
- Mobile production workflow
- Voice cloning
- Custom voice uploads
- Real-time collaboration
- Motion comic animation

------------------------------------------------------------------------

# 9. Success Metrics

Primary Metrics

------------------------------------------------------------------------

## Minutes Listened

Measures actual engagement.

------------------------------------------------------------------------

## Projects Created

Measures creation activity.

------------------------------------------------------------------------

## Projects Published

Measures production completion.

------------------------------------------------------------------------

## Projects Shared

Measures virality.

------------------------------------------------------------------------

Secondary Metrics

- Scene completion rate
- Character review completion rate
- Average listening duration
- Viewer return rate

------------------------------------------------------------------------

# 10. Core Domain Model

BLACKBOLT revolves around a small number of core objects.

------------------------------------------------------------------------

Project

Top-level container.

Contains:

- issue
- scenes
- characters
- voices
- scripts
- audio

------------------------------------------------------------------------

Scene

Primary production unit.

Contains:

- panels
- dialogue
- music
- generated audio

------------------------------------------------------------------------

Character

Represents an entity in the comic.

Contains:

- name
- images
- voice
- confidence
- metadata

------------------------------------------------------------------------

Voice Assignment

Maps:

Character → Voice

------------------------------------------------------------------------

Dialogue

Represents a spoken line.

Contains:

- speaker
- text
- emotion
- timestamps

------------------------------------------------------------------------

Music Segment

Represents scene-level music.

Contains:

- theme
- duration
- volume

------------------------------------------------------------------------

Production

Generated output.

Contains:

- audio
- synchronization
- playback metadata

------------------------------------------------------------------------

# 11. Core Product Lifecycle

A BLACKBOLT project moves through a fixed lifecycle.

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

At no point can a project bypass Character Review.

This is a hard product constraint.

------------------------------------------------------------------------

# 12. Progressive Production Model

Traditional systems:

Upload

↓

Wait

↓

Consume

BLACKBOLT:

Upload

↓

Analyze

↓

Review Cast

↓

Review Scene 1

↓

Review Scene 2

↓

Review Scene 3

while

Scene 4+

continue generating.

This dramatically reduces perceived latency.

------------------------------------------------------------------------

# 13. Competitive Differentiation

The key innovation is not OCR.

The key innovation is combining:

- Character understanding
- Human review
- Voice casting
- Scene production
- Shareable playback

into a single workflow.

No existing product currently offers this combination.

------------------------------------------------------------------------

# Part 1 Summary

BLACKBOLT is an AI Comic Adaptation Studio.

It transforms comics into reviewed, directed, voice-cast productions.

The user acts as the director.

The AI acts as the production crew.

The primary artifact is a shareable experience rather than an audio file.

Everything in the remainder of the PRD should reinforce these principles.
