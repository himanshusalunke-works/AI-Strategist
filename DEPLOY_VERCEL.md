# Deploy on Vercel

This project is configured for:
- Frontend: `Vite + React` on Vercel
- Backend: `Supabase` (database + auth + edge functions)

## 1. Push repo to GitHub

Make sure your latest code is committed and pushed.

## 2. Import project in Vercel

1. Open Vercel dashboard.
2. Click `Add New Project`.
3. Import this GitHub repository.

Vercel should auto-detect Vite and use:
- Build Command: `npm run build`
- Output Directory: `dist`

## 3. Configure environment variables in Vercel

Add these in Project Settings -> Environment Variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Use the values from your Supabase project.

## 4. Deploy

Click `Deploy`.

## 5. Important backend note

Your AI endpoints (`generate-quiz`, `generate-schedule`) are Supabase Edge Functions.
Deploy/update them from your Supabase workflow as well:

```bash
supabase functions deploy generate-quiz
supabase functions deploy generate-schedule
```

If these are not deployed in Supabase, frontend calls from Vercel will fail.

## 6. SPA routing

This repo includes `vercel.json` route fallback to `index.html`, so client-side routes like:
- `/dashboard`
- `/subjects/123`
- `/quiz`

work on hard refresh in production.
