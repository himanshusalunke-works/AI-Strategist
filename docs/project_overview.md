# 📚 AI Study Strategist — Project Overview

> **Project Name:** AI Study Strategist  
> **Version:** 1.0.0 (MVP)  
> **Type:** Full-Stack Web Application  
> **Last Updated:** February 2026

---

## 🎯 What Is This Project?

AI Study Strategist is a full-stack web application that helps students plan, track, and optimize their study sessions using AI. It generates personalized study schedules, tests topic mastery through quizzes, tracks performance over time, and provides analytics — all powered by Groq AI and backed by Supabase.

---

## 🛠️ Tech Stack

| Layer                  | Technology                  | Purpose                                      |
| ---------------------- | --------------------------- | -------------------------------------------- |
| **Frontend Framework** | React 19                    | UI component library                         |
| **Build Tool**         | Vite 6                      | Fast development server & bundler            |
| **Routing**            | React Router DOM v7         | Client-side navigation & protected routes    |
| **Backend / Database** | Supabase (PostgreSQL)       | Auth, database, RLS policies                 |
| **AI Integration**     | Groq SDK (LLaMA model)      | AI-powered study schedule generation         |
| **Charts / Analytics** | Recharts 2                  | Data visualization for performance analytics |
| **Icons**              | Lucide React                | Icon library used throughout the UI          |
| **Styling**            | Vanilla CSS (per-component) | Custom stylesheets per page/component        |
| **State Management**   | React Context API           | Auth state & theme state                     |

### DevDependencies

| Package                            | Purpose                     |
| ---------------------------------- | --------------------------- |
| `@vitejs/plugin-react`             | JSX transform & HMR support |
| `@types/react`, `@types/react-dom` | TypeScript type stubs       |

---

## 🗂️ Project Structure

```
AI Strategist/
├── src/
│   ├── App.jsx                  # Root router setup & auth-guarded routes
│   ├── main.jsx                 # React entry point
│   ├── index.css                # Global CSS variables & base styles
│   │
│   ├── context/
│   │   ├── AuthContext.jsx      # Auth state, signUp/signIn/signOut/updateProfile
│   │   └── ThemeContext.jsx     # Dark/light theme toggle
│   │
│   ├── lib/
│   │   ├── supabase.js          # Supabase client initialization
│   │   ├── api.js               # Centralized CRUD API layer (Supabase calls)
│   │   ├── scheduleGenerator.js # AI schedule generation logic (Groq)
│   │   ├── quizGenerator.js     # Dynamic quiz question generation
│   │   ├── questionBank.js      # Static question bank per topic
│   │   ├── readiness.js         # Exam readiness score calculator
│   │   └── mockData.js          # Legacy mock data (dev reference)
│   │
│   ├── components/
│   │   ├── ProtectedRoute.jsx   # Route guard — redirects unauthenticated users
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx    # Main app shell with sidebar + topbar
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   └── TopBar.jsx       # Top navigation bar with user info
│   │   └── dashboard/
│   │       ├── ReadinessCard.jsx     # Exam readiness score widget
│   │       ├── StudyPlanCard.jsx     # Today's study plan widget
│   │       ├── TopicMasteryCard.jsx  # Topic mastery overview widget
│   │       └── WeakTopicsCard.jsx    # Weak topics highlight widget
│   │
│   └── pages/
│       ├── Landing.jsx          # Public landing/homepage
│       ├── Login.jsx            # User login page
│       ├── Register.jsx         # User registration page
│       ├── Onboarding.jsx       # New-user profile setup wizard
│       ├── Dashboard.jsx        # Main app dashboard
│       ├── Subjects.jsx         # Subject management (CRUD)
│       ├── SubjectDetail.jsx    # Individual subject view with topics
│       ├── Quiz.jsx             # Quiz engine
│       ├── StudyPlan.jsx        # AI-generated study plan viewer
│       ├── Analytics.jsx        # Performance analytics & charts
│       └── Settings.jsx         # User profile & preferences settings
│
├── supabase/                    # DB migration files
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── package.json                 # Project dependencies
└── .env                         # Environment variables (Supabase URL, keys, Groq key)
```

---

## 🔑 Core Features & Functions

### 1. 🔐 Authentication (`AuthContext.jsx`)

| Function          | What It Does                                                                                              |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `signUp()`        | Registers a new user via Supabase Auth; creates auth account                                              |
| `signIn()`        | Logs in an existing user with email + password                                                            |
| `signOut()`       | Logs the user out; clears session & local state                                                           |
| `updateProfile()` | Updates the user's profile in the `profiles` Supabase table (name, board, study level, target exam, etc.) |
| `fetchProfile()`  | Fetches the full profile from the `profiles` table on login                                               |
| `buildUser()`     | Merges Supabase auth user + profile data into a single user object for the app                            |
| `useAuth()`       | Custom hook — exposes `user`, `loading`, and all auth functions to any component                          |

