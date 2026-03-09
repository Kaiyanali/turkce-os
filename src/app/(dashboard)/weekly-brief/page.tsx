'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { calculatePhase, calculateWeek, getPhaseInfo } from '@/lib/phase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeeklyBrief {
  grammar_focus: string;
  top_vocab: string[];
  recommended_scenario: string;
  youtube_search: string;
  motivational_tr: string;
  motivational_en: string;
}

export default function WeeklyBriefPage() {
  const [phase, setPhase] = useState(1);
  const [week, setWeek] = useState(1);
  const [userId, setUserId] = useState('');
  const [brief, setBrief] = useState<WeeklyBrief | null>(null);
  const [savedBrief, setSavedBrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', user.id)
        .single();

      if (profile) {
        const p = calculatePhase(profile.created_at);
        const w = calculateWeek(profile.created_at);
        setPhase(p);
        setWeek(w);

        // Check for existing brief
        const { data: goal } = await supabase
          .from('weekly_goals')
          .select('claude_weekly_prompt')
          .eq('user_id', user.id)
          .eq('week_number', w)
          .single();

        if (goal?.claude_weekly_prompt) {
          setSavedBrief(goal.claude_weekly_prompt);
          try {
            setBrief(JSON.parse(goal.claude_weekly_prompt));
          } catch {
            // ignore
          }
        }
      }
      setInitialLoading(false);
    };
    load();
  }, []);

  const generateBrief = async () => {
    setLoading(true);

    try {
      // Gather context
      const [vocabRes, convRes] = await Promise.all([
        supabase
          .from('vocabulary')
          .select('category')
          .eq('user_id', userId),
        supabase
          .from('conversations')
          .select('score')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const categories = [
        ...new Set(vocabRes.data?.map((v: { category: string }) => v.category) || []),
      ];
      const recentScores =
        convRes.data?.map((c: { score: number | null }) => c.score).filter(Boolean) || [];

      const res = await fetch('/api/claude/weekly-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week,
          phase,
          vocabCount: vocabRes.data?.length || 0,
          categories,
          recentScores,
          recentErrors: [],
        }),
      });
      const data = await res.json();
      setBrief(data);

      // Save to weekly_goals
      await supabase.from('weekly_goals').upsert({
        user_id: userId,
        week_number: week,
        phase,
        focus_topic: data.grammar_focus,
        claude_weekly_prompt: JSON.stringify(data),
      });
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const phaseInfo = getPhaseInfo(phase);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-amber border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          Haftalık Brief
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Week {week} of 22 — Phase {phase}: {phaseInfo.name}
        </p>
      </div>

      {!brief ? (
        <Card>
          <div className="text-center py-8">
            <span className="text-4xl block mb-4">📋</span>
            <h3 className="font-display text-lg text-white font-semibold">
              Weekly Brief
            </h3>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Get a personalized study plan for this week from Claude
            </p>
            <Button onClick={generateBrief} loading={loading}>
              {loading
                ? 'Claude is preparing your brief...'
                : 'Generate This Week\'s Brief'}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Grammar Focus */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <span>📚</span>
              <h3 className="text-sm font-medium text-white">Grammar Focus</h3>
            </div>
            <p className="text-sm text-gray-300">{brief.grammar_focus}</p>
          </Card>

          {/* Top Vocab */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <span>📝</span>
              <h3 className="text-sm font-medium text-white">
                Top 5 Vocabulary
              </h3>
            </div>
            <div className="space-y-1">
              {brief.top_vocab?.map((word, i) => (
                <div
                  key={i}
                  className="text-sm text-gray-300 bg-surface-light rounded px-3 py-1.5"
                >
                  {word}
                </div>
              ))}
            </div>
          </Card>

          {/* Scenario */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <span>💬</span>
              <h3 className="text-sm font-medium text-white">
                Recommended Scenario
              </h3>
            </div>
            <p className="text-sm text-gray-300">
              {brief.recommended_scenario}
            </p>
          </Card>

          {/* YouTube */}
          <Card>
            <div className="flex items-center gap-2 mb-2">
              <span>🎥</span>
              <h3 className="text-sm font-medium text-white">
                YouTube Search
              </h3>
            </div>
            <p className="text-sm text-amber">{brief.youtube_search}</p>
          </Card>

          {/* Motivational */}
          <div className="bg-amber/10 border border-amber/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <span>🇹🇷</span>
              <h3 className="text-sm font-medium text-amber">
                Motivational Message
              </h3>
            </div>
            <p className="text-lg font-display text-white font-semibold">
              {brief.motivational_tr}
            </p>
            <p className="text-sm text-gray-400 mt-1 italic">
              {brief.motivational_en}
            </p>
          </div>

          <Button
            variant="ghost"
            onClick={generateBrief}
            loading={loading}
            className="w-full"
          >
            Regenerate Brief
          </Button>
        </div>
      )}
    </div>
  );
}
