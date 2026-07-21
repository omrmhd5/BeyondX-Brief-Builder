# Beyond X Brief Builder

A full-stack prototype for the **Beyond X Full-Stack AI Developer / Web Developer** hiring assessment. Clients enter project details and receive a structured brief summary plus 4–6 discovery questions, powered by a deterministic mock AI provider with optional Google Gemini integration.

## Overview

This project implements the assessment brief:

- Responsive, accessible form UI (React + Tailwind CSS)
- Server-side validation and normalized API responses (Node/Express)
- AI provider abstraction: deterministic mock (no API key required) + optional Gemini via env var
- Last 5 submissions persisted in SQLite and displayed in the UI
- Automated tests (Vitest) for validation, mock determinism, fallback, and API behavior
- AI usage disclosed in [`docs/AI_LOG.md`](docs/AI_LOG.md)

## Setup

### Prerequisites

- Node.js 20+
- npm

### Environment variables

**Backend** — copy `backend/.env.example` to `backend/.env`:

```env
PORT=5000
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_API_KEY=          # optional — leave empty to use mock only
```

**Frontend** — copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Install & run

```bash
# From repo root — install all deps
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Run both servers (from root)
npm run dev

# Or separately:
cd backend && npm run dev    # http://localhost:5000
cd frontend && npm run dev   # http://localhost:5173
```

### Run tests

```bash
cd backend && npm test
cd frontend && npm test
```

## Architecture

See [`docs/plan.md`](docs/plan.md) for the full master plan.

### Frontend (React + Vite + Tailwind)

- **Pages** compose **components** (`BriefBuilderPage` → `BriefForm`, results, last-5 panel)
- `hooks/useBriefSubmission` manages submit flow state machine
- `api/briefsApi.ts` wraps backend endpoints

### Backend (Node/Express, layered)

```
routes → controllers → services → models
```

- **Controllers**: thin orchestration only
- **Services**: validation, AI generation + fallback, storage business logic
- **Models**: SQLite data access (`better-sqlite3`)

### API

| Method | Endpoint      | Description                  |
| ------ | ------------- | ---------------------------- |
| GET    | `/health`     | Health check                 |
| POST   | `/api/briefs` | Submit brief, get AI summary |
| GET    | `/api/briefs` | List last 5 submissions      |

Normalized response shape: `{ success: true, data }` or `{ success: false, error: { message, fieldErrors? } }`.

## Trade-offs

- **SQLite on Render**: lightweight for MVP, but Render's free tier has an **ephemeral filesystem** — the DB resets on redeploy/restart. Production would use Postgres or MongoDB Atlas with proper schema, indices, and retention policies.
- **Manually-synced types**: frontend and backend types are duplicated (no shared package) to keep the monorepo simple.
- **Mock-first design**: deterministic mock provider ensures reviewers can fully test without a Gemini key. The UI toggle lets recruiters choose mock vs real per submission.

## Assumptions

- "Needed services" options: Web Design, Branding, SEO, Content, Ads, App Dev (not specified in PDF).
- Budget range = predefined dropdown; deadline = date picker.
- "Last five local submissions" = server-side SQLite, globally scoped (no auth/user accounts in MVP).
- Analytics events logged to browser/server console only (no real analytics vendor).

## Security & Privacy

| Check                                                      | Status          |
| ---------------------------------------------------------- | --------------- |
| `.env` gitignored, no secrets in repo                      | Verified        |
| `GEMINI_API_KEY` read from env only                        | Yes             |
| CORS restricted to `FRONTEND_ORIGIN`                       | Yes (not `*`)   |
| Rate limiting on `POST /api/briefs`                        | 30 req / 15 min |
| Request body size limit                                    | 20 KB           |
| User input escaped by React (no `dangerouslySetInnerHTML`) | Yes             |
| Server-side validation (Zod) on all submissions            | Yes             |

## Performance

- Mock provider responses are near-instant (< 100 ms server-side).
- Gemini calls bounded by 10 s timeout with safe fallback to mock.
- SQLite table capped at 5 rows (FIFO eviction) — bounded storage growth.

## Analytics Events

Logged via `frontend/src/lib/analytics.ts` (console stand-in):

- `brief_submitted`
- `brief_validation_failed`
- `ai_provider_used`
- `ai_provider_fallback`
- `discovery_questions_viewed`

## Production Next Steps

- Real analytics vendor (Segment, PostHog, etc.)
- Auth / multi-tenant submission scoping
- Persistent DB (Postgres/Mongo Atlas) for Render deployment
- Advanced rate limiting / abuse protection
- Shared types package or OpenAPI codegen

## Test Results

```bash
cd backend && npm test   # validation, mock determinism, fallback, API integration
cd frontend && npm test  # useBriefSubmission hook test
```

## AI Usage

Full disclosure in [`docs/AI_LOG.md`](docs/AI_LOG.md) — required by the assessment.

## Project Docs

- [`docs/plan.md`](docs/plan.md) — master plan (requirements, architecture, decisions)
- [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — phased build steps
- [`docs/AI_LOG.md`](docs/AI_LOG.md) — AI usage disclosure
- [`docs/Candidate_Assessment Full-Stack AI Developer - Web Developer.pdf`](docs/Candidate%20Assessment%20Full-Stack%20AI%20Developer%20-%20Web%20Developer.pdf) — original assessment brief
