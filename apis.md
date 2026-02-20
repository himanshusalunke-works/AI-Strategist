# 🚀 REST API – AI Study Strategist

Base URL:

```
/api/v1
```

---

# 🔐 1️⃣ AUTH ROUTES

(If using Supabase Auth, these are managed automatically. If custom auth, use below.)

---

## 🔹 Register

### POST `/api/v1/auth/register`

**Request**

```json
{
  "email": "user@email.com",
  "password": "password123"
}
```

**Response**

```json
{
  "user_id": "uuid",
  "token": "jwt_token"
}
```

---

## 🔹 Login

### POST `/api/v1/auth/login`

**Request**

```json
{
  "email": "user@email.com",
  "password": "password123"
}
```

**Response**

```json
{
  "token": "jwt_token"
}
```

---

# 📚 2️⃣ SUBJECT ROUTES

---

## 🔹 Create Subject

### POST `/api/v1/subjects`

**Headers**

```
Authorization: Bearer <token>
```

**Request**

```json
{
  "name": "Physics",
  "exam_date": "2026-03-10",
  "daily_study_hours": 3
}
```

**Response**

```json
{
  "id": "subject_uuid",
  "name": "Physics"
}
```

---

## 🔹 Get All Subjects

### GET `/api/v1/subjects`

**Response**

```json
[
  {
    "id": "uuid",
    "name": "Physics",
    "exam_date": "2026-03-10",
    "readiness_score": 72
  }
]
```

---

## 🔹 Get Single Subject

### GET `/api/v1/subjects/:subjectId`

---

## 🔹 Delete Subject

### DELETE `/api/v1/subjects/:subjectId`

---

# 📖 3️⃣ TOPIC ROUTES

---

## 🔹 Add Topic

### POST `/api/v1/subjects/:subjectId/topics`

```json
{
  "name": "Thermodynamics"
}
```

---

## 🔹 Get Topics

### GET `/api/v1/subjects/:subjectId/topics`

**Response**

```json
[
  {
    "id": "uuid",
    "name": "Thermodynamics",
    "mastery_score": 42,
    "total_attempts": 2
  }
]
```

---

## 🔹 Update Topic

### PATCH `/api/v1/topics/:topicId`

```json
{
  "name": "Updated Topic Name"
}
```

---

## 🔹 Delete Topic

### DELETE `/api/v1/topics/:topicId`

---

# 📝 4️⃣ QUIZ ROUTES

---

## 🔹 Submit Quiz Attempt

### POST `/api/v1/quiz/submit`

```json
{
  "topic_id": "uuid",
  "accuracy": 65,
  "time_taken_seconds": 180
}
```

### Backend Actions:

* Insert into `quiz_attempts`
* Recalculate mastery
* Recalculate readiness

**Response**

```json
{
  "topic_mastery": 68,
  "readiness_score": 72,
  "weak_topic": false
}
```

---

## 🔹 Get Quiz Attempts (Optional)

### GET `/api/v1/topics/:topicId/attempts`

---

# 📊 5️⃣ READINESS ROUTES

---

## 🔹 Get Readiness Score

### GET `/api/v1/subjects/:subjectId/readiness`

**Response**

```json
{
  "readiness_score": 72,
  "coverage": 0.8,
  "weak_topics": [
    {
      "id": "uuid",
      "name": "Thermodynamics",
      "mastery": 42
    }
  ]
}
```

---

# 🤖 6️⃣ AI SCHEDULE ROUTES

---

## 🔹 Generate AI Study Schedule

### POST `/api/v1/subjects/:subjectId/generate-schedule`

### Backend Flow:

1. Fetch topics
2. Rank by mastery
3. Compute days remaining
4. Build AI prompt
5. Call AI API
6. Validate JSON
7. Store in `schedules`
8. Return schedule

---

### Response

```json
{
  "schedule_id": "uuid",
  "generated_at": "timestamp",
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

## 🔹 Get Latest Schedule

### GET `/api/v1/subjects/:subjectId/schedule`

---

## 🔹 Regenerate Schedule

Same as generate endpoint (can reuse POST).

---

# 📈 7️⃣ ANALYTICS ROUTES (Optional)

---

## 🔹 Get Readiness History

### GET `/api/v1/subjects/:subjectId/readiness-history`

---

# 🏗 PROJECT STRUCTURE (Node + Express)

```
/src
  /controllers
    authController.js
    subjectController.js
    topicController.js
    quizController.js
    scheduleController.js

  /services
    masteryService.js
    readinessService.js
    aiSchedulerService.js

  /models
    userModel.js
    subjectModel.js
    topicModel.js
    quizModel.js
    scheduleModel.js

  /routes
    authRoutes.js
    subjectRoutes.js
    topicRoutes.js
    quizRoutes.js
    scheduleRoutes.js

  /middleware
    authMiddleware.js

  app.js
  server.js
```

---

# 🔒 AUTH MIDDLEWARE

Protect all routes except:

* `/auth/register`
* `/auth/login`

All others require JWT validation.

---

# 📌 ERROR HANDLING FORMAT

Standardized error response:

```json
{
  "error": {
    "code": 400,
    "message": "Invalid input data"
  }
}
```

---

# 🎯 COMPLETE ENDPOINT LIST

| Method | Endpoint                        | Purpose        |
| ------ | ------------------------------- | -------------- |
| POST   | /auth/register                  | Register       |
| POST   | /auth/login                     | Login          |
| POST   | /subjects                       | Create subject |
| GET    | /subjects                       | Get subjects   |
| GET    | /subjects/:id                   | Get subject    |
| DELETE | /subjects/:id                   | Delete         |
| POST   | /subjects/:id/topics            | Add topic      |
| GET    | /subjects/:id/topics            | Get topics     |
| PATCH  | /topics/:id                     | Update topic   |
| DELETE | /topics/:id                     | Delete topic   |
| POST   | /quiz/submit                    | Submit quiz    |
| GET    | /subjects/:id/readiness         | Get readiness  |
| POST   | /subjects/:id/generate-schedule | AI schedule    |
| GET    | /subjects/:id/schedule          | Get schedule   |
