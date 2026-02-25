# 🏗 COMPLETE ARCHITECTURE — AI Study Strategist (MVP)

Recommended Stack:

* **Frontend:** React
* **Backend:** Supabase (Auth + PostgreSQL + Edge Functions)
* **AI API:** Groq or Google
* **Database:** PostgreSQL (via Supabase)

---

# 1️⃣ DATABASE DESIGN (PostgreSQL)

We’ll use a clean relational model.

---

## 🧑 users

Managed by Supabase Auth (but extend profile if needed)

```
id (uuid, primary key)
email
created_at
```

---

## 📚 subjects

Each user can have multiple subjects.

```
id (uuid, primary key)
user_id (uuid, foreign key → users.id)
name (text)
exam_date (date)
daily_study_hours (int)
created_at (timestamp)
```

---

## 📖 topics

Each subject has multiple topics.

```
id (uuid, primary key)
subject_id (uuid, foreign key → subjects.id)
name (text)
mastery_score (float default 0)
total_attempts (int default 0)
last_accuracy (float)
created_at (timestamp)
```

---

## 📝 quiz_attempts

Stores every quiz attempt.

```
id (uuid, primary key)
topic_id (uuid, foreign key → topics.id)
accuracy (float)
time_taken_seconds (int)
attempted_at (timestamp)
```

---

## 📅 schedules

Stores AI-generated schedules.

```
id (uuid, primary key)
user_id (uuid, foreign key → users.id)
subject_id (uuid, foreign key → subjects.id)
schedule_json (jsonb)
generated_at (timestamp)
```

---

## 📊 readiness_snapshots (Optional but recommended)

For tracking readiness over time.

```
id (uuid, primary key)
subject_id (uuid, foreign key)
readiness_score (float)
calculated_at (timestamp)
```

---

# 🔗 RELATIONSHIPS

```
User
  → Subjects
      → Topics
          → Quiz Attempts

User + Subject
  → Schedules

Subject
  → Readiness Snapshots
```

---

# 2️⃣ BUSINESS LOGIC LAYER

Runs inside Supabase Edge Functions.

---

## 🎯 Mastery Calculation

On quiz submission:

```
New Mastery =
(previous_mastery * total_attempts + new_accuracy)
/ (total_attempts + 1)
```

Then:

* Update total_attempts
* Update last_accuracy

---

## 🎯 Readiness Score Formula (MVP)

```
Readiness =
(Avg Topic Mastery × Coverage)
− Weak Topic Penalty
```

Where:

Coverage = Topics Attempted / Total Topics
Weak penalty if mastery < 60%

---

# 3️⃣ API ENDPOINTS (Complete List)

These can be implemented as Edge Functions or REST APIs.

---

# 🔐 AUTH

Handled by Supabase Auth.

---

# 📚 SUBJECT MANAGEMENT

---

## POST /subjects

Create subject

Request:

```json
{
  "name": "Physics",
  "exam_date": "2026-03-10",
  "daily_study_hours": 3
}
```

Response:

```json
{
  "id": "subject_uuid"
}
```

---

## GET /subjects

Returns all subjects for user.

---

# 📖 TOPIC MANAGEMENT

---

## POST /subjects/:id/topics

Add topic

```json
{
  "name": "Thermodynamics"
}
```

---

## GET /subjects/:id/topics

Returns all topics.

---

# 📝 QUIZ SYSTEM

---

## POST /quiz/submit

Request:

```json
{
  "topic_id": "uuid",
  "accuracy": 65,
  "time_taken_seconds": 180
}
```

Backend does:

* Insert into quiz_attempts
* Update mastery
* Recalculate readiness

Response:

```json
{
  "new_mastery": 68,
  "readiness_score": 72
}
```

---

# 📊 READINESS

---

## GET /subjects/:id/readiness

Response:

```json
{
  "readiness_score": 72,
  "coverage": 0.8,
  "weak_topics": [
    { "name": "Thermodynamics", "mastery": 42 }
  ]
}
```

---

# 🤖 AI SCHEDULE GENERATION

---

## POST /subjects/:id/generate-schedule

Backend flow:

1. Fetch topic data
2. Rank by mastery ascending
3. Calculate days remaining
4. Prepare AI prompt
5. Call AI API
6. Validate JSON
7. Store schedule
8. Return schedule

Response:

```json
{
  "schedule": {
    "Day 1": [
      {
        "topic": "Thermodynamics",
        "duration": 60,
        "reason": "Low mastery"
      }
    ]
  }
}
```

---

## GET /subjects/:id/schedule

Returns latest stored schedule.

---

# 4️⃣ AI INTEGRATION ARCHITECTURE

---

## Prompt Input Structure

```
Exam Date
Days Remaining
Daily Study Hours
Topic List:
- Topic Name
- Mastery Score
- Attempts
```

---

## AI Returns

Strict JSON:

```
{
  "Day 1": [...],
  "Day 2": [...]
}
```

---

## Backend Responsibilities

* Validate JSON
* Ensure durations ≤ daily hours
* Prevent malformed output
* Store schedule_json (jsonb)

---

# 5️⃣ COMPLETE SYSTEM ARCHITECTURE

```
User (Browser)
     ↓
React Frontend
     ↓
Supabase Auth
     ↓
Supabase PostgreSQL
     ↓
Edge Function (Business Logic)
     ↓
AI API (Groq / Gemini)
     ↓
Back to Edge Function
     ↓
Database (Store Schedule)
     ↓
Frontend Dashboard
```

---

# 6️⃣ DEPLOYMENT ARCHITECTURE

Frontend:

* Vercel

Backend:

* Supabase hosted

AI:

* External API

Environment Variables:

* AI_API_KEY
* SUPABASE_URL
* SUPABASE_ANON_KEY

---

# 7️⃣ WHY THIS ARCHITECTURE IS STRONG

* Serverless
* Relational DB clarity
* AI isolated as service
* Clean separation of concerns
* Hackathon-feasible
* Scalable later

---

# 8️⃣ FUTURE SCALABILITY

Later you can add:

* Confidence weighting
* Bayesian Knowledge Tracing
* Institutional dashboard
* AI-generated quizzes
* Mobile app

---

# 🎯 FINAL SUMMARY

You need:

### 6 Core Tables

* users
* subjects
* topics
* quiz_attempts
* schedules
* readiness_snapshots (optional)

### 8–10 API Endpoints

* CRUD subjects/topics
* Submit quiz
* Get readiness
* Generate schedule
* Fetch schedule

### 1 AI Integration Endpoint

That’s your complete MVP backend architecture.
