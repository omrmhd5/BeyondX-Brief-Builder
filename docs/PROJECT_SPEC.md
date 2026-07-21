# Beyond X Brief Builder — Project Spec

### Documentation split

| Document                          | Purpose                                                                           | Audience                |
| --------------------------------- | --------------------------------------------------------------------------------- | ----------------------- |
| **`PROJECT_SPEC.md`** (this file) | What & why — requirements from the PDF, architecture, assumptions, feature status | Reviewers               |
| **`IMPLEMENTATION_PLAN.md`**      | How — phased build steps (Phases 0–7), file map, test file list                   | Build reference         |
| **`AI_LOG.md`**                   | AI disclosure — tools, prompts, defects, SDLC (assessment requirement)            | Reviewers               |
| **`README.md`** (root)            | Runbook — setup, env, architecture summary, **test instructions + summary**       | Anyone cloning the repo |
| **`TEST_RESULTS.md`**             | What each test covers + full captured `npm test` output                           | Submission evidence     |

Test **instructions** and a **summary** belong in **README** (assessment requirement). Per-test details and **full terminal output** are in **`TEST_RESULTS.md`**.

Source: Beyond X hiring assessment (Mid–Senior Full-Stack AI Developer / Web Developer). Requirements are captured in this document; the confidential assessment PDF is **not** included in the public repository.

