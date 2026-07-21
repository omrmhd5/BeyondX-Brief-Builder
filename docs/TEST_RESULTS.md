# Test Results

Captured output and per-test coverage from `npm test` in each package. Re-run before submission to refresh.

**How to reproduce:**

```bash
cd backend && npm test
cd frontend && npm test
```

---

## What we test

### Backend — `briefValidation.service.test.ts` (5 tests)

Server-side Zod validation (`validateBriefInput`) — the API’s source of truth for form data.

| Test                                        | What it verifies                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------------- |
| accepts a valid payload                     | Full valid brief passes; `companyName` is returned in parsed data               |
| rejects missing companyName                 | Omitting required field → `success: false` + `fieldErrors.companyName`          |
| rejects empty neededServices                | At least one service required                                                   |
| rejects invalid aiMode                      | Only `"mock"` / `"real"` allowed                                                |
| accepts custom sector, services, and budget | Free-text sector, custom service list, and custom budget string pass validation |

### Backend — `mockProvider.service.test.ts` (3 tests)

Deterministic mock AI provider — must work without any API key.

| Test                                                     | What it verifies                                                                          |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| returns deterministic output for identical input         | Same input → identical summary + questions (reproducible for reviewers)                   |
| returns 4 to 6 discovery questions                       | Assessment requirement; headline includes company name                                    |
| completes with fully custom sector, services, and budget | Regression for infinite-loop bug — custom inputs finish in < 1 s and return ≥ 4 questions |

### Backend — `briefGeneration.service.test.ts` (1 test)

AI provider orchestration and safe fallback.

| Test                                                      | What it verifies                                                                                                                                                 |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| falls back to mock when real mode selected but no API key | `aiMode: "real"` with no `GEMINI_API_KEY` → `fallbackApplied: true`, `fallbackReason: "no_api_key"`, `aiModeUsed: "mock"`, still returns ≥ 4 discovery questions |

### Backend — `briefs.routes.test.ts` (6 tests)

HTTP integration via Supertest — isolated test DB (`data/test-submissions.db`).

| Test                                                   | What it verifies                                                                              |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| POST returns 201 with expected shape for valid payload | `{ success, data }` envelope; `summary.headline` present; ≥ 4 questions; `aiModeUsed: "mock"` |
| POST returns 400 with fieldErrors for invalid payload  | Malformed body → `{ success: false, error.fieldErrors }`                                      |
| GET returns recent submissions                         | `200` + `{ success: true, data: [] }` array shape                                             |
| DELETE deletes a submission by id                      | Create → list → delete by id → `{ deleted: true }`                                            |
| DELETE returns 404 for unknown id                      | Non-existent id handled cleanly                                                               |
| DELETE all deletes all submissions                     | `DELETE /api/briefs` clears store; list is empty afterward                                    |

### Frontend — `useBriefSubmission.test.ts` (1 test)

React hook state machine for form submit (mocked API layer).

| Test                                               | What it verifies                                                                                                                    |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| sets error state when API returns validation error | `submitBrief` returns `success: false` with `fieldErrors` → hook `status: "error"` and `fieldErrors.companyName` surfaced to the UI |

---

## Backend output (`cd backend && npm test`)

```
 RUN  v3.2.7

 ✓ src/services/ai/mockProvider.service.test.ts (3 tests)
 ✓ src/services/briefGeneration.service.test.ts (1 test)
 ✓ src/services/briefValidation.service.test.ts (5 tests)
 ✓ src/routes/briefs.routes.test.ts (6 tests)

 Test Files  4 passed (4)
      Tests  15 passed (15)
   Duration  ~6s
```

---

## Frontend output (`cd frontend && npm test`)

```
 RUN  v3.2.7

 ✓ src/hooks/useBriefSubmission.test.ts (1 test)

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Duration  ~15s
```

---

## Summary

| Package   | Test files | Tests  | Focus                                               |
| --------- | ---------- | ------ | --------------------------------------------------- |
| backend   | 4          | 15     | Validation, mock AI, Gemini fallback, REST API CRUD |
| frontend  | 1          | 1      | Submit hook error handling                          |
| **Total** | **5**      | **16** |                                                     |

**Last verified:** 2026-07-22
