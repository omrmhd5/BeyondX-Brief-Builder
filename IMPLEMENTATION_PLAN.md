# Beyond X Brief Builder — Implementation Plan

This document is the detailed, step-by-step execution plan for building the project defined in [plan.md](plan.md). It is written to be executed directly (e.g. by an AI coding agent/Composer) phase by phase. Each phase has explicit todos, file paths, and acceptance criteria. Do not skip ahead — later phases assume earlier ones are complete and working.

Reference: `Candidate_Assessment Full-Stack AI Developer - Web Developer.pdf` and `plan.md` for full requirements, decisions, and rationale. This plan does not repeat the "why" — see `plan.md` for that. This plan is the "how" and "in what order".

---

## Phase 0 — Repo & Tooling Scaffold

**Goal**: empty-but-runnable monorepo skeleton, nothing hardcoded, both apps boot.

Todos:

1. Create root structure:
   - `/frontend` (Vite + React + TS)
   - `/backend` (Node + Express + TS)
   - Root `.gitignore` (covers `node_modules`, `.env`, `*.db`, `dist`, `build`, `.DS_Store`)
   - Root `.env.example` is NOT needed at root — each app gets its own `.env.example`.
2. **Backend scaffold**:
   - `npm init` in `/backend`, TypeScript setup (`tsconfig.json`, `ts-node-dev` or `tsx` for dev), Express, `dotenv`.
   - Folder skeleton per `plan.md` §3.2: `src/routes`, `src/controllers`, `src/services`, `src/services/ai`, `src/models`, `src/db`, `src/middleware`, `src/types`.
   - `src/index.ts` — Express app bootstrap, CORS config (allow frontend origin from env), JSON body parsing, mount routes, global error handler middleware, `PORT` from env (default 4000).
   - `backend/.env.example`:
     ```
     PORT=4000
     FRONTEND_ORIGIN=http://localhost:5173
     GEMINI_API_KEY=
     ```
   - `backend/package.json` scripts: `dev`, `build`, `start`, `test`.
3. **Frontend scaffold**:
   - `npm create vite@latest frontend -- --template react-ts` (or equivalent), then add Tailwind CSS (Vite plugin per `plan.md` §3.1): `tailwind.config.js`, `postcss.config.js` (if needed), base `index.css` with Tailwind directives.
   - Folder skeleton per `plan.md` §3.1: `src/pages`, `src/components`, `src/api`, `src/types`, `src/hooks`.
   - `frontend/.env.example`:
     ```
     VITE_API_BASE_URL=http://localhost:4000
     ```
   - `frontend/package.json` scripts: `dev`, `build`, `preview`, `test`.
4. Root-level `package.json` (optional) with convenience scripts (`dev` running both via `concurrently`), or document running both separately in README — keep simple, no need for a full workspace tool (Turborepo/NX) given the scope.
5. Install Vitest in both `frontend` and `backend` with minimal smoke test each (`1 + 1 = 2`-style placeholder) to confirm test runner wiring works before real logic exists.

**Acceptance criteria**: `cd backend && npm run dev` starts Express on port 4000 with a `GET /health` returning `{ status: "ok" }`. `cd frontend && npm run dev` starts Vite dev server showing default page with Tailwind base styles applied (e.g. a styled placeholder heading). `npm test` passes (placeholder) in both.

---

## Phase 1 — Shared Contract & Types

**Goal**: lock the API contract before building both sides against it, so frontend/backend don't drift.

Todos:

1. Define backend types in `backend/src/types/brief.ts`:
   - `BriefSubmissionInput` (companyName, sector, objective, audience, neededServices: string[], budgetRange, deadline, aiMode: 'mock' | 'real').
   - `BriefSummary` (structured output: e.g. headline, keyPoints: string[], recommendedApproach, discoveryQuestions: string[] [4-6 items]).
   - `StoredSubmission` (id, createdAt, input fields, summary, aiModeUsed: 'mock' | 'real', fallbackApplied: boolean).
   - `ApiSuccessResponse<T>` = `{ success: true; data: T }`.
   - `ApiErrorResponse` = `{ success: false; error: { message: string; fieldErrors?: Record<string,string> } }`.
