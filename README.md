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
| Frontend | Next.js 16 (App Router, TypeScript, Tailwind CSS 4) |
| Auth | NextAuth.js v5 (Google + GitHub OAuth, MongoDB adapter) |
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
│   │   │   ├── projects.py  # Project CRUD + presigned URL upload
│   │   │   └── public.py    # Public (no-auth) project endpoints
│   │   ├── services/        # Business logic
│   │   │   └── storage.py   # S3 storage service (presigned URLs, upload, download)
│   │   ├── models/          # Beanie document models
│   │   │   ├── project.py   # Project document
│   │   │   └── user.py      # User document (NextAuth.js compatible)
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── tasks/           # Celery task definitions
│   │   │   └── ingestion.py # PDF extraction pipeline (PyMuPDF @ 300 DPI)
│   │   ├── middleware/      # Auth middleware
│   │   │   └── auth.py      # NextAuth.js session validation
│   │   ├── exceptions.py    # Custom exception hierarchy
│   │   └── dependencies.py  # FastAPI DI
│   ├── celery_app.py        # Celery configuration
│   ├── tests/               # Backend tests (17 tests)
│   ├── Dockerfile
│   └── pyproject.toml
├── frontend/          # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── page.tsx              # Homepage (hero + comics grid)
│   │   │   ├── projects/[id]/page.tsx # Project detail page
│   │   │   └── api/auth/[...nextauth]/ # NextAuth.js route
│   │   ├── components/
│   │   │   ├── auth/        # Sign-in modal, user menu
│   │   │   ├── comics/      # Comic card, comics grid, status badge
│   │   │   ├── layout/      # Header, footer
│   │   │   ├── project/     # Workflow sidebar, page grid
│   │   │   ├── upload/      # Upload modal with drag-and-drop
│   │   │   └── ui/          # Comic-styled button, modal
│   │   └── lib/
│   │       ├── api.ts       # API client with presigned URL upload
│   │       ├── auth.ts      # NextAuth.js v5 config
│   │       └── mongodb.ts   # MongoDB client for NextAuth adapter
│   ├── Dockerfile
│   └── package.json
├── shared/            # Shared constants and types
├── infra/             # Docker Compose, scripts
│   └── docker-compose.yml
├── TRDs/              # Technical Requirement Documents
├── PRDs/              # Product Requirement Documents
└── comics_data/       # Sample comics for testing (gitignored)
```

## Features (Sprint 1)

### Authentication
- Google and GitHub OAuth via NextAuth.js v5
- MongoDB adapter for session storage (shared DB)
- Auth-on-action: upload button triggers sign-in modal if not authenticated

### Upload Pipeline
1. Frontend requests presigned URL from backend (`POST /api/v1/projects/`)
2. Browser uploads PDF directly to S3/MinIO via presigned PUT URL
3. Frontend confirms upload (`POST /api/v1/projects/{id}/confirm-upload`)
4. Celery worker extracts pages at 300 DPI using PyMuPDF, generates cover thumbnails
5. Frontend polls for status updates every 4 seconds

### Homepage
- Retro comic book theme (Bangers + Comic Neue fonts, Ben-Day dots, aged paper texture)
- Hero section with "Upload Comic" CTA
- Comics grid showing user's projects + featured public projects
- Comic-styled cards with cover images, status badges, and featured badges

### Project Page
- Workflow sidebar showing pipeline progress (Upload ✓, Characters ⟳, Script 🔒, Preview 🔒)
- Extracted page thumbnails grid with lazy loading
- Live polling during processing

### API Endpoints

**Public (no auth):**
- `GET /api/v1/health` — Health check
- `GET /api/v1/public/projects` — Featured/public projects
- `GET /api/v1/public/projects/{id}` — Public project detail

**Protected (auth required):**
- `POST /api/v1/projects/` — Create project + get presigned upload URL
- `POST /api/v1/projects/{id}/confirm-upload` — Confirm upload, start extraction
- `GET /api/v1/projects/` — User's own projects
- `GET /api/v1/projects/{id}` — Project detail
- `GET /api/v1/projects/{id}/pages` — Page image URLs (presigned GET)
- `PUT /api/v1/projects/{id}` — Update project

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

**Frontend `.env.local` requires:**
```
MONGODB_URI=mongodb://localhost:27017/blackbolt
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GITHUB_CLIENT_ID=<your-github-client-id>
GITHUB_CLIENT_SECRET=<your-github-client-secret>
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
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
# All backend tests (17 tests)
cd backend && .venv/bin/pytest

# Single test
cd backend && .venv/bin/pytest tests/test_file.py::test_name -v

# Frontend lint
cd frontend && pnpm lint

# Frontend build
cd frontend && pnpm build
```

### Linting & Formatting

Pre-commit hooks handle this automatically. To set up:

```bash
pip install pre-commit
pre-commit install
```

To run manually:

```bash
# Backend
cd backend && ruff check app/ tests/ && ruff format --check app/ tests/

# Frontend
cd frontend && pnpm lint
```

### API

All endpoints are under `/api/v1/`. Interactive docs available at `/docs` (Swagger) and `/redoc` (ReDoc) when the backend is running.

### S3 Key Structure

```
users/{user_id}/projects/{project_id}/
  ├── original/{filename}.pdf    # Raw uploaded PDF
  ├── pages/001.png              # Extracted pages at 300 DPI
  ├── pages/002.png
  ├── covers/original.png        # Auto-generated from page 1
  └── covers/thumbnail.png       # Resized cover for grid display
```
