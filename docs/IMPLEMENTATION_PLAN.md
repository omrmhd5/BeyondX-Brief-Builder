# Beyond X Brief Builder — Implementation Plan

Step-by-step build plan for the project defined in [PROJECT_SPEC.md](PROJECT_SPEC.md). Requirements and rationale live in `PROJECT_SPEC.md`; this document is **how to implement** only.

**Stack**: React (Vite) + Tailwind + TypeScript | Node/Express + TypeScript | SQLite | Vitest  
**Backend port**: `5000`

---

## Completion status

| Phase | Scope                                   | Status                         |
| ----- | --------------------------------------- | ------------------------------ |
| 0     | Repo & tooling scaffold                 | Done                           |
| 1     | Shared API contract & types             | Done                           |
| 2     | Backend core (API, AI, SQLite)          | Done                           |
| 3     | Frontend core (form, results, panel)    | Done                           |
| 4     | Automated tests                         | Done — 15 backend + 1 frontend |
| 5     | Security & performance (code/config)    | Done                           |
| 6     | Custom form fields & `briefFormUtils`   | Done                           |
| 7     | Submissions CRUD UI + mock/Gemini fixes | Done                           |

---

## Phase 0 — Repo & Tooling Scaffold

**Goal**: Runnable monorepo skeleton; both apps boot; no secrets hardcoded.

### Todos

1. **Root structure**
   - `/frontend` (Vite + React + TS)
   - `/backend` (Node + Express + TS)
   - Root `.gitignore`: `node_modules`, `.env`, `*.db`, `data/`, `dist`, `build`

2. **Backend scaffold**
   - `tsx` for dev, `tsc` for build, Express, `dotenv`, `cors`
   - Folders: `src/routes`, `src/controllers`, `src/services`, `src/services/ai`, `src/models`, `src/db`, `src/middleware`, `src/types`
   - `src/index.ts`: CORS (`FRONTEND_ORIGIN`), `express.json({ limit: '20kb' })`, health route, mount `/api/briefs`, global error handler, `PORT` default `5000`
   - `backend/.env.example`:
     ```
     PORT=5000
     FRONTEND_ORIGIN=http://localhost:5173
     GEMINI_API_KEY=
     GEMINI_MODEL=gemini-3.1-flash-lite
     ```
   - Scripts: `dev`, `build`, `start`, `test`

3. **Frontend scaffold**
   - Vite React TS + Tailwind (`@tailwindcss/vite`)
   - Folders: `src/pages`, `src/components`, `src/api`, `src/types`, `src/hooks`, `src/lib`
   - `frontend/.env.example`: `VITE_API_BASE_URL=http://localhost:5000`
   - Scripts: `dev`, `build`, `preview`, `test`

4. **Root** `package.json` with `concurrently` → `npm run dev` runs both apps

5. **Vitest** wired in both packages (smoke test to confirm runner)

### Acceptance criteria

- `GET /health` → `{ status: "ok" }` on port 5000
- Frontend dev server loads with Tailwind styles
- `npm test` passes in both packages

---

## Phase 1 — Shared Contract & Types

**Goal**: Lock API shapes before building frontend and backend.

### Todos

1. **`backend/src/types/brief.ts`**
   - `BriefSubmissionInput`: companyName, sector (`string`), objective, audience, neededServices (`string[]`), budgetRange (`string`), deadline, aiMode (`'mock' | 'real'`)
   - `BriefSummary`: headline, keyPoints, recommendedApproach, discoveryQuestions (4–6)
   - `BriefCreateResponse`: summary, aiModeUsed, fallbackApplied, fallbackReason?
   - `StoredSubmission`: id, createdAt, input fields, summary, aiModeUsed, fallbackApplied
   - `ApiSuccessResponse<T>`, `ApiErrorResponse`, `ApiResponse<T>`
   - Preset constants for UI: `SECTORS`, `SERVICE_OPTIONS`, `BUDGET_RANGES` (not strict server enums)

2. **`frontend/src/types/brief.ts`** — mirror backend; add `BriefFormValues` for form state:
   - `sectorPreset`, `sectorCustom`, `neededServices`, `customServices`, `budgetPreset`, `customBudgetAmount`, etc.

