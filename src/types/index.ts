export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  target_date: string;
  current_phase: number;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  date: string;
  duration_minutes: number;
  session_type: 'vocabulary' | 'conversation' | 'grammar' | 'listening' | 'speaking';
  notes: string | null;
  ai_feedback: string | null;
  created_at: string;
}

export interface VocabularyWord {
  id: string;
  user_id: string;
  turkish: string;
  english: string;
  category: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  next_review: string;
  last_reviewed: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  scenario: string;
  messages: ChatMessage[];
  score: number | null;
  errors_count: number;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  total_days_studied: number;
  updated_at: string;
}

export interface WeeklyGoal {
  id: string;
  user_id: string;
  week_number: number;
  phase: number;
  focus_topic: string;
  vocab_target: number;
  sessions_target: number;
  vocab_achieved: number;
  sessions_achieved: number;
  claude_weekly_prompt: string | null;
  created_at: string;
}

export interface GrammarNote {
  id: string;
  user_id: string;
  topic: string;
  explanation: string;
  examples: string[];
  phase_introduced: number;
  created_at: string;
}

export interface ConversationScenario {
  id: string;
  name: string;
  nametr: string;
  description: string;
  icon: string;
  phase_required: number;
  system_prompt: string;
}

export type SM2Rating = 0 | 1 | 2 | 3 | 4 | 5;