**Supabase tables used:** `profiles`

---

### 2. 🎨 Theme (`ThemeContext.jsx`)

| Function        | What It Does                                                     |
| --------------- | ---------------------------------------------------------------- |
| `ThemeProvider` | Wraps the app and provides a `theme` state (`light` / `dark`)    |
| `useTheme()`    | Custom hook — exposes `theme` and `toggleTheme` to any component |

---

### 3. 🗄️ Database API Layer (`lib/api.js`)

Centralized Supabase CRUD operations organized into four namespaces:

#### `subjectsApi`

| Method                                           | What It Does                                                     |
| ------------------------------------------------ | ---------------------------------------------------------------- |
| `getAll()`                                       | Fetches all subjects for the logged-in user                      |
| `getById(id)`                                    | Fetches a single subject by ID                                   |
| `create({ name, exam_date, daily_study_hours })` | Creates a new subject                                            |
| `update(id, updates)`                            | Updates subject fields                                           |
| `delete(id)`                                     | Deletes a subject (cascades to topics, quiz attempts, schedules) |

#### `topicsApi`

| Method                           | What It Does                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------- |
| `getBySubject(subjectId)`        | Gets all topics for a subject                                                         |
| `getAll()`                       | Gets all topics across all subjects for the user                                      |
| `getById(id)`                    | Gets a single topic                                                                   |
| `create({ subject_id, name })`   | Creates a new topic                                                                   |
| `update(id, updates)`            | Updates topic fields                                                                  |
| `delete(id)`                     | Deletes a topic                                                                       |
| `updateMastery(id, newAccuracy)` | Recalculates mastery using rolling average formula: `(prevMastery + newAccuracy) / 2` |

#### `quizApi`

| Method                                                      | What It Does                                         |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| `recordAttempt({ topic_id, accuracy, time_taken_seconds })` | Saves a quiz attempt AND updates topic mastery score |
| `getAttemptsByTopic(topicId)`                               | Gets all attempts for a specific topic               |
| `getAllAttempts()`                                          | Gets all quiz attempts for the current user          |

#### `schedulesApi`

| Method                                | What It Does                                             |
| ------------------------------------- | -------------------------------------------------------- |
| `getBySubject(subjectId)`             | Gets the latest AI-generated schedule for a subject      |
| `save({ subject_id, schedule_data })` | Saves a new schedule (replaces old one for that subject) |

#### `aiLogsApi`

| Method                                           | What It Does                                      |
| ------------------------------------------------ | ------------------------------------------------- |
| `insert({ subject_id, prompt_used, ai_output })` | Logs every AI schedule generation for audit trail |

**Supabase tables used:** `subjects`, `topics`, `quiz_attempts`, `schedules`, `ai_logs`

---

### 4. 🤖 AI Schedule Generator (`lib/scheduleGenerator.js`)

Uses **Groq** (LLaMA model) to generate personalized weekly study schedules.

| Function                            | What It Does                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `generateSchedule(subject, topics)` | Builds a structured prompt from the subject + topic list, calls Groq API, and returns a parsed weekly schedule JSON |

The AI considers:

- Subject name and exam date
- Daily available study hours
- List of topics with their current mastery scores
- Prioritizes weak topics (low mastery) over strong ones

---

### 5. 📝 Quiz Engine (`lib/quizGenerator.js` + `lib/questionBank.js`)

| Module             | Function                       | What It Does                                                                        |
| ------------------ | ------------------------------ | ----------------------------------------------------------------------------------- |
| `questionBank.js`  | Static question bank           | Pre-defined MCQ questions organized by topic                                        |
| `quizGenerator.js` | `generateQuiz(topicId, count)` | Selects a random set of questions for a given topic                                 |
| `Quiz.jsx`         | Interactive quiz UI            | Renders questions, tracks answers, calculates accuracy, submits results to Supabase |

---

### 6. 📊 Readiness Calculator (`lib/readiness.js`)

| Function                               | What It Does                                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `calculateReadiness(subjects, topics)` | Computes an overall exam readiness percentage from average topic mastery scores across all subjects |

---

### 7. 🚦 Routing & Guards (`App.jsx`, `ProtectedRoute.jsx`)

| Component / Route | What It Does                                                                        |
| ----------------- | ----------------------------------------------------------------------------------- |
| `AuthRedirect`    | Wrapper for public routes — if user is already logged in, redirects to `/dashboard` |
| `ProtectedRoute`  | Wrapper for private routes — if user is NOT logged in, redirects to `/login`        |
| `/`               | Landing page (public)                                                               |
| `/login`          | Login page (public)                                                                 |
| `/register`       | Registration page (public)                                                          |
| `/onboarding`     | New user setup wizard (semi-public, handles own auth check)                         |
| `/dashboard`      | Main dashboard (protected)                                                          |
| `/subjects`       | Subject management (protected)                                                      |
| `/subjects/:id`   | Subject detail + topics (protected)                                                 |
| `/quiz`           | Quiz engine (protected)                                                             |
| `/study-plan`     | AI study plan viewer (protected)                                                    |
| `/analytics`      | Performance analytics (protected)                                                   |
| `/settings`       | Account settings (protected)                                                        |

