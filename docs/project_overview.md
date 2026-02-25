# AI Study Strategist - Project Overview

**Project Name:** AI Study Strategist  
**Version:** 1.0.0 (MVP)  
**Type:** Full-Stack Web Application  
**Last Updated:** February 25, 2026

---

## What This Project Does

AI Study Strategist helps students prepare for exams through a feedback loop:
1. add subjects and topics
2. take quizzes to measure topic mastery
3. compute readiness from mastery + coverage + urgency
4. generate AI-backed study plans for upcoming exam dates
5. track progress via dashboard and analytics

---

## Current Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 19 + Vite 5 | SPA with route-based pages |
| Routing | React Router DOM 7 | Protected/private app routes |
| Backend Platform | Supabase | Auth, Postgres, RLS, Edge Functions |
| AI | Groq API via Supabase Edge Functions | Keys are server-side only |
| Charts | Recharts 2 | Analytics and trend visualizations |
| UI | Lucide React + component CSS | Global design tokens in `src/index.css` |
| State | React Context | `AuthContext`, `ThemeContext` |

---

## Architecture Summary

- Client app calls Supabase for auth/data operations (`src/lib/api.js`)
- Client invokes edge functions for AI:
  - `supabase/functions/generate-quiz`
  - `supabase/functions/generate-schedule`
- Edge functions validate auth tokens and call Groq
- Results are validated, then consumed and persisted in Supabase tables

---

## Key Modules

### Auth and User State
- `src/context/AuthContext.jsx`
  - `signUp`, `signIn`, `signOut`, `updateProfile`
  - profile write flow is sequential and reconciles canonical server state on partial failure
- `src/components/ProtectedRoute.jsx`
  - enforces login and onboarding completion

### Data API Layer
- `src/lib/api.js`
  - `subjectsApi`, `topicsApi`, `quizApi`, `schedulesApi`, `aiLogsApi`
  - includes in-memory cache for common reads
  - `quizApi.recordAttempt` supports schema compatibility for `questions_data`

### AI Integration
- `src/lib/quizGenerator.js`
  - invokes `generate-quiz`, falls back to static `questionBank`
- `src/lib/scheduleGenerator.js`
  - invokes `generate-schedule`, falls back to local deterministic schedule
- Edge functions:
  - `supabase/functions/generate-quiz/index.ts`
  - `supabase/functions/generate-schedule/index.ts`
  - both validate request auth and sanitize/validate AI output

### Readiness Engine
- `src/lib/readiness.js`
  - computes readiness using weighted mastery, coverage, penalties, and recency bonus
  - includes urgency classification by exam proximity

---

## Product Surface

### Public Pages
- Landing
- Login
- Register
- Onboarding (with auth-aware redirect behavior)

### Protected Pages
- Dashboard
- Subjects
- Subject Detail
- Quiz
- Study Plan
- Analytics
- Settings

---

## Database Schema (Supabase)

Defined in `supabase/schema.sql`.

Core tables:
- `profiles`
- `subjects`
- `topics`
- `quiz_attempts`
- `schedules`
- `readiness_snapshots` (optional/supporting)
- `ai_logs`

Security:
- RLS enabled
- user-scoped policies across app tables
- trigger functions hardened with explicit `search_path`

---

## Environment Configuration

### Frontend (`.env`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Supabase Edge Function Secrets
- `GROQ_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Note: Groq key is not used on the frontend.

---

## Local Run

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

---

## Current Status

Implemented and working for MVP:
- authentication + onboarding
- subject/topic CRUD
- quiz attempts + mastery updates
- readiness scoring and dashboard widgets
- AI quiz generation
- AI schedule generation + persistence
- analytics charts
- theme support (light/dark)

Recent hardening updates:
- edge function auth validation
- safer error responses (no stack/detail leakage to clients)
- stronger input/output validation for AI responses
- improved dark theme contrast and mastery percentage alignment

---

## Related Docs

See `docs/` for deeper references:
- `docs/prd.md`
- `docs/backend_arch.md`
- `docs/apis.md`
- `docs/design.md`
- `docs/tech_stack.md`
