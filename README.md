# AI Study Strategist

AI Study Strategist is a full-stack web app that helps students prepare for exams with:
- topic-level mastery tracking
- AI-generated quizzes
- adaptive study plans
- readiness analytics

## Features
- Authentication and profile onboarding (Supabase Auth + `profiles`)
- Subject and topic management (CRUD)
- Quiz attempts with mastery updates
- AI quiz generation via Supabase Edge Function (`generate-quiz`)
- AI study schedule generation via Supabase Edge Function (`generate-schedule`)
- Dashboard and analytics (Recharts)
- Light/Dark theme support

## Tech Stack
- Frontend: React 19, Vite 5, React Router 7
- Backend: Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- AI Provider: Groq (Llama model) through server-side edge functions
- Charts/UI: Recharts, Lucide React, component-scoped CSS

## Project Structure
```text
.
├─ src/
│  ├─ components/
│  ├─ context/
│  ├─ lib/
│  ├─ pages/
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ supabase/
│  ├─ schema.sql
│  └─ functions/
│     ├─ generate-quiz/index.ts
│     └─ generate-schedule/index.ts
├─ docs/
│  ├─ apis.md
│  ├─ backend_arch.md
│  ├─ design.md
│  ├─ prd.md
│  ├─ project_overview.md
│  └─ tech_stack.md
├─ public/
├─ package.json
└─ vite.config.js
```

## Environment Variables
Create `.env` in project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For Supabase Edge Functions, set in Supabase secrets:
- `GROQ_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Local Setup
```bash
npm install
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

## Database Setup (Supabase)
1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in SQL Editor.
3. Confirm RLS policies are enabled and applied.

## Deploy Edge Functions
From your Supabase workflow:
```bash
supabase functions deploy generate-quiz
supabase functions deploy generate-schedule
```

## Core Data Model
- `profiles`: user academic + onboarding metadata
- `subjects`: subject info and exam date
- `topics`: mastery and attempt metadata per topic
- `quiz_attempts`: quiz history per user/topic
- `schedules`: latest generated plan JSON per subject
- `ai_logs`: AI output logging

## Notes
- AI keys are never exposed to the frontend.
- The frontend calls Supabase Edge Functions; those call Groq server-side.
- Extra design/architecture docs are available under [`docs/`](docs).