---

### 8. 📄 Pages Summary

| Page              | Key Features                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Landing**       | Hero section, features overview, CTA buttons for sign up/login                                      |
| **Login**         | Email + password sign-in form with Supabase auth                                                    |
| **Register**      | New account creation with name, email, password                                                     |
| **Onboarding**    | Multi-step wizard: collects study level, board/university, target exam, daily hours, learning style |
| **Dashboard**     | Summary cards: Readiness Score, Today's Study Plan, Topic Mastery, Weak Topics                      |
| **Subjects**      | CRUD for subjects — add, edit, delete subjects with exam date & study hours                         |
| **SubjectDetail** | View/add/delete topics for a subject; see per-topic mastery scores                                  |
| **Quiz**          | Select a topic → take MCQ quiz → submit → mastery score updates                                     |
| **StudyPlan**     | Select a subject → generate AI schedule via Groq → view weekly plan                                 |
| **Analytics**     | Charts for quiz performance over time, mastery trends, subject comparison                           |
| **Settings**      | Update profile fields (name, board, exam target, daily hours, theme toggle)                         |

---

### 9. 🧩 Dashboard Widgets (`components/dashboard/`)

| Component          | What It Displays                                                             |
| ------------------ | ---------------------------------------------------------------------------- |
| `ReadinessCard`    | Overall exam readiness percentage (calculated from all topic mastery scores) |
| `StudyPlanCard`    | Today's recommended study sessions from the latest AI-generated plan         |
| `TopicMasteryCard` | Visual mastery levels for all topics                                         |
| `WeakTopicsCard`   | List of topics with mastery score below a threshold — needs attention        |

---

### 10. 🏗️ Layout Components (`components/layout/`)

| Component   | What It Does                                                                          |
| ----------- | ------------------------------------------------------------------------------------- |
| `AppLayout` | Shell that combines Sidebar + TopBar + `<Outlet>` for nested routes                   |
| `Sidebar`   | Left navigation — links to Dashboard, Subjects, Quiz, Study Plan, Analytics, Settings |
| `TopBar`    | Top bar — displays username, theme toggle button, sign-out button                     |

---

## 🗃️ Supabase Database Schema (Tables)

| Table           | Columns                                                                                                                                  | Purpose                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `profiles`      | `id`, `name`, `board`, `study_level`, `university`, `target_exam`, `target_year`, `daily_hours`, `learning_style`, `onboarding_complete` | Extended user profile data                    |
| `subjects`      | `id`, `user_id`, `name`, `exam_date`, `daily_study_hours`, `created_at`                                                                  | Study subjects per user                       |
| `topics`        | `id`, `subject_id`, `name`, `mastery_score`, `total_attempts`, `last_accuracy`, `created_at`                                             | Topics within a subject with mastery tracking |
| `quiz_attempts` | `id`, `topic_id`, `user_id`, `accuracy`, `time_taken_seconds`, `attempted_at`                                                            | Historical quiz results                       |
| `schedules`     | `id`, `user_id`, `subject_id`, `schedule_data` (JSON), `generated_at`                                                                    | AI-generated weekly schedules                 |
| `ai_logs`       | `id`, `user_id`, `subject_id`, `prompt_used`, `ai_output`, `created_at`                                                                  | Audit trail for all AI generations            |

---

## 🌐 Environment Variables (`.env`)

| Variable                 | Purpose                                 |
| ------------------------ | --------------------------------------- |
| `VITE_SUPABASE_URL`      | Supabase project URL                    |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key                |
| `VITE_GROQ_API_KEY`      | Groq API key for AI schedule generation |

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Development server runs at: `http://localhost:5173`

---

## 📋 Implementation Status

| Feature                           | Status      |
| --------------------------------- | ----------- |
| Landing Page                      | ✅ Complete |
| User Registration                 | ✅ Complete |
| User Login / Logout               | ✅ Complete |
| Onboarding Wizard                 | ✅ Complete |
| Protected Routes                  | ✅ Complete |
| Subject Management (CRUD)         | ✅ Complete |
| Topic Management (CRUD)           | ✅ Complete |
| Quiz Engine                       | ✅ Complete |
| Topic Mastery Tracking            | ✅ Complete |
| AI Study Schedule Generation      | ✅ Complete |
| Schedule Persistence              | ✅ Complete |
| Analytics & Charts                | ✅ Complete |
| User Settings / Profile Edit      | ✅ Complete |
| Dark/Light Theme Toggle           | ✅ Complete |
| AI Generation Logging             | ✅ Complete |
| Supabase RLS (Row Level Security) | ✅ Complete |
