# Beyond X Brief Builder — Master Plan

Source: `Candidate_Assessment Full-Stack AI Developer - Web Developer.pdf` (BEYOND X hiring assessment, 4-hour timebox, Mid-Senior Full-Stack AI Developer / Web Developer).

## 1. Extracted Requirements (from the PDF, verbatim intent)

### Case brief

Build **"Beyond X Brief Builder"**: a client enters company name, sector, objective, audience, needed services, budget range, and desired deadline. The system:

- Validates the submission (server-side).
- Returns a structured brief summary plus **4–6 discovery questions**.
- Must run **without a paid API key** via a deterministic mock provider.
- May optionally add a **real LLM provider** via environment configuration.
- Must **never commit secrets**.

### Required deliverables (checklist from PDF)

1. Runnable, responsive UI: accessible labels, clear errors, loading/success states, mobile usability.
2. Server/API endpoint with server-side validation and a **normalized response schema**.
3. AI provider abstraction: deterministic mock works locally; optional LLM reads keys from env vars and **handles failure safely** (fallback).
4. Persist/display the **last 5 local submissions** using an appropriate lightweight approach; **explain the production data model** in README.
5. At least **one automated test** (validation, API behavior, or summary generation).
6. **README**: setup, architecture, trade-offs, assumptions, security/privacy, performance, analytics events, production next steps.
7. **AI coding log**: generated code, prompts/tools used, manual review notes, defects found, changes made.

### Assessment rules to respect

- Standalone — no external candidate collaboration.
- Stay within 4-hour timebox; list anything left unfinished.
- Only public/licensed/synthetic data; no confidential material into AI tools.
- AI use is required and must be **disclosed** (prompts, outputs, human edits) — invisible AI use is disqualifying.
- State assumptions explicitly.
- Submission = repo or ZIP with source, README, test instructions/results, screenshots or short demo, AI coding log. **No hardcoded keys. No no-code-only submission.**

## 2. Key Decisions (confirmed with you)

- **Stack**: React (Vite) frontend + Node.js/Express backend, TypeScript. Monorepo with `/frontend` and `/backend` at repo root.
- **Persistence**: SQLite file via backend (e.g. `better-sqlite3`), storing only the last 5 submissions (auto-pruned). We explicitly accept and document the trade-off that Render's free web services have an **ephemeral filesystem** — the SQLite file resets on redeploy/restart. README will explain the production data model (e.g. Postgres/Mongo Atlas with proper schema, indices, retention) as the real-world upgrade path.
- **AI provider**: Provider abstraction (`AiProvider` interface) with two implementations:
  - `MockProvider` — deterministic, rule-based, no network calls, always available.
  - `GeminiProvider` — real call to Google Gemini, reads `GEMINI_API_KEY` from env, never hardcoded.
  - A **per-request UI toggle** (switch/button on the form) lets the user pick "Mock" or "Real AI" per submission. Backend honors the choice **only if** a key is configured; otherwise it safely falls back to mock and communicates that in the response (no silent failures).
- **Testing**: Vitest for both frontend and backend.
- **Repo layout**: monorepo, `/frontend`, `/backend`, root-level `README.md`, `AI_LOG.md`, this `plan.md`.

## 3. Documents to Produce

We will produce three focused documents (in addition to this master plan) before writing code:

1. **`docs/FEATURES.md`** — Feature Requirements Document
   - User-facing form fields & validation rules (company name, sector, objective, audience, needed services [multi-select], budget range, deadline).
   - Submission flow states: idle → validating → loading → success/error.
   - Brief summary output structure + 4–6 discovery questions.
   - Last-5-submissions panel (view, maybe clear).
   - Mock/Real AI toggle behavior and messaging.
   - Accessibility requirements (labels, aria-live for errors/loading, keyboard nav, mobile breakpoints).
   - Analytics events to emit (e.g. `brief_submitted`, `brief_validation_failed`, `ai_provider_used`, `discovery_questions_viewed`).

2. **`docs/ARCHITECTURE.md`** — Technical / Architecture Requirements Document
   - System diagram (frontend ↔ backend API ↔ AI provider abstraction ↔ SQLite).
   - API contract: `POST /api/briefs` request/response schema (normalized), error shape, status codes.
   - Validation layer (e.g. Zod/Yup schema shared conceptually between client hints and server enforcement).
   - AI provider interface contract (`generateBrief(input): BriefResult`), mock determinism rules, Gemini failure/timeout handling and fallback logic.
   - Data model: current SQLite table (submissions, capped at 5, FIFO eviction) vs. production model (proper DB, user accounts, audit trail, rate limiting).
   - Security/privacy: env var handling, `.env.example`, no secrets in git, input sanitization, CORS, rate limiting notes.
   - Deployment notes: Render backend (env vars, ephemeral disk caveat), frontend static hosting (e.g. Vercel/Netlify or same Render).

3. **`docs/MVP_PLAN.md`** — MVP Implementation Plan
   - Ordered build steps mapped to the PDF's recommended time plan (scaffold → implement → test/security/perf review → README/AI log/final run).
   - Explicit "cut list" — what's in scope for the 4-hour MVP vs. explicitly deferred (documented as "unfinished/next steps" per assessment rules).

## 4. MVP Implementation Steps (high level, detailed further in `docs/MVP_PLAN.md`)

1. **Scaffold**: monorepo, Vite React + TS frontend, Express + TS backend, shared types folder, ESLint/Prettier, `.env.example`, `.gitignore` (ensures no secrets committed).
2. **Backend core**: `POST /api/briefs` endpoint, request validation (Zod), AI provider abstraction (Mock + Gemini), SQLite persistence capped at 5 rows, `GET /api/briefs` for last 5.
3. **Frontend core**: form with all required fields, client-side hints + server error display, mock/real toggle, loading/success/error states, results view (summary + discovery questions), last-5 list, responsive/accessible styling.
4. **Testing**: Vitest tests — at least backend validation test + mock provider determinism test (and ideally one frontend test).
5. **Security/perf pass**: verify no secrets committed, basic rate limiting/input caps, CORS config, response time sanity check.
6. **Docs**: `README.md` (setup, architecture, trade-offs, assumptions, security/privacy, performance, analytics events, next steps), `AI_LOG.md` (prompts, tools, human review/changes), screenshots.
7. **Final run-through** against the PDF's "Before you submit" checklist.

## 5. Explicit Assumptions (to state in README per assessment rules)

- "Needed services" is a multi-select list (e.g. Web Design, Branding, SEO, Content, Ads, App Dev) — exact options assumed since not specified in the PDF, will be clearly noted as an assumption.
- Budget range and deadline are free-form/bounded selects (assumption: budget = predefined bracket dropdown, deadline = date picker), documented as assumption.
- "Last five local submissions" interpreted as: stored server-side (SQLite), scoped globally to the running instance (no auth/user concept in this MVP) — documented as a simplification vs. production (which would scope per-account).
- Analytics events are logged client/server-side to console/log (no real analytics vendor wired), documented as a stand-in for a production analytics pipeline.

## 6. Open Items / Deferred (to be listed under "unfinished" if time runs out)

- Real analytics vendor integration.
- Auth / multi-tenant submission scoping.
- Persistent DB across Render redeploys (would require Postgres/Mongo Atlas in production).
- Advanced rate limiting / abuse protection beyond basic MVP checks.
