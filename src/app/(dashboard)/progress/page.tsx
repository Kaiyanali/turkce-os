'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { calculatePhase, calculateWeek, daysUntilTarget } from '@/lib/phase';
import { calculateXP, getLevel } from '@/lib/streak';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DayActivity {
  date: string;
  count: number;
}

export default function ProgressPage() {
  const [phase, setPhase] = useState(1);
  const [week, setWeek] = useState(1);
  const [targetDate, setTargetDate] = useState('2025-08-07');
  const [totalVocab, setTotalVocab] = useState(0);
  const [vocabByCategory, setVocabByCategory] = useState<Record<string, number>>({});
  const [masteredCount, setMasteredCount] = useState(0);
  const [strugglingCount, setStrugglingCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [sessionsByType, setSessionsByType] = useState<Record<string, number>>({});
  const [heatmapData, setHeatmapData] = useState<DayActivity[]>([]);
  const [conversationCount, setConversationCount] = useState(0);
  const [xp, setXp] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        setPhase(calculatePhase(profile.created_at));
        setWeek(calculateWeek(profile.created_at));
        setTargetDate(profile.target_date);
      }

      // Vocab stats
      const { data: vocab } = await supabase
        .from('vocabulary')
        .select('category, ease_factor')
        .eq('user_id', user.id);

      if (vocab) {
        setTotalVocab(vocab.length);
        const cats: Record<string, number> = {};
        let mastered = 0;
        let struggling = 0;
        vocab.forEach((v: { category: string; ease_factor: number }) => {
          cats[v.category] = (cats[v.category] || 0) + 1;
          if (v.ease_factor > 3) mastered++;
          if (v.ease_factor < 1.8) struggling++;
        });
        setVocabByCategory(cats);
        setMasteredCount(mastered);
        setStrugglingCount(struggling);
      }

      // Session stats
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select('session_type, duration_minutes, date')
        .eq('user_id', user.id);

      if (sessions) {
        setTotalSessions(sessions.length);
        let mins = 0;
        const types: Record<string, number> = {};
        const dateMap: Record<string, number> = {};
        sessions.forEach((s: { session_type: string; duration_minutes: number; date: string }) => {
          mins += s.duration_minutes;
          types[s.session_type] = (types[s.session_type] || 0) + 1;
          dateMap[s.date] = (dateMap[s.date] || 0) + 1;
        });
        setTotalMinutes(mins);
        setSessionsByType(types);
        setHeatmapData(
          Object.entries(dateMap).map(([date, count]) => ({ date, count }))
        );
      }

      // Conversation count
      const { count: convCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      setConversationCount(convCount || 0);

      // XP calculation
      const reviewedCount = vocab?.filter((v: { ease_factor: number }) => v.ease_factor !== 2.5).length || 0;
      setXp(
        calculateXP({
          vocabReviewed: reviewedCount,
          conversationsCompleted: convCount || 0,
          sessionsLogged: sessions?.length || 0,
        })
      );
    };
    load();
  }, []);

  const level = getLevel(xp);
  const xpProgress =
    level.nextXP === Infinity
      ? 100
      : ((xp - level.minXP) / (level.nextXP - level.minXP)) * 100;

  const maxCatCount = Math.max(...Object.values(vocabByCategory), 1);
  const typeColors: Record<string, string> = {
    vocabulary: 'bg-amber',
    conversation: 'bg-teal',
    grammar: 'bg-purple-500',
    listening: 'bg-blue-500',
    speaking: 'bg-green-500',
  };

  // Build heatmap grid (last 12 weeks)
  const today = new Date();
  const heatmapDays: { date: string; count: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const activity = heatmapData.find((h) => h.date === dateStr);
    heatmapDays.push({ date: dateStr, count: activity?.count || 0 });
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-white">İlerleme</h1>

      {/* XP & Level */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500">Level</p>
            <p className="font-display text-lg font-bold text-amber">
              {level.titleTr}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{xp}</p>
            <p className="text-xs text-gray-500">XP</p>
          </div>
        </div>
        <div className="w-full bg-surface-light rounded-full h-2">
          <div
            className="bg-amber rounded-full h-2 transition-all duration-700"
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        {level.nextXP !== Infinity && (
          <p className="text-xs text-gray-500 mt-1">
            {level.nextXP - xp} XP to next level
          </p>
        )}
      </Card>

      {/* Phase Timeline */}
      <Card>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Phase Progress
        </p>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((p) => (
            <div key={p} className="flex-1">
              <div
                className={`h-2 rounded-full ${
                  p < phase
                    ? 'bg-amber'
                    : p === phase
                    ? 'bg-amber/50'
                    : 'bg-surface-light'
                }`}
              />
              <p
                className={`text-xs mt-1 ${
                  p === phase ? 'text-amber' : 'text-gray-500'
                }`}
              >
                Phase {p}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Week {week} of 22 — {daysUntilTarget(targetDate)} days remaining
        </p>
      </Card>

      {/* Heatmap */}
      <Card>
        <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">
          Study Calendar
        </p>
        <div className="grid grid-cols-12 gap-1">
          {heatmapDays.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} sessions`}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor:
                  day.count === 0
                    ? '#1A1A1A'
                    : day.count === 1
                    ? 'rgba(212,168,67,0.3)'
                    : day.count === 2
                    ? 'rgba(212,168,67,0.6)'
                    : 'rgba(212,168,67,0.9)',
              }}
            />
          ))}
        </div>
      </Card>

      {/* Vocab Stats */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Vocabulary
          </p>
          <p className="text-lg font-bold text-white">{totalVocab} words</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-500/10 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-green-400">{masteredCount}</p>
            <p className="text-xs text-gray-500">Mastered</p>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-red-400">{strugglingCount}</p>
            <p className="text-xs text-gray-500">Struggling</p>
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(vocabByCategory).map(([cat, count]) => (
            <div key={cat} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-20 truncate">{cat}</span>
              <div className="flex-1 bg-surface-light rounded-full h-2">
                <div
                  className="bg-amber rounded-full h-2"
                  style={{ width: `${(count / maxCatCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-6 text-right">
                {count}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Session Stats */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-gray-500">
            Sessions
          </p>
          <p className="text-lg font-bold text-white">{totalSessions}</p>
        </div>
        <p className="text-sm text-gray-400 mb-3">
          {totalMinutes} total minutes ({Math.round(totalMinutes / 60)}h)
        </p>
        <div className="flex gap-1 h-4 rounded-full overflow-hidden">
          {Object.entries(sessionsByType).map(([type, count]) => (
            <div
              key={type}
              className={`${typeColors[type] || 'bg-gray-500'}`}
              style={{
                width: `${(count / Math.max(totalSessions, 1)) * 100}%`,
              }}
              title={`${type}: ${count}`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {Object.entries(sessionsByType).map(([type, count]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${typeColors[type] || 'bg-gray-500'}`}
              />
              <span className="text-xs text-gray-500">
                {type}: {count}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Countdown */}
      <div className="rounded-xl bg-amber/10 border border-amber/20 p-6 text-center">
        <p className="text-5xl font-display font-bold text-amber">
          {daysUntilTarget(targetDate)}
        </p>
        <p className="text-sm text-gray-400 mt-2">days until your goal</p>
        <p className="text-xs text-amber mt-1">Sen yapabilirsin! — You can do this!</p>
      </div>
    </div>
  );
}
