'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { calculatePhase } from '@/lib/phase';
import { GRAMMAR_TOPICS, GrammarTopic } from '@/lib/grammar-topics';
import { GrammarNote } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input, Textarea } from '@/components/ui/input';

export default function GrammarPage() {
  const [phase, setPhase] = useState(1);
  const [userId, setUserId] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);
  const [explanation, setExplanation] = useState<GrammarNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedNotes, setSavedNotes] = useState<Record<string, GrammarNote>>({});

  // Sentence correction
  const [sentence, setSentence] = useState('');
  const [correction, setCorrection] = useState<{
    corrected: string;
    explanation: string;
    grammar_rule: string;
  } | null>(null);
  const [correcting, setCorrecting] = useState(false);

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

      if (profile) setPhase(calculatePhase(profile.created_at));

      // Load saved grammar notes
      const { data: notes } = await supabase
        .from('grammar_notes')
        .select('*')
        .eq('user_id', user.id);

      if (notes) {
        const map: Record<string, GrammarNote> = {};
        notes.forEach((n: GrammarNote) => (map[n.topic] = n));
        setSavedNotes(map);
      }
    };
    load();
  }, []);

  const loadExplanation = async (topic: GrammarTopic) => {
    setSelectedTopic(topic);

    // Check if already saved
    if (savedNotes[topic.id]) {
      setExplanation(savedNotes[topic.id]);
      return;
    }

    setLoading(true);
    setExplanation(null);

    try {
      // Get user's vocabulary for context
      const { data: vocab } = await supabase
        .from('vocabulary')
        .select('turkish')
        .eq('user_id', userId)
        .limit(20);

      const userVocab = vocab?.map((v: { turkish: string }) => v.turkish) || [];

      const res = await fetch('/api/claude/grammar-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.title, userVocab }),
      });
      const data = await res.json();

      const note: GrammarNote = {
        id: '',
        user_id: userId,
        topic: topic.id,
        explanation: data.explanation,
        examples: data.examples,
        phase_introduced: topic.phase,
        created_at: new Date().toISOString(),
      };

      // Save to database
      await supabase.from('grammar_notes').insert({
        user_id: userId,
        topic: topic.id,
        explanation: data.explanation,
        examples: data.examples,
        phase_introduced: topic.phase,
      });

      setExplanation(note);
      setSavedNotes((prev) => ({ ...prev, [topic.id]: note }));
    } catch {
      // ignore
    }
    setLoading(false);
  };

  const handleCorrectSentence = async () => {
    if (!sentence.trim()) return;
    setCorrecting(true);
    setCorrection(null);

    try {
      const res = await fetch('/api/claude/correct-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence }),
      });
      const data = await res.json();
      setCorrection(data);
    } catch {
      // ignore
    }
    setCorrecting(false);
  };

  const phaseTopics = (p: number) =>
    GRAMMAR_TOPICS.filter((t) => t.phase === p);

  if (selectedTopic) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button
          onClick={() => {
            setSelectedTopic(null);
            setExplanation(null);
          }}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to topics
        </button>

        <div>
          <Badge variant={selectedTopic.phase === 1 ? 'amber' : selectedTopic.phase === 2 ? 'teal' : 'purple'}>
            Phase {selectedTopic.phase}
          </Badge>
          <h1 className="font-display text-2xl font-bold text-white mt-2">
            {selectedTopic.title}
          </h1>
          <p className="text-sm text-gray-400">{selectedTopic.titleTr}</p>
        </div>

        {loading ? (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-amber border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                Claude is preparing your lesson...
              </p>
            </div>
          </Card>
        ) : explanation ? (
          <>
            <Card>
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {explanation.explanation}
                </div>
              </div>
            </Card>

            {explanation.examples.length > 0 && (
              <Card>
                <h3 className="text-sm font-medium text-white mb-3">
                  Examples
                </h3>
                <div className="space-y-2">
                  {explanation.examples.map((ex, i) => (
                    <div
                      key={i}
                      className="bg-surface-light rounded-lg px-4 py-2 text-sm text-gray-300"
                    >
                      {ex}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-white">
        Dilbilgisi
      </h1>

      {[1, 2, 3].map((p) => (
        <div key={p}>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant={p === 1 ? 'amber' : p === 2 ? 'teal' : 'purple'}>
              Phase {p}
            </Badge>
            <span className="text-sm text-gray-500">
              {p === 1 ? 'Foundation' : p === 2 ? 'Building' : 'Fluency'}
            </span>
          </div>
          <div className="space-y-2">
            {phaseTopics(p).map((topic) => {
              const locked = topic.phase > phase;
              const hasSaved = !!savedNotes[topic.id];
              return (
                <button
                  key={topic.id}
                  onClick={() => !locked && loadExplanation(topic)}
                  disabled={locked}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-colors ${
                    locked
                      ? 'bg-surface/50 border-white/5 opacity-40 cursor-not-allowed'
                      : 'bg-surface border-white/5 hover:border-amber/30'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-gray-500">{topic.description}</p>
                  </div>
                  {locked ? (
                    <span className="text-gray-600">🔒</span>
                  ) : hasSaved ? (
                    <span className="text-green-500 text-xs">✓ Saved</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Sentence Correction */}
      {phase >= 2 && (
        <div className="pt-4 border-t border-white/5">
          <h2 className="font-display text-lg font-bold text-white mb-3">
            Explain My Mistake
          </h2>
          <Card>
            <div className="space-y-3">
              <Textarea
                placeholder="Paste a Turkish sentence to check..."
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                rows={2}
              />
              <Button
                onClick={handleCorrectSentence}
                loading={correcting}
                className="w-full"
              >
                Check
              </Button>

              {correction && (
                <div className="space-y-3 animate-fade-in">
                  <div className="bg-green-500/10 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Corrected:</p>
                    <p className="text-sm text-green-400 font-medium">
                      {correction.corrected}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">
                      {correction.explanation}
                    </p>
                  </div>
                  {correction.grammar_rule && (
                    <div className="bg-teal/10 rounded-lg p-3">
                      <p className="text-xs text-teal-light font-medium">
                        Grammar Rule: {correction.grammar_rule}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