**Status**: MVP complete. Post-MVP enhancements (view/delete submissions, custom form fields, confirm modals) implemented. See [§7 Built features](#7-built-features-as-implemented).

---

## 1. Project Description

### Case brief

Build **"Beyond X Brief Builder"**: a client enters company name, sector, objective, audience, needed services, budget range, and desired deadline. The system:

- Validates the submission (server-side).
- Returns a structured brief summary plus **4–6 discovery questions**.
- Must run **without a paid API key** via a deterministic mock provider.
- May optionally add a **real LLM provider** via environment configuration.
- Must **never commit secrets**.

### Required deliverables (checklist from PDF)

| #   | Requirement                                                                                  | Status                                                                                |
| --- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | Responsive UI: labels, errors, loading/success, mobile                                       | Done                                                                                  |
| 2   | Server/API + server-side validation + normalized schema                                      | Done                                                                                  |
| 3   | AI abstraction: mock + optional LLM with safe fallback                                       | Done                                                                                  |
| 4   | Last 5 submissions persisted/displayed + production model explained                          | Done                                                                                  |
| 5   | At least one automated test (+ instructions/results in README)                               | Done — [`README.md`](../README.md#test-results), [`TEST_RESULTS.md`](TEST_RESULTS.md) |
| 6   | README (setup, architecture, trade-offs, assumptions, security, perf, analytics, next steps) | Done — [`README.md`](../README.md)                                                    |
| 7   | AI coding log                                                                                | Done — [`AI_LOG.md`](AI_LOG.md)                                                       |

### Assessment rules to respect

- Standalone — no external candidate collaboration.
- State assumptions explicitly.
- AI use disclosed in `docs/AI_LOG.md`.
- Submission = repo/ZIP + README + tests + demo/screenshots + AI log. No hardcoded keys. Assessment PDF kept out of public repo (requirements in `PROJECT_SPEC.md`).

---

## 2. Functional Requirements / Features / Use Cases

### Use case: Submit a brief

1. User opens the form: company name, sector, objective, audience, needed services, budget range, deadline.
2. **Sector**: preset dropdown **or** "Custom sector…" with free-text input.
3. **Needed services**: preset checkboxes **and/or** custom comma-separated services.
4. **Budget**: preset brackets **or** "Custom amount…" with free-text input.
5. User picks **Mock** (default) or **Real AI (Gemini)** per submission.
6. Submit → loading → server validates → AI generates brief summary + **4–6 discovery questions**.
7. Success UI shows summary + discovery questions; submission saved (max 5 stored).

### Use case: View past submissions

- **Past Submissions** panel lists last 5 (newest first).
- **View** opens `SubmissionDetailModal` with full brief, metadata, summary, and discovery questions.

### Use case: Delete submissions

- **Delete** on one card → `ConfirmDeleteModal` → `DELETE /api/briefs/:id`.
- **Delete all** → confirm modal → `DELETE /api/briefs`.

### Use case: AI mode fallback

- Real AI selected but no key / API error / timeout → mock result + visible `fallbackApplied` notice.

### Cross-cutting requirements

- Accessibility: labels, `aria-live`, keyboard nav, focus rings.
- Responsive: mobile-first Tailwind layout.
- Analytics (console): `brief_submitted`, `brief_validation_failed`, `ai_provider_used`, `ai_provider_fallback`, `discovery_questions_viewed`, `brief_deleted`, `briefs_deleted_all`.
- API shape: `{ success, data }` or `{ success: false, error: { message, fieldErrors? } }`.

---

## 3. Technical Stack & Key Decisions

- **Stack**: React (Vite) + TypeScript + Tailwind CSS | Node.js/Express + TypeScript | monorepo `/frontend` + `/backend`.
- **Backend port**: `5000` (configurable via `PORT`).
- **Persistence**: SQLite (`better-sqlite3`), last 5 rows FIFO. Render ephemeral-disk caveat accepted for MVP.
- **AI**:
  - `MockProvider` — deterministic, no network.
  - `GeminiProvider` — `GEMINI_API_KEY` from env; model `gemini-3.1-flash-lite` (override via `GEMINI_MODEL`).
  - Per-request UI toggle; safe fallback to mock.
- **Testing**: Vitest (backend + frontend).
- **Env templates**: `backend/.env.example`, `frontend/.env.example` (committed; copy to `.env` locally).
- **Docs**: `docs/PROJECT_SPEC.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/AI_LOG.md`, `docs/TEST_RESULTS.md`, root `README.md`.

### 3.1 Frontend Architecture

```
frontend/src/
  pages/BriefBuilderPage/
  components/
    BriefForm/              # presets + custom sector/services/budget
    AiModeToggle/
    LoadingState/
    ErrorBanner/
    BriefSummaryResult/
    DiscoveryQuestionsList/
    LastSubmissionsPanel/
      LastSubmissionCard/
    SubmissionDetailModal/    # view full past brief
    ConfirmDeleteModal/     # delete one / delete all
  api/briefsApi.ts          # POST, GET, DELETE
  hooks/useBriefSubmission.ts
  lib/
    analytics.ts
    briefFormUtils.ts       # resolveBriefInput, validateBriefForm
  types/brief.ts
```

### 3.2 Backend Architecture

```
backend/src/
  routes/briefs.routes.ts     # GET, POST, DELETE /, DELETE /:id
  controllers/briefs.controller.ts
  services/
    briefValidation.service.ts   # Zod — strings for sector/services/budget
    briefGeneration.service.ts
    briefStorage.service.ts
    ai/
      mockProvider.service.ts
      geminiProvider.service.ts
  models/submission.model.ts
  db/sqlite.ts
  middleware/errorHandler.ts
```

### 3.3 API endpoints

| Method | Path              | Description               |
| ------ | ----------------- | ------------------------- |
| GET    | `/health`         | Health check              |
| POST   | `/api/briefs`     | Submit brief → AI summary |
| GET    | `/api/briefs`     | List last 5 submissions   |
| DELETE | `/api/briefs/:id` | Delete one submission     |
| DELETE | `/api/briefs`     | Delete all submissions    |

---

## 4. Assumptions (updated after implementation)

- **Preset lists** (sectors, services, budget brackets) are UX shortcuts; the PDF does **not** require enums — backend accepts **free-text** for sector, services, and budget with length validation.
- Deadline = HTML date picker; server rejects past dates.
- Last 5 submissions = server-side SQLite, globally scoped (no auth in MVP).
- Analytics = console logging only (production would use a real vendor).
- Gemini model = `gemini-3.1-flash-lite` unless `GEMINI_MODEL` is set.
- Types mirrored manually between frontend and backend (no shared package).

---

## 5. Implementation Plan Reference

Phased build steps and completion notes: [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md).

---

## 6. Deferred / production next steps

- Real analytics vendor.
- Auth / multi-tenant scoping.
- Persistent DB (Postgres/Mongo Atlas) for Render.
- Advanced rate limiting.
- Shared types or OpenAPI codegen.
- Submission screenshots in `docs/screenshots/` (candidate to add before final submit).

---

## 7. Built features (as implemented)

Beyond the PDF minimum:

- View past submission in detail modal.
- Delete one / delete all with accessible confirm modal.
- Custom sector, services, and budget fields.
- Fetch timeout (30s) so UI does not spin forever on dead server.
- SQLite `busy_timeout` to reduce lock hangs.
- Mock `pickQuestions` safe algorithm (fixes infinite loop with custom inputs).
