-- Türkçe OS — Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Users profile (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  target_date DATE DEFAULT '2025-08-07',
  current_phase INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily study sessions
CREATE TABLE study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  duration_minutes INT DEFAULT 0,
  session_type TEXT,
  notes TEXT,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vocabulary bank
CREATE TABLE vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  turkish TEXT NOT NULL,
  english TEXT NOT NULL,
  category TEXT,
  ease_factor FLOAT DEFAULT 2.5,
  interval_days INT DEFAULT 1,
  repetitions INT DEFAULT 0,
  next_review DATE DEFAULT CURRENT_DATE,
  last_reviewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation history with Claude
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scenario TEXT,
  messages JSONB DEFAULT '[]',
  score INT,
  errors_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streak tracking
CREATE TABLE streaks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE,
  total_days_studied INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Weekly goals and phase targets
CREATE TABLE weekly_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INT,
  phase INT,
  focus_topic TEXT,
  vocab_target INT DEFAULT 20,
  sessions_target INT DEFAULT 5,
  vocab_achieved INT DEFAULT 0,
  sessions_achieved INT DEFAULT 0,
  claude_weekly_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_number)
);

-- Grammar notes
CREATE TABLE grammar_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  topic TEXT,
  explanation TEXT,
  examples JSONB DEFAULT '[]',
  phase_introduced INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE grammar_notes ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can only access own data" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only access own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own vocab" ON vocabulary
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own conversations" ON conversations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own streaks" ON streaks
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own goals" ON weekly_goals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access own grammar" ON grammar_notes
  FOR ALL USING (auth.uid() = user_id);

-- Trigger: auto-create profile + streak on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  INSERT INTO streaks (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
