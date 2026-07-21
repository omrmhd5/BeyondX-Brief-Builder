# AI Coding Log

Per Beyond X assessment rules: AI use is required and must be disclosed.

## Tools Used

- **Cursor IDE** with Composer (AI coding agent)
- Model: Claude-based agent in Cursor

## Representative Prompts

1. **Planning**: "Read the assessment PDF, extract requirements, create plan.md and IMPLEMENTATION_PLAN.md with architecture decisions (React/Express/SQLite/Gemini toggle)."
2. **Implementation**: "Implement the full stack per IMPLEMENTATION_PLAN.md — backend port 5000, frontend with Tailwind, all phases through tests and README."
3. **Architecture guidance**: "Use pages + components on frontend; routes/controllers/services/models on backend with services owning business logic."

## What Was AI-Generated

- Entire project scaffold (monorepo structure, package.json files, tsconfig)
- Backend: types, SQLite setup, validation (Zod), mock/Gemini providers, generation orchestration, storage, controllers, routes, middleware, tests
- Frontend: types, API client, all components, hooks, page layout, Tailwind styling, tests
- README.md and this AI_LOG.md

## Manual Review & Human Changes

- Confirmed tech stack decisions with user: React + Express, SQLite (ephemeral on Render accepted), Gemini with per-request mock/real toggle, Tailwind CSS, backend port 5000
- Reviewed layered architecture matches plan.md conventions (controllers thin, services own logic)
- Verified no hardcoded API keys; `.env.example` files only

## Defects Found & Fixes

| Issue                                                                 | Fix                                                      |
| --------------------------------------------------------------------- | -------------------------------------------------------- |
| Typo in `errorHandler.ts` import (`Response+` instead of `Response,`) | Corrected import syntax                                  |
| IMPLEMENTATION_PLAN referenced port 4000                              | Updated to port 5000 per user request                    |
| Gemini provider needed JSON parsing guard                             | Added `extractJson` helper for fenced code blocks        |
| Route tests need isolated test DB                                     | Set `DB_PATH` env to `test-submissions.db` in test setup |

## Summary

All generated code was reviewed for: no committed secrets, server-side validation as source of truth, deterministic mock provider, safe Gemini fallback, normalized API responses, accessibility basics (labels, aria-live, focus rings), and test coverage meeting assessment minimum.

I confirm this is my work, I used no confidential material, and this AI-use log is complete.

**Candidate**: _(fill in before submission)_  
**Date**: _(fill in)_  
**Time spent**: _(fill in)_
