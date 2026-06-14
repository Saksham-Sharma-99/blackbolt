# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BLACKBOLT is an AI-powered Comic Adaptation Studio that transforms static comic books into fully produced, voice-acted, audio-enhanced shareable experiences. The system analyzes comics, identifies characters, extracts dialogue, determines speakers, constructs scripts, assigns voices, generates ambient audio, and allows human producers to review and direct the adaptation before publishing.

## Architecture

The system is a multi-pipeline processing platform with 20 pipelines across 6 layers:

1. **Ingestion** — File upload, format detection, page extraction/normalization
2. **Vision** — Panel detection, bubble detection, reading order, OCR (per-page, parallelizable)
3. **Comic Understanding** — Character detection/consolidation, speaker attribution, emotion detection, scene detection, narration
4. **Production Setup** — Voice assignment, music selection
5. **Audio Production** — Dialogue TTS, ambient audio, audio stitching (per-scene, parallelizable)
6. **Orchestration & Delivery** — Progressive generation, publishing, playback sync, regeneration

Two mandatory human review gates exist: Character Review (after pipelines 06+07) and Scene Review (after pipeline 16).

Pipeline TRDs are in `TRDs/`. PRDs are in `PRDs/`.

## Key Design Principles

- **Human Verified > AI Generated**: Every major AI output must be reviewable
- **Characters are first-class objects**: Not labels — they have identity, images, voice, emotion profile
- **Scene-based editing**: The editing workflow is scene-centric, not page/bubble-centric
- **Progressive production**: Scene N+1 generates while Scene N is being reviewed
- **Skip & Flag failure model**: Never block the entire project on a single failure; mark failed items for review and continue

## Domain Model

Core objects: Project → Scenes → Panels → Bubbles → Dialogue lines. Characters and Voice Assignments are cross-cutting. Projects follow a fixed lifecycle: Draft → Analyzing → Character Review Required → Producing → Scene Review Required → Ready → Published.

## Data Directory

`comics_data/` contains sample comic PDFs for testing. These files are gitignored.

---

## Tech Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: Next.js (App Router, TypeScript)
- **Database**: MongoDB (async via Motor + Beanie ODM)
- **Object Storage**: S3 (MinIO for local dev)
- **Task Queue**: Celery + Redis
- **Logging**: structlog (structured JSON logs)
- **Config**: pydantic-settings (backend), Next.js built-in env vars (frontend)
- **Python Packages**: uv
- **JS Packages**: pnpm
- **Pre-commit**: ruff, black, isort, trailing-whitespace, end-of-file-fixer

## Repo Structure

Monorepo layout:
```
/backend       — FastAPI application
/frontend      — Next.js application
/shared        — Shared types, constants
/infra         — Docker, scripts, config
```

## Git Rules

- **Claude must NEVER commit or push.** The user handles all git operations.
- Do not run `git commit`, `git push`, `git add`, or any write git commands.

---

## Mandatory Workflow Rules

### Always Test

- **Every code change must be tested before declaring work done.** Run the relevant test suite after writing or modifying code.
- Write tests for new functionality. No untested code gets shipped.
- Backend: run `cd backend && pytest` after changes. Run specific tests for targeted changes.
- Frontend: run `cd frontend && pnpm lint` after changes.

### Always Pass Pre-commit Hooks

- All code must pass pre-commit hooks (ruff, black, isort, trailing-whitespace, end-of-file-fixer) before the user commits.
- Since Claude cannot run `git commit`, run `cd backend && ruff check app/ tests/ && ruff format --check app/ tests/ && black --check app/ tests/ && isort --check-only app/ tests/` to verify linting passes after writing Python code.
- Fix any lint or formatting issues immediately — do not leave them for the user.

### Always Update README

- When adding new features, endpoints, services, setup steps, or dependencies, update `README.md` to reflect the changes.
- Keep the README accurate and current. It is the single source of truth for project setup and usage.

### Coding Principles

