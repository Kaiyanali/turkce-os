'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { calculatePhase, calculateWeek, daysUntilTarget } from '@/lib/phase';
import { Profile, Streak, StudySession, VocabularyWord } from '@/types';
import { StreakBanner } from '@/components/dashboard/streak-banner';
import { PhaseBadge } from '@/components/dashboard/phase-badge';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Countdown } from '@/components/dashboard/countdown';
import { ProgressRing } from '@/components/ui/progress-ring';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const FOCUS_BY_PHASE: Record<number, string[]> = {
  1: [
    'Practice greetings — say Merhaba to someone today',
    'Order a kahve in Turkish at the cafe scenario',
    'Review your food vocabulary flashcards',
    'Learn 5 new words from the numbers category',
    'Practice vowel harmony with suffix examples',
  ],
  2: [
    'Describe what you did yesterday using past tense',
    'Practice ordering at the market with numbers',
    'Review case markers — dative and locative',
    'Try the "Describing My Day" conversation scenario',
    'Learn question words: ne, nerede, nasıl, kaç',
  ],
  3: [
    'Tell a story about your weekend in Turkish',
    'Practice conditional sentences with -sa/-se',
    'Use modal verbs: istiyorum, yapabilirim, lazım',
    'Try complex sentences with conjunctions',
    'Review reported speech with -miş suffix',
  ],
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<Streak | null>(null);
  const [vocabDue, setVocabDue] = useState(0);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [hasActivityToday, setHasActivityToday] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch all data in parallel
      const [profileRes, streakRes, vocabRes, sessionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('streaks').select('*').eq('user_id', user.id).single(),
        supabase
          .from('vocabulary')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .lte('next_review', new Date().toISOString().split('T')[0]),
        supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (streakRes.data) {
        setStreak(streakRes.data);
        const today = new Date().toISOString().split('T')[0];
        setHasActivityToday(streakRes.data.last_activity_date === today);
      }
      if (vocabRes.count !== null) setVocabDue(vocabRes.count);
      if (sessionsRes.data) setRecentSessions(sessionsRes.data);
    };

    loadDashboard();
  }, []);

  const phase = profile ? calculatePhase(profile.created_at) : 1;
  const week = profile ? calculateWeek(profile.created_at) : 1;
  const focusOptions = FOCUS_BY_PHASE[phase] || FOCUS_BY_PHASE[1];
  const todayFocus = focusOptions[new Date().getDay() % focusOptions.length];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Merhaba{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Streak */}
      {streak && (
        <StreakBanner
          currentStreak={streak.current_streak}
          longestStreak={streak.longest_streak}
          hasActivityToday={hasActivityToday}
          totalDaysStudied={streak.total_days_studied}
        />
      )}

      {/* Phase + Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PhaseBadge phase={phase} weekNumber={week} />
        <div className="flex items-center gap-4 bg-surface rounded-xl border border-white/5 p-4">
          <ProgressRing
            progress={hasActivityToday ? 100 : 0}
            size={64}
            color={hasActivityToday ? '#22C55E' : '#3A3A3A'}
          >
            <span className="text-lg">
              {hasActivityToday ? '✓' : '○'}
            </span>
          </ProgressRing>
          <div>
            <p className="text-sm font-medium text-white">
              {hasActivityToday ? 'Studied today' : 'Not studied yet'}
            </p>
            <p className="text-xs text-gray-500">
              {vocabDue > 0
                ? `${vocabDue} words due for review`
                : 'No reviews due'}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Focus */}
      <Card>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
          Today&apos;s Focus
        </p>
        <p className="text-sm text-amber font-medium">{todayFocus}</p>
      </Card>

      {/* Quick Actions */}
      <QuickActions />

      {/* Countdown */}
      {profile && <Countdown targetDate={profile.target_date} />}

      {/* Recent Sessions */}
      {recentSessions.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {recentSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between bg-surface rounded-lg border border-white/5 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      session.session_type === 'conversation'
                        ? 'amber'
                        : session.session_type === 'vocabulary'
                        ? 'teal'
                        : 'gray'
                    }
                  >
                    {session.session_type}
                  </Badge>
                  <span className="text-sm text-gray-300 truncate max-w-[160px]">
                    {session.notes || 'No notes'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {session.duration_minutes}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
