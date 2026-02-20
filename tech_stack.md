# 🚀 Final Tech Stack – AI Study Strategist (MVP)

We chose this stack based on:

* Fast development
* Serverless architecture
* AI integration simplicity
* Scalability
* Hackathon feasibility

---

# 🖥 1️⃣ Frontend Layer

## **React (Vite or Next.js optional)**

### Why React?

* Component-based UI
* Fast dashboard development
* Easy state management
* Strong ecosystem for charts

### Responsibilities:

* User authentication UI
* Subject & topic management
* Quiz interface
* Readiness visualization
* AI schedule display
* Regenerate schedule button

### Libraries:

* Chart.js / Recharts (readiness graph)
* Axios (API calls)
* Tailwind CSS (fast styling)

---

# 🗄 2️⃣ Backend & Database Layer

## **Supabase (Backend-as-a-Service)**

Supabase

### Why Supabase?

* Built-in PostgreSQL (relational DB)
* Authentication included
* Row-Level Security
* Serverless Edge Functions
* No need to deploy custom Express server

### Responsibilities:

* User authentication
* Data storage (users, topics, attempts)
* Mastery & readiness queries
* AI schedule generation (via Edge Functions)

---

## 🧱 Database: PostgreSQL (via Supabase)

### Why PostgreSQL?

* Relational structure fits:

  * Users → Subjects → Topics → Attempts
* Easy aggregation queries
* Clean mastery calculation
* Strong scalability

### Core Tables:

* users
* subjects
* topics
* quiz_attempts
* schedules

---

# 🤖 3️⃣ AI Layer

Using either:

## Option A (Performance Focus):

Groq

## Option B (Structured + Stable):

Google (Gemini API)

---

### AI Responsibilities:

* Time allocation optimization
* Day-wise topic distribution
* Balanced workload generation
* Explanation of scheduling decisions
* Structured JSON output

---

# ⚙️ 4️⃣ Business Logic Layer

Runs inside:

* Supabase Edge Functions (Serverless)

Handles:

* Mastery score calculation
* Readiness score computation
* Topic ranking
* AI prompt generation
* JSON validation

---

# 🌐 5️⃣ Deployment

Frontend:

* Vercel / Netlify

Backend:

* Supabase (hosted)

AI:

* External API

---

# 🧠 Why This Stack Is Strong

| Layer          | Why It’s Good                  |
| -------------- | ------------------------------ |
| React          | Fast UI iteration              |
| Supabase       | Eliminates backend boilerplate |
| PostgreSQL     | Clean relational model         |
| Edge Functions | Serverless logic               |
| Groq/Gemini    | Real-time AI scheduling        |
| Vercel         | One-click deploy               |

---

# 🔥 Architecture Summary

```
User
  ↓
React Frontend
  ↓
Supabase (Auth + PostgreSQL + Edge Functions)
  ↓
AI API (Groq / Gemini)
```

---

# 🎯 Why Not Firebase?

Firebase

Firebase uses NoSQL (Firestore).
Our system benefits from relational queries (topics, attempts, ranking).
So PostgreSQL via Supabase is more suitable.
