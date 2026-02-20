# 🎨 UI/UX Design Document

## Product: AI Study Strategist

## Version: MVP (Hackathon)

---

# 1️⃣ Design Philosophy

### Core Principles

* Clean & modern dashboard layout
* Soft card-based UI
* Clear data hierarchy
* Minimal cognitive overload
* Data-driven but friendly
* Focus on confidence & clarity

---

# 2️⃣ Design Language

### 🎨 Color Palette

Primary:

* Deep Blue (#1E3A8A) – Trust, intelligence
* Soft Indigo (#4F46E5)

Accent:

* Teal / Cyan (#06B6D4) – AI highlights
* Green (#22C55E) – Strong mastery
* Orange (#F59E0B) – Moderate
* Red (#EF4444) – Weak topics

Background:

* Light gray (#F9FAFB)
* White cards (#FFFFFF)

---

### 🖋 Typography

* Headings: Inter / Poppins (Bold)
* Body: Inter Regular
* Numbers (Readiness Score): Semi-bold large display font

---

# 3️⃣ Layout Structure

## Overall Layout (Similar to Reference)

```
-------------------------------------------------
| Sidebar | Top Bar                            |
|         |-------------------------------------|
|         | Main Dashboard Area                |
|         |                                     |
|         | Cards / Charts / Schedule Panels   |
-------------------------------------------------
```

---

# 4️⃣ Core Screens

---

# 🏠 A. Dashboard Screen (Main Screen)

## Layout Sections

### 🔹 Left Sidebar

* Logo (AI Study Strategist)
* Dashboard
* Subjects
* Quiz
* Study Plan
* Settings

Minimal icons + text.

---

### 🔹 Top Navigation Bar

* Welcome message: “Good Evening, Himanshu”
* Exam countdown
* Profile avatar

---

### 🔹 Main Dashboard Content

## 1. Readiness Overview Card (Top Left)

Large circular progress indicator:

* “Readiness: 72%”
* Subtext: “Exam in 12 days”

Design:

* Gradient circular progress ring
* Clean white card with soft shadow

---

## 2. Topic Mastery Overview (Top Right)

Horizontal progress bars:

| Topic | Mastery % | Status |
| ----- | --------- | ------ |

Color-coded:

* > 80% → Green
* 60–80% → Orange
* <60% → Red

---

## 3. Weak Topics Panel

Card titled:
“Priority Focus Areas”

List:

* Thermodynamics (42%)
* Integration (55%)

Small warning icon.

---

## 4. AI Study Plan Panel (Large Card Bottom)

Day-wise schedule:

Example:

**Day 1**

* Thermodynamics – 60 min
* Calculus – 45 min

Each item expandable:

Click → Shows:
“Scheduled due to low mastery and exam proximity.”

Include:
“Regenerate Plan” button (Primary CTA)

---

# 📝 B. Quiz Screen

Layout:

Left:

* Topic name
* Progress indicator

Center:

* Question card
* Multiple choice options

Right:

* Timer
* Question count

After submission:

Show:

* Score
* Performance summary
* AI feedback card

---

# 📊 C. Analytics Screen

Widgets:

* Readiness trend line graph
* Accuracy over time
* Topic improvement graph
* Attempt frequency heatmap

Clean card-based layout.

---

# 🗓 D. Study Plan View (Detailed)

Calendar-style layout:

Left:

* Calendar sidebar

Right:

* Selected day’s study breakdown

Each item shows:

* Topic
* Duration
* AI explanation tooltip

---

# 5️⃣ Component Design System

---

## Card Component

* Rounded corners (16px radius)
* Soft shadow
* White background
* Padding: 24px
* Clear header typography

---

## Button System

Primary Button:

* Solid Indigo
* Rounded
* Bold text

Secondary Button:

* Outline style
* Subtle hover

Danger Button:

* Red for delete actions

---

## Progress Indicators

* Circular (Readiness)
* Linear (Topic mastery)
* Mini progress dots (Quiz)

---

# 6️⃣ Micro-Interactions

* Hover effects on cards
* Smooth sidebar animation
* Progress bar animation on load
* Schedule regeneration loading spinner
* Success animation after quiz

---

# 7️⃣ UX Flow

1. User logs in
2. Lands on Dashboard
3. Sees readiness + weak topics
4. Attempts quiz
5. Returns to dashboard
6. Clicks Generate Plan
7. Sees AI schedule with explanation

Everything should feel:

* Clear
* Guided
* Controlled
* Non-overwhelming

---

# 8️⃣ Responsive Design

For MVP:

* Desktop-first
* Tablet responsive
* Mobile simplified version

Mobile layout:

* Sidebar collapses
* Cards stack vertically

---

# 9️⃣ Accessibility

* Clear contrast
* Large readable fonts
* Avoid color-only status indicators
* Tooltips for AI explanations

---

# 🔟 Visual Identity Tone

Professional but student-friendly.
Smart but not intimidating.
Data-rich but clean.

---

# 🎯 Design Goal Summary

The UI should communicate:

* Clarity
* Intelligence
* Personalization
* Trust
* Performance awareness

Not:

* Complexity
* Academic overload
* Technical jargon