3. Document request/response examples in file comments (POST/GET/DELETE contracts)

### Acceptance criteria

- Types compile in both projects before feature code lands

---

## Phase 2 — Backend Core

**Goal**: Layered API — `POST`/`GET` briefs, validation, AI generation, SQLite persistence.

### 2.1 Database

- **`src/db/sqlite.ts`**: `better-sqlite3`, `data/submissions.db`, WAL mode, `busy_timeout = 5000`, auto-create `data/` dir
- **Table `submissions`**: id, createdAt, companyName, sector, objective, audience, neededServices (JSON), budgetRange, deadline, summaryJson (JSON), aiModeUsed, fallbackApplied

- **`src/models/submission.model.ts`**
  - `insertSubmission(data)`
  - `getLastN(n = 5)`
  - `pruneOlderThanLastN(n = 5)` — FIFO after each insert
  - `deleteSubmissionById(id)` → boolean
  - `deleteAllSubmissions()` → count deleted

### 2.2 Validation

- **`src/services/briefValidation.service.ts`** (Zod)
  - `companyName` 2–100 chars
  - `sector` 2–100 chars (free text)
  - `objective` 10–1000, `audience` 5–500
  - `neededServices` non-empty array of strings (2–80 chars each, max 12)
  - `budgetRange` 2–100 chars (free text)
  - `deadline` valid date, not in the past
  - `aiMode` enum `mock` | `real`
  - Export `validateBriefInput(payload)` → success + data or fieldErrors

### 2.3 AI providers (`src/services/ai`)

- **`aiProvider.interface.ts`**: `generateBrief(input) → Promise<BriefSummary>`
- **`mockProvider.service.ts`**
  - Deterministic templates from input (no `Math.random()`)
  - `pickQuestions()`: use `Set` for unique pool, deterministic index by hash — **must not infinite-loop** on duplicate question strings
  - Always return 4–6 discovery questions (pad with fallbacks if needed)
- **`geminiProvider.service.ts`**
  - Model: `process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'`
  - `@google/generative-ai`, JSON response mime type
  - `extractJson()` for fenced markdown responses
  - 10s timeout; throw on failure

### 2.4 Generation orchestration

- **`src/services/briefGeneration.service.ts`**
  - `mock` → always MockProvider
  - `real` + no key → mock + `fallbackApplied: true`, `fallbackReason: 'no_api_key'`
  - `real` + key → try Gemini; on error → mock + `fallbackReason: 'provider_error'`
  - Single place for all fallback logic

### 2.5 Storage service

- **`src/services/briefStorage.service.ts`**
  - `saveSubmission(input, result)` → insert + prune
  - `listRecentSubmissions()` → map rows to `StoredSubmission[]`
  - `removeSubmission(id)`, `removeAllSubmissions()`

### 2.6 Controllers & routes

- **`src/controllers/briefs.controller.ts`** (thin — orchestration only)
  - `createBrief` → validate → generate → save → `201`
  - `listBriefs` → `200` with array
  - `deleteBrief` → validate id → `removeSubmission` → `200` or `404`
  - `deleteAllBriefs` → `200` with `{ deletedCount }`

- **`src/routes/briefs.routes.ts`**
  - `GET /` → listBriefs
  - `POST /` → createBrief (+ rate limiter)
  - `DELETE /` → deleteAllBriefs
  - `DELETE /:id` → deleteBrief

- **`src/index.ts`**: CORS methods `GET`, `POST`, `DELETE`, `OPTIONS`

### 2.7 Middleware

- **`errorHandler.ts`**: normalized `ApiErrorResponse`; no stack traces in production
- **Rate limit**: 30 req / 15 min on `POST /api/briefs`
- **Body limit**: 20kb

### Acceptance criteria

- Valid `POST` (mock) → `201`, 4–6 questions, row in DB
- Invalid `POST` → `400` + `fieldErrors`
- `POST` real + no key → `201` + `fallbackApplied: true`
- `GET` → ≤5 submissions, newest first
- `DELETE /:id` and `DELETE /` work as expected

---

## Phase 3 — Frontend Core

**Goal**: Full submit flow, results, past-submissions panel — Tailwind, accessible, responsive.