2. Mirror the same shapes in `frontend/src/types/brief.ts` (kept as a manually-synced duplicate since this is a simple monorepo without a shared package — call this out as a documented simplification, not an oversight).
3. Write down the finalized API contract as comments/docstrings above the types (request/response examples) so both phases 2 and 3 build against the same shape without re-deciding it.

**Acceptance criteria**: Types compile in both projects; no implementation yet, just the agreed shapes are committed.

---

## Phase 2 — Backend Core

**Goal**: fully working `POST /api/briefs` and `GET /api/briefs` per the layered architecture in `plan.md` §3.2.

Todos:

### 2.1 Database (`src/db`, `src/models`)

- `src/db/sqlite.ts`: initialize `better-sqlite3` DB file (e.g. `data/submissions.db`, path from env or default, ensure `data/` dir exists/created at boot), create `submissions` table if not exists (id, createdAt, companyName, sector, objective, audience, neededServices [JSON text], budgetRange, deadline, summaryJson [JSON text], aiModeUsed, fallbackApplied).
- `src/models/submission.model.ts`: `insertSubmission(data)`, `getLastN(n = 5)`, `pruneOlderThanLastN(n = 5)` (delete rows beyond the most recent 5 after each insert — keep the table itself small, not just the query).

### 2.2 Validation service

- `src/services/briefValidation.service.ts`: Zod schema for `BriefSubmissionInput` — required fields, string length bounds (e.g. companyName 2-100 chars), `neededServices` non-empty array from an allowed enum list, `budgetRange` from an allowed enum list, `deadline` valid date string not in the past, `aiMode` enum `['mock','real']`. Export a `validateBriefInput(payload): { success: true; data } | { success: false; fieldErrors }`.

### 2.3 AI provider abstraction (`src/services/ai`)

- `aiProvider.interface.ts`: `interface AiProvider { generateBrief(input: BriefSubmissionInput): Promise<BriefSummary> }`.
- `mockProvider.service.ts`: deterministic — build the `BriefSummary` purely from the input fields with template/rule-based logic (e.g. headline templated from company+objective, keyPoints derived from sector/audience/services, discoveryQuestions selected deterministically from a bank of question templates keyed by sector/service, always returning exactly 4-6). No randomness (no `Math.random()`), so identical input always produces identical output — write this as a genuine constraint, not just "looks random-ish".
- `geminiProvider.service.ts`: calls Google Gemini API using `GEMINI_API_KEY` from env (via `@google/generative-ai` SDK or plain fetch to the REST endpoint), constructs a prompt from the input fields asking for the same structured shape (headline, keyPoints, recommendedApproach, 4-6 discoveryQuestions), parses/validates the model's JSON output, throws a typed error on failure/timeout/malformed output (wrap the call with a timeout, e.g. `AbortController` at 8-10s).

### 2.4 Generation orchestration service

- `src/services/briefGeneration.service.ts`: `generateBrief(input)`:
  - If `input.aiMode === 'mock'` → always use `MockProvider`.
  - If `input.aiMode === 'real'`:
    - If `process.env.GEMINI_API_KEY` missing → use `MockProvider`, return with `fallbackApplied: true` and a reason (`no_api_key`).
    - Else try `GeminiProvider`; on any thrown error/timeout → catch, log server-side, fall back to `MockProvider`, return with `fallbackApplied: true`, reason (`provider_error`).
    - On success → `aiModeUsed: 'real'`, `fallbackApplied: false`.
  - This is the one place fallback logic lives — controller and providers stay unaware of each other's fallback behavior.

### 2.5 Storage service

- `src/services/briefStorage.service.ts`: `saveSubmission(input, summary, aiModeUsed, fallbackApplied)` → calls model insert + prune; `listRecentSubmissions()` → calls model `getLastN(5)`, maps DB rows back into `StoredSubmission[]` (parsing JSON text columns).

