'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { StudySession } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/input';

const SESSION_TYPES = ['listening', 'reading', 'speaking', 'vocabulary', 'grammar'] as const;
const PRESETS = [15, 30, 45, 60];

export default function SessionPage() {
  const [type, setType] = useState<string>('listening');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);

  const supabase = createClient();

  const loadSessions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setRecentSessions(data);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('study_sessions').insert({
      user_id: user.id,
      session_type: type,
      duration_minutes: duration,
      notes: notes || null,
    });

    await fetch('/api/streak', { method: 'POST' });

    setSuccess(true);
    setNotes('');
    setDuration(30);
    loadSessions();
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-white">
        Oturum Kaydet
      </h1>

      <Card>
        <div className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                    type === t
                      ? 'bg-amber text-black font-medium'
                      : 'bg-surface-light text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Duration (minutes)
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDuration(Math.max(5, duration - 5))}
                className="w-10 h-10 rounded-lg bg-surface-light text-white hover:bg-surface flex items-center justify-center text-lg"
              >
                −
              </button>
              <span className="text-2xl font-bold text-white w-16 text-center">
                {duration}
              </span>
              <button
                onClick={() => setDuration(duration + 5)}
                className="w-10 h-10 rounded-lg bg-surface-light text-white hover:bg-surface flex items-center justify-center text-lg"
              >
                +
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => setDuration(p)}
                  className={`px-3 py-1 rounded text-xs ${
                    duration === p
                      ? 'bg-amber/20 text-amber'
                      : 'bg-surface-light text-gray-500'
                  }`}
                >
                  {p}m
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <Textarea
            label="Notes (optional)"
            placeholder="What did you study? YouTube, podcast, textbook..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />

          <Button onClick={handleSubmit} loading={loading} className="w-full">
            Log Session
          </Button>
        </div>
      </Card>

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-center animate-fade-in">
          <p className="text-sm text-green-400 font-medium">
            Session logged! +15 XP
          </p>
        </div>
      )}

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
                className="bg-surface rounded-lg border border-white/5 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="amber">{session.session_type}</Badge>
                    <span className="text-xs text-gray-500">
                      {session.duration_minutes}m
                    </span>
                  </div>
                  <span className="text-xs text-gray-600">
                    {new Date(session.created_at).toLocaleDateString()}
                  </span>
                </div>
                {session.notes && (
                  <p className="text-sm text-gray-400 mt-1 truncate">
                    {session.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