### 3.1 API layer

- **`src/api/briefsApi.ts`**
  - `submitBrief` — POST, 30s `AbortController` timeout
  - `fetchRecentBriefs` — GET
  - `deleteBrief(id)`, `deleteAllBriefs` — DELETE
  - `NetworkError` class; `isApiError()` type guard
  - Handle non-JSON / HTML error responses gracefully

### 3.2 Form utilities

- **`src/lib/briefFormUtils.ts`**
  - `resolveBriefInput(values)` — merge presets + custom fields into `BriefSubmissionInput`
  - `validateBriefForm(values)` — client-side hints before submit
  - Constants: `SECTOR_CUSTOM`, `BUDGET_CUSTOM`
  - `parseCustomServices(comma-separated string)`

### 3.3 Hook

- **`src/hooks/useBriefSubmission.ts`**
  - States: `idle` | `loading` | `success` | `error`
  - `submit(values)` → `resolveBriefInput` → `submitBrief` → update state
  - `refreshKey` increment on success (triggers panel refetch)

### 3.4 Components

| Component                | Responsibility                                                     |
| ------------------------ | ------------------------------------------------------------------ |
| `BriefForm`              | All fields; preset + custom sector/services/budget; `AiModeToggle` |
| `AiModeToggle`           | Radio group: Mock vs Real AI                                       |
| `LoadingState`           | Spinner + `aria-live="polite"`                                     |
| `ErrorBanner`            | Message + field errors, `role="alert"`                             |
| `BriefSummaryResult`     | Headline, key points, approach; fallback badge                     |
| `DiscoveryQuestionsList` | 4–6 questions, accessible list                                     |
| `LastSubmissionsPanel`   | Fetch list, delete all button, modals                              |
| `LastSubmissionCard`     | Row + View / Delete actions                                        |
| `SubmissionDetailModal`  | Full past brief + summary + questions                              |
| `ConfirmDeleteModal`     | Accessible confirm for delete one / all                            |

### 3.5 Page

- **`BriefBuilderPage`**: form + loading/error/success + `LastSubmissionsPanel`
- **`App.tsx`**: single page entry

### 3.6 Styling & a11y

- Tailwind mobile-first; `md:` two-column form
- All inputs: `<label htmlFor>` + focus rings
- Modals: `role="dialog"` / `role="alertdialog"`, click-outside to close (detail only)

### 3.7 Analytics (console stub)

- **`src/lib/analytics.ts`**: `track(event, payload)` → `console.log`
- Events: `brief_submitted`, `brief_validation_failed`, `ai_provider_used`, `ai_provider_fallback`, `discovery_questions_viewed`, `brief_deleted`, `briefs_deleted_all`

### Acceptance criteria

- E2E: fill form → mock submit → loading → summary + questions → appears in panel
- Real AI without key → fallback notice visible
- Custom sector/services/budget submits successfully
- View / delete one / delete all work with confirm modal
- Keyboard navigable; usable on mobile width

---

## Phase 4 — Automated Tests

**Goal**: Cover validation, AI behavior, API contract, and one frontend hook.

### Backend (`vitest` + `supertest`)

| File                              | Cases                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------ |
| `briefValidation.service.test.ts` | Valid payload; missing fields; empty services; invalid aiMode; **custom sector/services/budget** |
| `mockProvider.service.test.ts`    | Deterministic output; 4–6 questions; **custom input completes < 1s**                             |
| `briefGeneration.service.test.ts` | Real mode + no API key → fallback                                                                |
| `briefs.routes.test.ts`           | POST 201/400; GET list; **DELETE one + DELETE all**                                              |

- Test DB: `DB_PATH=test-submissions.db`; `closeDb()` in `afterAll` (Windows lock)

### Frontend

- **`useBriefSubmission.test.ts`**: API validation error → error state + fieldErrors
- Use **partial mock** of `briefsApi` — preserve real `isApiError`

### Acceptance criteria

- `npm test` green: 15 backend, 1 frontend

---

## Phase 5 — Security & Performance (implementation)

**Goal**: Harden the running app in code and config — not documentation tasks.

### Todos