### 2.6 Controllers & routes

- `src/controllers/briefs.controller.ts`:
  - `createBrief(req, res)`: validate via validation service → if invalid, respond `400` with normalized error + `fieldErrors`; if valid → call `briefGeneration.service` → call `briefStorage.service` to persist → respond `201` with normalized success payload (summary + aiModeUsed + fallbackApplied).
  - `listBriefs(req, res)`: call `briefStorage.service.listRecentSubmissions()` → respond `200` with normalized success payload.
  - Controllers must contain **no business logic** — only orchestration + response shaping, per `plan.md` §3.2.
- `src/routes/briefs.routes.ts`: `POST /api/briefs` → `createBrief`; `GET /api/briefs` → `listBriefs`.
- Wire router into `src/index.ts` under `/api/briefs`.

### 2.7 Middleware

- `src/middleware/errorHandler.ts`: catch-all Express error handler producing the normalized `ApiErrorResponse` shape, never leaking stack traces in production mode.
- Basic request body size limit + a simple in-memory rate limiter (e.g. `express-rate-limit`) on `POST /api/briefs` to satisfy the security/perf review deliverable.

**Acceptance criteria**: Using curl/Postman/Thunder Client:

- `POST /api/briefs` with valid mock payload → `201`, structured summary with 4-6 discovery questions, entry persisted.
- `POST /api/briefs` with invalid payload (missing fields) → `400`, field-level errors, nothing persisted.
- `POST /api/briefs` with `aiMode: 'real'` and no `GEMINI_API_KEY` set → `201`, `fallbackApplied: true`, mock result returned, no crash.
- `GET /api/briefs` → returns at most 5 most recent, newest first.

---

## Phase 3 — Frontend Core

**Goal**: full user flow wired to the real backend, styled with Tailwind, accessible and responsive.

Todos:

### 3.1 API layer & types

- `src/types/brief.ts`: mirror backend types (Phase 1).
- `src/api/briefsApi.ts`: `submitBrief(input)` → `POST ${VITE_API_BASE_URL}/api/briefs`; `fetchRecentBriefs()` → `GET .../api/briefs`. Both return typed normalized responses; both throw a typed error on network failure so the UI can show a generic "network error" state distinct from validation errors.

### 3.2 State/flow hook

- `src/hooks/useBriefSubmission.ts`: state machine `{ status: 'idle' | 'validating' | 'loading' | 'success' | 'error', result?, error? }`; exposes `submit(formValues)` that calls `briefsApi.submitBrief`, handles success/error transitions, and triggers a refetch of the last-5 list on success.

### 3.3 Components (per `plan.md` §3.1)

- `components/BriefForm/BriefForm.tsx`: all fields (company name, sector [select], objective [textarea], audience [textarea/input], needed services [checkbox group / multi-select], budget range [select], deadline [date input]), plus `AiModeToggle`. Client-side validation hints (required, min length) using a lightweight approach (e.g. simple inline checks or Zod schema reused conceptually) — but the source of truth is always the server response.
- `components/AiModeToggle/AiModeToggle.tsx`: reusable switch, Mock (default) vs Real AI, accessible (`role="switch"`/`aria-checked` or a labeled radio group — radio group is simpler and equally accessible).
- `components/LoadingState/LoadingState.tsx`: reusable spinner/skeleton, `aria-live="polite"` region announcing "Generating your brief...".
- `components/ErrorBanner/ErrorBanner.tsx`: reusable, renders general error message and/or field-level errors, `role="alert"`.
- `components/BriefSummaryResult/BriefSummaryResult.tsx`: renders headline, keyPoints, recommendedApproach; shows a small badge/notice when `fallbackApplied` is true ("Real AI unavailable — showing mock result").
- `components/DiscoveryQuestionsList/DiscoveryQuestionsList.tsx`: renders the 4-6 discovery questions as an ordered/unordered accessible list.
- `components/LastSubmissionsPanel/LastSubmissionsPanel.tsx` + `LastSubmissionCard/LastSubmissionCard.tsx`: fetch-and-render last 5, each card shows company name, timestamp, AI mode used, short summary excerpt.

