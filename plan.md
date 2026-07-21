# Beyond X Brief Builder — Master Plan

Source: `Candidate_Assessment Full-Stack AI Developer - Web Developer.pdf` (BEYOND X hiring assessment, 4-hour timebox, Mid-Senior Full-Stack AI Developer / Web Developer).

## 1. Project Description

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

## 2. Functional Requirements / Features / Use Cases

### Use case: Submit a brief

1. User opens the app and sees a form with fields: company name, sector, objective, audience, needed services (multi-select), budget range, desired deadline.
2. User fills the form. Client-side hints validate as they type (required fields, formats).
3. User picks an AI mode: **Mock** (default, deterministic) or **Real AI (Gemini)** via a toggle/switch.
4. User submits. Form shows a **loading** state (disabled inputs, spinner/skeleton).
5. Backend validates the payload server-side regardless of client validation.
   - If invalid → normalized error response → UI shows **clear, field-level error messages** (accessible, `aria-live`).
   - If valid → AI provider (mock or real, per toggle, with safe fallback to mock if real fails or no key) generates:
     - A structured **brief summary**.
     - **4–6 discovery questions**.
6. UI shows a **success** state with the structured brief summary and discovery questions.
7. Submission is persisted server-side; the **last 5 submissions** list (visible in the UI) updates, oldest evicted beyond 5.

### Use case: View last 5 submissions

- On load and after each successful submission, the UI fetches/displays the last 5 stored submissions (summary + timestamp + which AI mode was used).

### Use case: AI mode fallback

- If "Real AI" is selected but no `GEMINI_API_KEY` is configured, or the Gemini call fails/times out, the backend transparently falls back to the mock provider and **tells the user** (e.g. a small notice: "Real AI unavailable, showing mock result") rather than failing silently or erroring out.

### Cross-cutting feature requirements

- **Accessibility**: labeled inputs (`label`/`aria-*`), keyboard navigable, error/loading regions announced via `aria-live`, sufficient color contrast.
- **Responsive/mobile**: usable form and results on small screens (single-column layout, tappable controls).
- **Analytics events** (logged, no real vendor): e.g. `brief_submitted`, `brief_validation_failed`, `ai_provider_used` (mock/real), `ai_provider_fallback`, `discovery_questions_viewed`.
- **Normalized API response schema**: consistent `{ success, data, error }` shape for both success and error cases.

## 3. Technical Stack & Key Decisions

- **Stack**: React (Vite) frontend + Node.js/Express backend, TypeScript, **Tailwind CSS** for styling. Monorepo with `/frontend` and `/backend` at repo root.
- **Persistence**: SQLite file via backend (`better-sqlite3`), storing only the last 5 submissions (auto-pruned, FIFO). Accepted trade-off: Render's free web services have an **ephemeral filesystem** — the SQLite file resets on redeploy/restart. README will explain the production data model (e.g. Postgres/Mongo Atlas with proper schema, indices, retention) as the real-world upgrade path.
- **AI provider**: Provider abstraction (`AiProvider` interface) with two implementations:
  - `MockProvider` — deterministic, rule-based, no network calls, always available.
  - `GeminiProvider` — real call to Google Gemini, reads `GEMINI_API_KEY` from env, never hardcoded.
  - A **per-request UI toggle** (switch/button on the form) lets the user pick "Mock" or "Real AI" per submission. Backend honors the choice **only if** a key is configured and the call succeeds; otherwise it safely falls back to mock and communicates that in the response (no silent failures).
- **Testing**: Vitest for both frontend and backend.
- **Repo layout**: monorepo, `/frontend`, `/backend`, root-level `README.md`, `AI_LOG.md`, `plan.md`, `IMPLEMENTATION_PLAN.md`.

### 3.1 Frontend Architecture — React, component-based, pages + components

**Styling**: Tailwind CSS (via Vite plugin). Utility classes applied directly in JSX; no separate CSS modules per component unless a one-off exception is needed. Responsive breakpoints (`sm:`, `md:`) and accessible focus/ring utilities used for mobile and a11y.

