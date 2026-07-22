# AI Coding Log

Per Beyond X assessment rules: AI use is required and must be disclosed.

## Declaration

I confirm this is my work, I used no confidential material, and this AI-use log is complete.

| Field          | Value            |
| -------------- | ---------------- |
| **Candidate**  | _(Omar Mahmoud)_ |
| **Date**       | _(22/7/2026)_    |
| **Time spent** | _(3 Hours)_      |

---

## Tools used

- **Cursor IDE + Composer** (Claude-based agent) — planning, code generation, debugging, docs, deployment
- **Cursor MCP — Render** (`plugin-render-render`) — create web service, set env vars, monitor deploys/logs
- **Cursor MCP — Vercel** (`plugin-vercel-vercel`) + **Vercel CLI** — production deploy, env vars, build log inspection
- **`skills/UI_Skill.md`** — agent skill for frontend visual design (UI polish pass)
- **Vitest** — tests (run manually)
- **Google Gemini API** (`gemini-3.1-flash-lite`) — optional real AI; key from env only

Only the public assessment PDF, project code, synthetic form data, and `skills/UI_Skill.md` were used in AI tools. API keys were set in local `.env` and platform dashboards only — never committed.

---

## How I worked (SDLC)

1. **Plan first** — Read the PDF, extracted requirements, wrote `PROJECT_SPEC.md` and `IMPLEMENTATION_PLAN.md` before coding. Agreed stack (React/Express/SQLite/Tailwind), mock + Gemini toggle, port 5000.
2. **Build in phases** — Scaffold → backend → frontend → tests → docs, per the implementation plan.
3. **Review & iterate** — Tested manually, asked clarifying questions, requested fixes (custom fields, delete modal, infinite-loop bug). Treated AI as a pair programmer: reviewed diffs, did not ship blindly.
4. **Deploy** — Vercel + Render with MCP-assisted setup; I owned platform credentials and reviewed before push ([Deployment](#deployment-ai-assisted) below).
5. **Document** — Assumptions, trade-offs, and security notes in README; deferred items listed honestly.

**Architecture choices**: frontend pages + components + `useBriefSubmission` hook; backend routes → controllers → services → models; `AiProvider` with deterministic mock and Gemini fallback.

---

## Representative prompts

- _Planning_: "Read the assessment PDF, create PROJECT_SPEC.md"; "React + Express + SQLite, Gemini toggle, Tailwind, port 5000."
- _Build_: "Implement full stack per IMPLEMENTATION_PLAN"; "Add view/delete submissions"; "Allow custom sector, services, budget."
- _UI_: "Apply skills/UI_Skill.md to redesign the frontend."
- _Deploy_: "Deploy backend on Render and frontend on Vercel; configure dev vs production env vars and CORS."
- _Debug_: "Mock stuck on loading with custom values — why?"; "Why do Vercel GitHub deploys fail?"

---

## AI-generated vs my input

| AI generated                                   | I directed / reviewed                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| Scaffold, backend, frontend, tests, docs       | Stack, architecture, port, UX decisions                                   |
| Most implementation code                       | DELETE endpoints, custom fields, confirm modal, Gemini model choice       |
| UI components, tokens, styling pass            | Reviewed layout, colors, accessibility; requested cursor/select fixes     |
| `render.yaml`, root `vercel.json`, CORS config | Chose Vercel + Render; reviewed env var matrix; approved MCP deploy steps |
| —                                              | `.env` / API keys (never committed); Render API key for MCP auth          |

---

## Defects found & fixes

| Issue                                                          | Fix                                                                        |
| -------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Typo in `errorHandler.ts` import                               | Corrected syntax                                                           |
| Mock `pickQuestions` infinite loop (custom inputs hung server) | Safe Set-based selection + regression test                                 |
| Fixed-only form enums                                          | Free-text sector/services/budget + `briefFormUtils.ts`                     |
| `vi.mock` broke `isApiError` in hook test                      | Partial mock                                                               |
| SQLite lock on Windows tests                                   | `closeDb()` before cleanup                                                 |
| Gemini JSON in markdown fences                                 | `extractJson()` helper                                                     |
| `window.confirm` for delete                                    | `ConfirmDeleteModal`                                                       |
| No fetch timeout                                               | 30s `AbortController` on submit                                            |
| Plain native selects / missing pointer cursor on buttons       | `SelectField`, shared button tokens, themed scrollbars                     |
| Render build failed (`tsc` — missing `@types/*`)               | Moved TypeScript + `@types` to `dependencies` for production `npm install` |
| Vercel GitHub deploy failed (`vite: command not found`)        | Root `vercel.json` — build `frontend/` from monorepo root                  |
| CORS blocked production frontend                               | `FRONTEND_ORIGIN` + `backend/src/config/cors.ts` (comma-separated origins) |
| Validation errors invisible below submit button                | Error summary under Generate Brief button in `BriefForm`                   |
| Loading spinner instead of skeleton placeholders               | Bezel-card skeleton grid matching result layout in `LoadingState`          |

---

## Deployment (AI-assisted)

Deployment was part of the same Cursor session as the build. I used **Render MCP** and **Vercel MCP/CLI** with Composer; GitHub `main` auto-deploys both apps after push.

**What AI did**

- Generated deploy config: `render.yaml`, root `vercel.json`, `frontend/vercel.json`, `backend/src/config/cors.ts`
- Created the Render service via MCP (`list_workspaces` → `select_workspace` → `create_web_service`)
- Read Vercel build logs via MCP when GitHub deploys failed (`vite: command not found` from monorepo root)
- Proposed env var wiring (`FRONTEND_ORIGIN` ↔ Vercel URL, `VITE_API_BASE_URL` ↔ Render URL)

**What I did**

- Added Render API key to Cursor MCP settings (not in repo)
- Linked GitHub to Vercel/Render and approved deploy steps
- Set `GEMINI_API_KEY` in Render dashboard only
- Reviewed diffs before push; retried after Render `tsc` / Vercel monorepo build failures (see defects table)

Live URLs: [`README.md`](../README.md#live-demo). File checklist: [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) Phase 9. Post-deploy checks: [`TEST_RESULTS.md`](TEST_RESULTS.md#manual-verification-live).

---

## Manual review (key checks)

- No secrets in repo; server-side Zod validation is source of truth
- Mock is deterministic; Gemini falls back to mock with user notice
- 4–6 discovery questions; last 5 submissions FIFO
- Tests pass: 15 backend, 1 frontend — see [`README.md`](../README.md#test-results) and [`TEST_RESULTS.md`](TEST_RESULTS.md)
- Production live — health, CORS, and mock submit verified (see [`TEST_RESULTS.md`](TEST_RESULTS.md#manual-verification-live))
- UI screenshots + demo video in [`demo/`](../demo/) (previewed in [`README.md`](../README.md#screenshots--demo-video))

---

## Deferred (out of MVP scope)

Analytics vendor, auth, persistent DB on Render (Postgres), shared types package — see README.

---

## Summary

AI handled most boilerplate, implementation speed, and deployment steps via MCP. I owned requirements, architecture, env/platform credentials, testing, bug fixes, and assessment compliance. Every significant defect above was found during review or manual testing and fixed before calling the feature done.
