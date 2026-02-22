-- ============================================
-- AI Study Strategist – Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- User Profiles
-- ============================================

-- ---- Profiles ----
-- One row per user. Created automatically via trigger on auth.users insert.
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info (synced from auth.users on creation)
  name               TEXT,
  email              TEXT,

  -- Academic background (collected during onboarding)
  board              TEXT,                     -- e.g. 'CBSE', 'IB', 'UPSC Entrance'
  study_level        TEXT,                     -- e.g. 'School – Class 12', 'Undergraduate – Year 2'
  university         TEXT,                     -- e.g. 'Delhi University'

  -- Exam goals
  target_exam        TEXT,                     -- e.g. 'JEE Advanced', 'NEET', 'GATE'
  target_year        INTEGER,                  -- e.g. 2026
  daily_hours        NUMERIC(4,1),             -- e.g. 4.5

  -- Study preferences
  learning_style     TEXT,                     -- 'Visual' | 'Auditory' | 'Reading/Writing' | 'Kinesthetic' | 'Mixed'

  -- Onboarding state
  onboarding_complete BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create a profile row whenever a new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'name',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);



-- ---- Subjects ----
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  exam_date DATE NOT NULL,
  daily_study_hours INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Topics ----
CREATE TABLE IF NOT EXISTS topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  mastery_score INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_accuracy INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Quiz Attempts ----
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  accuracy INTEGER NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
  time_taken_seconds INTEGER,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Schedules ----
CREATE TABLE IF NOT EXISTS schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  schedule_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---- Readiness Snapshots (Optional) ----
CREATE TABLE IF NOT EXISTS readiness_snapshots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  readiness_score INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE readiness_snapshots ENABLE ROW LEVEL SECURITY;

-- Subjects: users can only see/modify their own
CREATE POLICY "Users manage own subjects" ON subjects
  FOR ALL USING (auth.uid() = user_id);

-- Topics: users can manage topics of their subjects
CREATE POLICY "Users manage own topics" ON topics
  FOR ALL USING (
    subject_id IN (SELECT id FROM subjects WHERE user_id = auth.uid())
  );

-- Quiz Attempts: users can manage their own attempts
CREATE POLICY "Users manage own quiz attempts" ON quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

-- Schedules: users can manage their own schedules
CREATE POLICY "Users manage own schedules" ON schedules
  FOR ALL USING (auth.uid() = user_id);

-- Readiness Snapshots: users can manage their own
CREATE POLICY "Users manage own readiness snapshots" ON readiness_snapshots
  FOR ALL USING (
    subject_id IN (SELECT id FROM subjects WHERE user_id = auth.uid())
  );

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_subjects_user ON subjects(user_id);
CREATE INDEX IF NOT EXISTS idx_topics_subject ON topics(subject_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_topic ON quiz_attempts(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_schedules_subject ON schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_readiness_subject ON readiness_snapshots(subject_id);

-- ---- AI Logs ----
CREATE TABLE IF NOT EXISTS public.ai_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    prompt_used TEXT,
    ai_output JSONB NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.ai_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own ai_logs" ON public.ai_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_logs" ON public.ai_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_user ON ai_logs(user_id);