```
frontend/src/
  pages/
    BriefBuilderPage/        # the single main page (form + results + last-5 panel)
      BriefBuilderPage.tsx
  components/
    BriefForm/                # form: fields, client validation hints, AI mode toggle
    AiModeToggle/              # reusable mock/real switch
    LoadingState/              # reusable spinner/skeleton
    ErrorBanner/                # reusable inline error / field error display
    BriefSummaryResult/         # renders structured brief summary
    DiscoveryQuestionsList/     # renders 4-6 discovery questions
    LastSubmissionsPanel/       # list of last 5 submissions
      LastSubmissionCard/       # one submission row/card (reusable)
  api/
    briefsApi.ts               # fetch wrappers for POST/GET /api/briefs
  types/
    brief.ts                   # shared frontend types (mirrors backend contract)
  hooks/
    useBriefSubmission.ts       # encapsulates submit flow state machine (idle/loading/success/error)
```

- **Pages** compose **components**; pages own page-level state/data-fetching, components are presentational/reusable where possible (e.g. `LoadingState`, `ErrorBanner`, `LastSubmissionCard` are generic enough to reuse).
- **Tailwind**: shared design tokens (colors, spacing, typography) configured in `tailwind.config.js`; keep class lists readable by extracting repeated patterns into small wrapper components rather than custom CSS files.
- One primary page for the MVP (`BriefBuilderPage`); structure still leaves room to add pages later (e.g. a details page) without restructuring.

### 3.2 Backend Architecture — Node/Express, layered (routes → controllers → services → models)

```
backend/src/
  routes/
    briefs.routes.ts           # defines /api/briefs endpoints, wires to controllers
  controllers/
    briefs.controller.ts       # thin: parse req, call service, shape res — no business logic
  services/
    briefValidation.service.ts # server-side validation rules (e.g. Zod schema + checks)
    briefGeneration.service.ts # orchestrates AI provider selection + fallback logic
    briefStorage.service.ts    # business logic for persisting + retrieving last 5
    ai/
      aiProvider.interface.ts  # AiProvider contract: generateBrief(input) -> BriefResult
      mockProvider.service.ts  # deterministic mock implementation
      geminiProvider.service.ts# real Gemini implementation, reads env key
  models/
    submission.model.ts        # SQLite table access (schema, insert, getLastN, prune)
  db/
    sqlite.ts                  # DB connection/init
  middleware/
    errorHandler.ts            # normalizes error responses
    validateRequest.ts         # generic validation middleware helper
```

- **Routes**: only route → controller wiring.
- **Controllers**: orchestration only — receive request, call the right service(s), map result to the normalized response shape, no business rules inside.
- **Services**: own all business logic — validation rules, AI-provider selection/fallback, persistence rules (cap at 5, eviction order). `briefGeneration.service` decides mock vs. real and handles failure-safe fallback.
- **Models**: data access only (SQLite queries), no business logic.

## 4. Assumptions & Things to Highlight (for README)

To state explicitly in the README per assessment rules ("state assumptions clearly"):

- "Needed services" is a multi-select list (e.g. Web Design, Branding, SEO, Content, Ads, App Dev) — exact options assumed since not specified in the PDF.
- Budget range is a predefined bracket dropdown; deadline is a date picker — assumed formats since not specified.
- "Last five local submissions" is interpreted as: stored server-side (SQLite), scoped globally to the running instance (no auth/user/account concept in this MVP) — a simplification vs. production, which would scope per-account.
- Analytics events are logged to console/server log only (no real analytics vendor wired) — a stand-in for a production analytics pipeline, explained as such.
- Things to highlight to the reviewer in the README explicitly:
  - Why SQLite was chosen over Mongo/Postgres for this MVP, and the explicit Render ephemeral-disk caveat (data resets on redeploy/restart) plus the production upgrade path.
  - The Mock/Real AI toggle exists specifically so a reviewer without a Gemini key can still fully exercise the app deterministically.
  - Safe-fallback behavior: real AI failures never break the flow, they degrade to mock with a visible notice.
  - Layered backend architecture rationale (routes/controllers/services/models) and component-based frontend rationale (pages vs. reusable components) as evidence of production-minded structure, not just "make it work" code.
  - AI usage disclosure lives in `AI_LOG.md`, not buried — call this out in the README.

## 5. Implementation Plan Reference

Detailed, ordered build steps (mapped to the PDF's recommended time plan: scaffold → implement → test/security/perf review → docs/final run) will be written in a separate **`IMPLEMENTATION_PLAN.md`**, not duplicated here.

## 6. Open Items / Deferred (to be listed under "unfinished" if time runs out, and called out in README)

- Real analytics vendor integration.
- Auth / multi-tenant submission scoping.
- Persistent DB across Render redeploys (would require Postgres/Mongo Atlas in production).
- Advanced rate limiting / abuse protection beyond basic MVP checks.

These should also be explicitly surfaced in the README's "production next steps" section, per the deliverables checklist.
