# BLACKBOLT

AI-powered Comic Adaptation Studio — turn static comics into directed, voice-cast, shareable audio experiences.

## What is BLACKBOLT?

BLACKBOLT analyzes comic books, identifies characters, extracts dialogue, determines who's speaking, constructs a script, assigns voices, generates ambient audio, and lets you review and direct the entire adaptation before publishing.

The final output is a **shareable BLACKBOLT Experience**: comic displayed visually with synchronized script, character voices, scene music, ambient audio, and playback controls.

**You are the director. The AI is the production crew.**

### How It Works

A comic goes through 6 processing layers:

1. **Ingestion** — Upload CBZ, CBR, PDF, or images. Pages are extracted, normalized, and ordered.
2. **Vision** — Panels, speech bubbles, reading order, and text are detected per page.
3. **Comic Understanding** — Characters are identified and consolidated, speakers attributed, emotions detected, scenes defined.
4. **Production Setup** — Voices are assigned to characters, music selected per scene.
5. **Audio Production** — Dialogue is synthesized via TTS, ambient audio generated, everything stitched together.
6. **Delivery** — Scenes are progressively generated, reviewed, and published as a shareable experience.

Two mandatory human review gates ensure quality:
- **Character Review** — Verify character identities and voice assignments before production.
- **Scene Review** — Review script, dialogue, emotion, and music before publishing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11+) |
| Frontend | Next.js (App Router, TypeScript, Tailwind CSS) |
| Database | MongoDB (Motor + Beanie ODM) |
| Object Storage | S3 (MinIO for local dev) |
| Task Queue | Celery + Redis |
| Logging | structlog (structured JSON) |
| Python Packages | uv |
| JS Packages | pnpm |

## Project Structure

```
blackbolt/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── main.py          # App factory, lifespan
│   │   ├── config.py        # pydantic-settings config
│   │   ├── routers/         # API route handlers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Beanie document models
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── tasks/           # Celery task definitions
│   │   ├── exceptions.py    # Custom exception hierarchy
│   │   └── dependencies.py  # FastAPI DI
│   ├── celery_app.py        # Celery configuration
│   ├── tests/               # Backend tests
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities, API client
│   ├── Dockerfile
│   └── package.json
├── shared/            # Shared constants and types
├── infra/             # Docker Compose, scripts
│   └── docker-compose.yml
├── TRDs/              # Technical Requirement Documents
├── PRDs/              # Product Requirement Documents
└── comics_data/       # Sample comics for testing (gitignored)
```

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [pnpm](https://pnpm.io/) (JS package manager)
- Docker & Docker Compose

### 1. Clone and configure environment

```bash
git clone <repo-url> blackbolt
cd blackbolt

# Create environment files from examples
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### 2. Option A: Run with Docker Compose (recommended)

```bash
cd infra
docker compose up
```

This starts all services:
- Backend API at `http://localhost:8000`
- Frontend at `http://localhost:3000`
- MongoDB at `localhost:27017`
- Redis at `localhost:6379`
- MinIO at `http://localhost:9000` (console at `http://localhost:9001`, user/pass: `minioadmin`)

### 2. Option B: Run services individually

Start infrastructure services:
```bash
cd infra
docker compose up mongodb redis minio
```

In separate terminals:

```bash
# Backend
cd backend
uv pip install -e ".[dev]"
uvicorn app.main:app --reload
```

```bash
# Celery worker
cd backend
celery -A celery_app worker --loglevel=info
```

```bash
# Frontend
cd frontend
pnpm install
pnpm dev
```

### 3. Verify setup

- Backend health: `curl http://localhost:8000/api/v1/health`
- Frontend: Open `http://localhost:3000`
- API docs: Open `http://localhost:8000/docs`
- MinIO console: Open `http://localhost:9001`

## Development

### Running Tests

```bash
# All backend tests
cd backend && pytest

# Single test
cd backend && pytest tests/test_file.py::test_name -v
```

### Linting & Formatting

Pre-commit hooks handle this automatically. To set up:

```bash
pip install pre-commit
pre-commit install
```

To run manually:

```bash
pre-commit run --all-files
```

### API

All endpoints are under `/api/v1/`. Interactive docs available at `/docs` (Swagger) and `/redoc` (ReDoc) when the backend is running.