1. `.env` in `.gitignore`; no secrets in `.env.example`
2. CORS: `origin: FRONTEND_ORIGIN` only (not `*`)
3. Rate limiter active on `POST /api/briefs`
4. `express.json({ limit: '20kb' })`
5. No `dangerouslySetInnerHTML` in frontend
6. SQLite: max 5 rows (FIFO); `busy_timeout` pragma
7. Mock generation: sub-100ms; Gemini: 10s server timeout; client fetch: 30s

### Acceptance criteria

- Grep repo for accidental key patterns — clean
- Manual timing: mock POST feels instant; hung server surfaces timeout error in UI

---

## Phase 6 — Custom Form Fields

**Goal**: Allow free-text sector, services, and budget (PDF does not require fixed enums).

### Todos

1. Relax backend Zod: `sector`, `neededServices[]`, `budgetRange` as strings with length bounds
2. **`BriefForm`**: preset dropdown/checkboxes **plus**:
   - "Custom sector…" → text input
   - "Custom services" comma-separated input
   - "Custom amount…" → text input
3. **`briefFormUtils.ts`**: `resolveBriefInput` merges presets + custom into API payload
4. Update `useBriefSubmission` to call `resolveBriefInput` before `submitBrief`
5. Update validation tests for custom values

### Acceptance criteria

- Submit with only custom values (no presets selected) → `201` + valid brief
- Server rejects empty / too-short custom values with `fieldErrors`

---

## Phase 7 — Submissions Management & Critical Fixes

**Goal**: View/delete past briefs; fix mock hang on custom inputs; upgrade Gemini model.

### 7.1 Delete API (if not in Phase 2)

- Wire `DELETE /api/briefs/:id` and `DELETE /api/briefs` end-to-end
- CORS allows `DELETE`

### 7.2 Submissions UI

- `LastSubmissionCard`: View + Delete buttons
- `SubmissionDetailModal`: full brief metadata + summary + discovery questions
- `ConfirmDeleteModal`: replace `window.confirm`; loading state while deleting
- `LastSubmissionsPanel`: orchestrate fetch, delete handlers, `refreshKey` prop

### 7.3 Mock provider fix

- **Bug**: `pickQuestions` while-loop infinite when pool had duplicates but < 5 unique strings → server hung → UI stuck on "Generating your brief…"
- **Fix**: `Set`-based unique pool + deterministic rotation + fallback question padding
- Add regression test with custom sector/services input

### 7.4 Gemini & resilience

- Default model → `gemini-3.1-flash-lite`; optional `GEMINI_MODEL` env
- Client `submitBrief`: 30s abort timeout

### Acceptance criteria

- Custom mock submit completes in < 1s (no hang)
- View modal shows full stored brief
- Delete one / all with confirm modal updates list
- Health endpoint responds while app is under normal load

---

## Execution order

```
Phase 0 → 1 → 2 → 3 → 4 → 5
                ↓
         Phase 6 (custom fields) — can follow Phase 3
                ↓
         Phase 7 (CRUD UI + fixes) — depends on Phase 2 API + Phase 3 panel
```

Do not skip Phase 1 (types) before Phase 2/3. Phase 4 needs Phases 2–3 code. Phase 6–7 are incremental on top of the MVP path.

---

## File map (implemented)

```
backend/src/
  index.ts
  types/brief.ts
  db/sqlite.ts
  models/submission.model.ts
  routes/briefs.routes.ts
  controllers/briefs.controller.ts
  services/
    briefValidation.service.ts
    briefGeneration.service.ts
    briefStorage.service.ts
    ai/
      aiProvider.interface.ts
      mockProvider.service.ts
      geminiProvider.service.ts
  middleware/errorHandler.ts

frontend/src/
  App.tsx
  pages/BriefBuilderPage/BriefBuilderPage.tsx
  components/
    BriefForm/  AiModeToggle/  LoadingState/  ErrorBanner/
    BriefSummaryResult/  DiscoveryQuestionsList/
    LastSubmissionsPanel/  LastSubmissionCard/
    SubmissionDetailModal/  ConfirmDeleteModal/
  api/briefsApi.ts
  hooks/useBriefSubmission.ts
  lib/analytics.ts  briefFormUtils.ts
  types/brief.ts
```
