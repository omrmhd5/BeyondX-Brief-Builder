# AI Coding Log

Per Beyond X assessment rules: AI use is required and must be disclosed.

## Declaration

I confirm this is my work, I used no confidential material, and this AI-use log is complete.

| Field          | Value       |
| -------------- | ----------- |
| **Candidate**  | _(fill in)_ |
| **Date**       | _(fill in)_ |
| **Time spent** | _(fill in)_ |

---

## Tools used

- **Cursor IDE + Composer** (Claude-based agent) — planning, code generation, debugging, docs
- **Vitest** — tests (run manually)
- **Google Gemini API** (`gemini-3.1-flash-lite`) — optional real AI; key from env only

Only the public assessment PDF, project code, and synthetic form data were used in AI tools.

---

## How I worked (SDLC)

1. **Plan first** — Read the PDF, extracted requirements, wrote `PROJECT_SPEC.md` and `IMPLEMENTATION_PLAN.md` before coding. Agreed stack (React/Express/SQLite/Tailwind), mock + Gemini toggle, port 5000.
2. **Build in phases** — Scaffold → backend → frontend → tests → docs, per the implementation plan.
3. **Review & iterate** — Tested manually, asked clarifying questions, requested fixes (custom fields, delete modal, infinite-loop bug). Treated AI as a pair programmer: reviewed diffs, did not ship blindly.
4. **Document** — Assumptions, trade-offs, and security notes in README; deferred items listed honestly.

**Architecture choices**: frontend pages + components + `useBriefSubmission` hook; backend routes → controllers → services → models; `AiProvider` with deterministic mock and Gemini fallback.

---

## Representative prompts

- _Planning_: "Read the assessment PDF, create PROJECT_SPEC.md"; "React + Express + SQLite, Gemini toggle, Tailwind, port 5000."
- _Build_: "Implement full stack per IMPLEMENTATION_PLAN"; "Add view/delete submissions"; "Allow custom sector, services, budget."
- _Debug_: "Mock stuck on loading with custom values — why?"

---

## AI-generated vs my input

| AI generated                             | I directed / reviewed                                               |
| ---------------------------------------- | ------------------------------------------------------------------- |
| Scaffold, backend, frontend, tests, docs | Stack, architecture, port, UX decisions                             |
| Most implementation code                 | DELETE endpoints, custom fields, confirm modal, Gemini model choice |
| —                                        | `.env` / API keys (never committed)                                 |

---

## Defects found & fixes

| Issue                                                          | Fix                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------ |
| Typo in `errorHandler.ts` import                               | Corrected syntax                                       |
| Mock `pickQuestions` infinite loop (custom inputs hung server) | Safe Set-based selection + regression test             |
| Fixed-only form enums                                          | Free-text sector/services/budget + `briefFormUtils.ts` |
| `vi.mock` broke `isApiError` in hook test                      | Partial mock                                           |
| SQLite lock on Windows tests                                   | `closeDb()` before cleanup                             |
| Gemini JSON in markdown fences                                 | `extractJson()` helper                                 |
| `window.confirm` for delete                                    | `ConfirmDeleteModal`                                   |
| No fetch timeout                                               | 30s `AbortController` on submit                        |

---

## Manual review (key checks)

- No secrets in repo; server-side Zod validation is source of truth
- Mock is deterministic; Gemini falls back to mock with user notice
- 4–6 discovery questions; last 5 submissions FIFO
- Tests pass: 15 backend, 1 frontend — see [`README.md`](../README.md#test-results) and [`TEST_RESULTS.md`](TEST_RESULTS.md)

---

## Deferred (out of MVP scope)

Analytics vendor, auth, persistent DB on Render, screenshots, shared types package — see README.

---

## Summary

AI handled most boilerplate and implementation speed. I owned requirements, architecture decisions, testing, bug fixes, and assessment compliance. Every significant defect above was found during review or manual testing and fixed before calling the feature done.
