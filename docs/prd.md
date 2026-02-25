# 📄 Product Requirements Document (PRD)

## Product Name

**AI Study Strategist**

## Version

MVP – Hackathon Build

---

# 1. Overview

AI Study Strategist is an adaptive, AI-powered exam preparation platform that:

* Tracks topic-level performance
* Calculates exam readiness
* Generates personalized, explainable study schedules
* Continuously adapts based on new quiz data

The system combines deterministic mastery scoring with AI-based schedule optimization.

---

# 2. Problem Statement

Students lack:

* Objective readiness measurement
* Personalized revision strategies
* Transparent feedback on weaknesses
* Adaptive study planning

Existing tools are static and do not dynamically adjust based on real performance data.

---

# 3. Goals (MVP Scope)

### Primary Goals

1. Track topic-level mastery
2. Calculate readiness score
3. Generate AI-based adaptive study schedule
4. Provide explainable scheduling decisions
5. Enable schedule regeneration after new performance updates

### Non-Goals (Out of Scope for MVP)

* Mobile app
* Institutional dashboards
* Peer benchmarking
* Offline capability
* Payment integration
* Advanced ML training models

---

# 4. User Persona

### Primary User

* College / competitive exam student
* Preparing for a specific exam
* Has limited time
* Needs clear, structured revision plan

---

# 5. Functional Requirements

---

## 5.1 User Management

### FR-1: User Registration

* User can register using email/password
* Authentication managed via Supabase Auth

### FR-2: User Login

* Secure login required before accessing dashboard

---

## 5.2 Subject & Topic Management

### FR-3: Create Subject

User must be able to:

* Add subject name
* Set exam date
* Set daily study hours

### FR-4: Add Topics

User must be able to:

* Add multiple topics per subject
* Edit or delete topics

---

## 5.3 Quiz & Performance Tracking

### FR-5: Attempt Quiz

* User attempts topic-level quiz (3–5 questions)
* System records:

  * Accuracy (%)
  * Attempt timestamp

### FR-6: Mastery Calculation

System updates topic mastery score after each quiz.

Formula (MVP version):

```
New Mastery = (Previous Mastery + Current Accuracy) / 2
```

---

## 5.4 Readiness Engine

### FR-7: Calculate Readiness Score

```
Readiness Score =
(Avg Topic Accuracy × Topic Coverage)
− Weak Topic Penalty
```

Where:

* Coverage = Topics attempted / Total topics
* Weak penalty applied if topic accuracy < 60%

### FR-8: Display Readiness

Dashboard must display:

* Overall readiness %
* Topic mastery bars
* Weak topics highlight

---

## 5.5 AI Schedule Generation

### FR-9: Generate Study Schedule

When user clicks “Generate Plan”:

System must:

1. Collect topic performance data
2. Rank topics by priority
3. Send structured prompt to LLM
4. Receive JSON schedule
5. Validate structure
6. Store in database
7. Display schedule

---

### FR-10: AI Output Requirements

AI must return structured JSON:

```json
{
  "Day 1": [
    {
      "topic": "Thermodynamics",
      "duration": 60,
      "reason": "Low mastery and exam proximity"
    }
  ]
}
```

System must reject invalid format.

---

## 5.6 Schedule Regeneration

### FR-11: Regenerate Plan

* User can regenerate schedule after new quiz attempts
* New schedule replaces previous plan

---

# 6. Non-Functional Requirements

---

## 6.1 Performance

* Schedule generation latency < 3 seconds (API dependent)
* Dashboard load time < 2 seconds

---

## 6.2 Scalability

* Designed for prototype scale
* Serverless architecture for easier scaling

---

## 6.3 Security

* Authentication required
* Row-level security in Supabase
* No sensitive AI keys exposed to frontend

---

## 6.4 Reliability

* Fallback error handling if AI API fails
* Display meaningful error message

---

# 7. System Architecture

---

## Frontend

**React**

* Dashboard UI
* Quiz component
* Schedule view
* Charts for readiness visualization

---

## Backend

**Supabase**
Supabase

Handles:

* Authentication
* PostgreSQL database
* Edge Functions for AI integration

---

## Database

PostgreSQL (via Supabase)

### Tables

users
subjects
topics
quiz_attempts
schedules

---

## AI Layer

Using:

* Groq
  or
* Google

AI responsibilities:

* Time allocation optimization
* Topic distribution
* Explanation generation

---

# 8. API Contracts

---

## POST /generate-schedule

### Request Body

```
{
  userId,
  subjectId
}
```

### Response

```
{
  schedule: { JSON },
  generatedAt: timestamp
}
```

---

## GET /readiness

### Response

```
{
  readinessScore: number,
  weakTopics: [],
  topicBreakdown: []
}
```

---

# 9. Data Model (High-Level)

User
→ has many Subjects
→ each Subject has many Topics
→ each Topic has many Quiz Attempts
→ Schedule belongs to User + Subject

---

# 10. Risks & Mitigation

| Risk                      | Mitigation                           |
| ------------------------- | ------------------------------------ |
| AI returns malformed JSON | Enforce strict prompt + validator    |
| API latency               | Cache schedule                       |
| AI quota limit            | Use fallback provider                |
| Over-complex scheduling   | Keep deterministic ranking before AI |

---

# 11. Future Enhancements

* Bayesian Knowledge Tracing
* Confidence-based weighting
* Multilingual AI explanations
* Competitive exam mode
* Institutional analytics dashboard

---

# 12. Success Metrics (Hackathon Evaluation)

* Functional AI schedule generation
* Accurate readiness tracking
* Adaptive behavior after new quiz attempts
* Clear explanation of AI decisions
* Smooth demo flow