- **KISS** — Keep it simple. Choose the simplest solution that works. Avoid clever abstractions.
- **DRY** — Don't repeat yourself. Extract shared logic, but only when there are 3+ real usages — not preemptively.
- **Simplicity over everything** — Readable, obvious code beats elegant, compact code. If a reviewer needs to pause and think, simplify it.
- No premature optimization. No speculative abstractions. No over-engineering.
- Write code that a new developer can understand in one read.

---

## Backend Conventions

### Project Structure

FastAPI with app factory pattern and routers per domain:
```
backend/
  app/
    main.py              — App factory, lifespan events
    config.py            — pydantic-settings config
    routers/             — One module per domain (ingestion, projects, characters, etc.)
    services/            — Business logic, one module per domain
    models/              — Beanie document models
    schemas/             — Pydantic request/response schemas
    tasks/               — Celery task definitions
    exceptions.py        — Custom exception hierarchy
    dependencies.py      — FastAPI dependency injection
  celery_app.py          — Celery configuration
  tests/
```

### Python Style

- **Formatter**: Black (line length 88)
- **Linter**: Ruff
- **Import ordering**: isort (Black-compatible profile)
- **Type hints**: Strict — required on all public function signatures and return types
- **Docstrings**: Google-style, required on public APIs

### API Design

- All routes under `/api/v1/`
- Every endpoint has Pydantic request and response models — never return raw dicts
- Consistent error response shape across all endpoints
- Use FastAPI's auto-generated OpenAPI docs

### MongoDB / Beanie

- All document models inherit from `beanie.Document`
- Use Pydantic validators for data integrity
- Never use raw `motor` queries when Beanie methods exist
- Access config via `pydantic-settings`, never `os.environ` directly

### Async & Task Queue

- Long-running work (archive extraction, PDF conversion, S3 upload, pipeline processing) goes to Celery tasks
- FastAPI endpoints return a job/task ID immediately for async operations
- Celery tasks use Redis as broker
- Use `async def` for FastAPI route handlers; Celery tasks are sync (run in worker processes)

### Error Handling

- Custom exception hierarchy rooted in a base `BlackboltError`
  - `ValidationError` — input validation failures
  - `IngestionError` — file processing failures
  - `StorageError` — S3/Mongo operation failures
- Register FastAPI exception handlers that return a consistent JSON error shape
- Use structlog for all logging — never `print()` or bare `logging`
- Log structured fields (project_id, task_id, etc.), not interpolated strings

### Testing (Backend)

- **Framework**: pytest
- **Style**: Basic assertions, manual setup/teardown
- **Integration tests**: Real DB (use a test MongoDB instance)
- **Run single test**: `pytest tests/test_file.py::test_name -v`
- **Run all**: `pytest`

---

## Frontend Conventions

### Next.js

- **Router**: App Router (not Pages Router)
- **TypeScript**: Enabled, but not strict mode
- **Styling**: Tailwind CSS
- **Linting**: ESLint + Prettier
- **Components**: Server components by default; add `"use client"` only when needed

### API Communication

- All backend calls go through a centralized API client module
- Use `NEXT_PUBLIC_API_URL` env var for the backend base URL
- Handle loading and error states consistently

---

## Local Development

### Docker Compose

Full stack via `docker compose up`:
- **fastapi** — Backend API server
- **celery-worker** — Celery task worker
- **nextjs** — Frontend dev server
- **mongodb** — Database
- **redis** — Celery broker + result backend
- **minio** — S3-compatible object storage

### Environment Variables

- Backend: `.env` file loaded by pydantic-settings. Never commit `.env`.
- Frontend: `.env.local` for Next.js. Prefix public vars with `NEXT_PUBLIC_`.

### Running Without Docker

```bash
# Backend
cd backend && uvicorn app.main:app --reload

# Celery worker
cd backend && celery -A celery_app worker --loglevel=info

# Frontend
cd frontend && pnpm dev

# Install backend deps
cd backend && uv pip install -e ".[dev]"

# Install frontend deps
cd frontend && pnpm install

# Run backend tests
cd backend && pytest

# Run single backend test
cd backend && pytest tests/test_file.py::test_name -v

# Docker Compose (from infra/)
cd infra && docker compose up
```