### 3.4 Page

- `pages/BriefBuilderPage/BriefBuilderPage.tsx`: composes `BriefForm`, conditionally renders `LoadingState` / `ErrorBanner` / `BriefSummaryResult` + `DiscoveryQuestionsList` based on `useBriefSubmission` status, and always renders `LastSubmissionsPanel` (fetched on mount + refetched after each successful submit).
- Wire into `App.tsx` as the sole route/page for this MVP.

### 3.5 Styling & accessibility pass

- Tailwind utility classes throughout; mobile-first layout (single column on small screens, e.g. two-column form on `md:` and up).
- All inputs have associated `<label>` (`htmlFor`/`id` pairs), visible focus rings (Tailwind `focus:ring-*`), color contrast checked for text/background pairs.
- Loading and error regions use `aria-live` so screen readers announce state changes without focus jumps.

### 3.6 Analytics event logging

- Lightweight `src/lib/analytics.ts` — a `track(eventName, payload)` function that just `console.log`s a structured event object (documented in README as a stand-in for a real analytics vendor). Call at: form submit attempt, validation failure (client-caught), submission success, AI mode used, fallback applied, discovery questions rendered.

**Acceptance criteria**: Full manual flow works end-to-end against the running backend: fill form → submit (mock) → see loading → see success with summary + questions → see it appear in last-5 panel. Repeat with "Real AI" toggle with no key configured and confirm fallback notice appears. Resize to mobile width and confirm usability. Tab through the form with keyboard only and confirm all controls are reachable and labeled.

---

## Phase 4 — Automated Tests

**Goal**: satisfy "at least one automated test", but cover meaningfully more given time allows.

Todos:

1. **Backend — validation service test** (`backend/src/services/briefValidation.service.test.ts`): valid payload passes; missing required field fails with correct `fieldErrors` key; invalid `neededServices` (empty array) fails; invalid `aiMode` value fails.
2. **Backend — mock provider determinism test** (`backend/src/services/ai/mockProvider.service.test.ts`): same input called twice produces byte-identical `BriefSummary` output; output always has between 4 and 6 `discoveryQuestions`.
3. **Backend — generation fallback test** (`backend/src/services/briefGeneration.service.test.ts`): `aiMode: 'real'` with no `GEMINI_API_KEY` set (mock `process.env` in test) returns `fallbackApplied: true` and a valid mock summary, without throwing.
4. **Backend — API integration test** (`backend/src/routes/briefs.routes.test.ts`, using `supertest`): `POST /api/briefs` with valid mock payload returns `201` with expected shape; invalid payload returns `400` with `fieldErrors`.
5. **Frontend — at least one test** (`frontend/src/hooks/useBriefSubmission.test.ts` or a component test for `BriefForm`): e.g. submitting an incomplete form shows validation error state without calling the API (mock `briefsApi`).

**Acceptance criteria**: `npm test` green in both `frontend` and `backend`; capture the terminal output/screenshot for the README's "test instructions/results" requirement.

---

## Phase 5 — Security & Performance Review

**Goal**: satisfy the "40 min testing, security/performance review" deliverable explicitly and visibly.

Todos:

1. Confirm `.env` files are gitignored; confirm `.env.example` files contain no real secrets; grep the repo for accidental key strings before considering this done.
2. Confirm CORS only allows the configured `FRONTEND_ORIGIN`, not `*`.
3. Confirm the rate limiter from Phase 2.7 is active on `POST /api/briefs`.
4. Confirm request payload size limits are set (e.g. `express.json({ limit: '20kb' })`) — this form has no business needing large payloads.
5. Confirm all user input rendered in the UI is properly escaped by React by default (no `dangerouslySetInnerHTML` anywhere) — sanity check, not new work.
6. Quick performance sanity check: time a `POST /api/briefs` call in mock mode (should be near-instant, <100ms server-side excluding network) and in real mode (bounded by the 8-10s timeout); note results in README performance section.
7. Note SQLite file size/growth is inherently bounded (max 5 rows retained) — call this out as a deliberate, simple performance characteristic.

**Acceptance criteria**: a short written checklist (can live directly in README's security/privacy and performance sections) confirming each of the above with actual observed results, not just claims.

---

## Phase 6 — Documentation & Submission Packaging

**Goal**: meet every item in the PDF's "Required deliverables" and "Before you submit" checklists.

Todos:

1. **`README.md`** (root) — sections in this order, per `plan.md` §1 and §4:
   - Overview & how it maps to the assessment brief.
   - Setup (env vars for both apps, install, run dev, run tests, build).
   - Architecture (link/summarize `plan.md` §3, include the frontend/backend folder diagrams).
   - Trade-offs (SQLite + Render ephemeral disk caveat, manually-synced types instead of a shared package, mock-first design).
   - Assumptions (copy from `plan.md` §4).
   - Security/privacy (env var handling, no secrets committed, rate limiting, CORS, input validation/escaping — reference Phase 5 results).
   - Performance (reference Phase 5 timing notes, SQLite row cap).
   - Analytics events (list the events from Phase 3.6, explain they're console-logged as a stand-in).
   - Production next steps (copy from `plan.md` §6: real analytics vendor, auth/multi-tenant scoping, persistent DB, advanced rate limiting).
   - Screenshots or short demo (embed images captured during Phase 3/4).
   - Test instructions/results (how to run `npm test` in each app, paste/summarize passing output).
2. **`AI_LOG.md`** (root) — per assessment rules ("invisible AI use is not accepted"):
   - Which AI tool(s)/models were used.
   - Representative prompts used per phase (scaffold, backend, frontend, tests, docs).
   - What was AI-generated vs. hand-written/hand-edited.
   - Defects found in AI output and the fixes applied (be specific — this is explicitly graded).
   - Summary statement confirming human review of all generated code.
3. Take/organize screenshots (desktop + mobile width) of: empty form, filled form, loading state, success state with summary+questions, error/validation state, fallback notice, last-5 panel. Store under `docs/screenshots/` (or similar) and reference from README.
4. Final pass against PDF's "Before you submit" checklist:
   - Output complete/readable/opens correctly.
   - Assumptions/sources visible, no invented data.
   - AI tools/prompts/human changes disclosed (`AI_LOG.md`).
   - Editable/source files organized and included.
   - Confirm total time spent stayed within (or note honestly if not) the 4-hour timebox — list anything left unfinished explicitly in README under "next steps" or a dedicated "unfinished due to timebox" note.
5. Remove or clearly mark any leftover placeholder/scaffold code from Phase 0 that never got used.

**Acceptance criteria**: a fresh clone of the repo, following only the README, can install deps, set up env files from `.env.example`, run both apps, and run tests successfully with no undocumented steps.

---

## Execution Order Summary (Todos for the executing agent)

1. Phase 0 — Scaffold monorepo, tooling, placeholder tests, `.env.example` files.
2. Phase 1 — Define and commit shared types/contract (backend + frontend, manually mirrored).
3. Phase 2 — Build backend: db/model → validation → AI providers (mock, gemini) → generation orchestration (fallback logic) → storage service → controllers/routes → middleware (errors, CORS, rate limit).
4. Phase 3 — Build frontend: api layer/types → submission hook → components (form, toggle, loading, error, summary, questions, last-5 panel/card) → page composition → styling/a11y pass → analytics logging.
5. Phase 4 — Write automated tests (backend validation, mock determinism, fallback, API integration; frontend at least one).
6. Phase 5 — Security/performance review pass with recorded findings.
7. Phase 6 — Write README.md, AI_LOG.md, capture screenshots, final submission checklist pass.

Do not reorder phases; each depends on artifacts from the previous one (e.g. Phase 3 needs Phase 2's live API; Phase 4 needs Phase 2/3 code to test; Phase 6 needs real results from Phases 4/5 to document truthfully rather than speculatively).
