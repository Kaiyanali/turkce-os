'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { calculatePhase, calculateWeek } from '@/lib/phase';
import { SCENARIOS } from '@/lib/scenarios';
import { ChatMessage, ConversationScenario } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChatBubble } from '@/components/conversation/chat-bubble';

export default function ConversationPage() {
  const [phase, setPhase] = useState(1);
  const [week, setWeek] = useState(1);
  const [userId, setUserId] = useState('');
  const [selectedScenario, setSelectedScenario] =
    useState<ConversationScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [score, setScore] = useState<{
    score: number;
    errors: string[];
    grammar_tip: string;
    summary: string;
  } | null>(null);
  const [scoringLoading, setScoringLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
        setPhase(calculatePhase(profile.created_at));
        setWeek(calculateWeek(profile.created_at));
      }
    };
    load();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startScenario = async (scenario: ConversationScenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setSessionEnded(false);
    setScore(null);

    // Get initial greeting from Claude
    setStreaming(true);
    try {
      const res = await fetch('/api/claude/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [],
          scenario: scenario.system_prompt,
          week,
          phase,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullText += chunk;
          setMessages([{ role: 'assistant', content: fullText }]);
        }
      }
    } catch {
      setMessages([
        {
          role: 'assistant',
          content: 'Merhaba! Hoş geldiniz. Bugün size nasıl yardımcı olabilirim?',
        },
      ]);
    }
    setStreaming(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || streaming || !selectedScenario) return;

    const userMessage: ChatMessage = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setStreaming(true);

    try {
      const res = await fetch('/api/claude/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          scenario: selectedScenario.system_prompt,
          week,
          phase,
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          fullText += chunk;
          setMessages([
            ...updatedMessages,
            { role: 'assistant', content: fullText },
          ]);
        }
      }
    } catch {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Üzgünüm, bir hata oluştu. Tekrar deneyin.',
        },
      ]);
    }
    setStreaming(false);
  };

  const endSession = async () => {
    setScoringLoading(true);
    setSessionEnded(true);

    try {
      const res = await fetch('/api/claude/session-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          scenario: selectedScenario?.id || '',
        }),
      });
      const data = await res.json();
      setScore(data);

      // Save conversation
      await supabase.from('conversations').insert({
        user_id: userId,
        scenario: selectedScenario?.id,
        messages,
        score: data.score,
        errors_count: data.errors?.length || 0,
      });

      // Update streak
      await fetch('/api/streak', { method: 'POST' });
    } catch {
      setScore({
        score: 0,
        errors: ['Could not score session'],
        grammar_tip: '',
        summary: 'Session saved.',
      });
    }
    setScoringLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Scenario selection
  if (!selectedScenario) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Konuşma Pratiği
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Choose a scenario to practice
          </p>
        </div>

        <div className="grid gap-3">
          {SCENARIOS.map((scenario) => {
            const locked = scenario.phase_required > phase;
            return (
              <button
                key={scenario.id}
                onClick={() => !locked && startScenario(scenario)}
                disabled={locked}
                className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-colors ${
                  locked
                    ? 'bg-surface/50 border-white/5 opacity-50 cursor-not-allowed'
                    : 'bg-surface border-white/5 hover:border-amber/30 cursor-pointer'
                }`}
              >
                <span className="text-3xl">{locked ? '🔒' : scenario.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-white">{scenario.name}</h3>
                    <span className="text-xs text-gray-500">
                      {scenario.nametr}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{scenario.description}</p>
                  {locked && (
                    <p className="text-xs text-amber mt-1">
                      Unlocks in Phase {scenario.phase_required}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Session score
  if (sessionEnded) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="font-display text-2xl font-bold text-white">
          Session Complete
        </h1>

        {scoringLoading ? (
          <Card>
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-amber border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm text-gray-400">
                Claude is reviewing your conversation...
              </p>
            </div>
          </Card>
        ) : score ? (
          <>
            <Card>
              <div className="text-center">
                <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Score
                </p>
                <p
                  className={`text-5xl font-display font-bold ${
                    score.score >= 7
                      ? 'text-green-400'
                      : score.score >= 4
                      ? 'text-amber'
                      : 'text-red-400'
                  }`}
                >
                  {score.score}/10
                </p>
              </div>
            </Card>

            {score.errors.length > 0 && (
              <Card>
                <h3 className="text-sm font-medium text-white mb-3">
                  Top Errors
                </h3>
                <ul className="space-y-2">
                  {score.errors.map((err, i) => (
                    <li key={i} className="text-sm text-gray-300 flex gap-2">
                      <span className="text-red-400">•</span>
                      {err}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {score.grammar_tip && (
              <Card>
                <h3 className="text-sm font-medium text-white mb-2">
                  Grammar Tip
                </h3>
                <p className="text-sm text-teal-light">{score.grammar_tip}</p>
              </Card>
            )}

            <Button
              onClick={() => {
                setSelectedScenario(null);
                setSessionEnded(false);
              }}
              className="w-full"
            >
              Back to Scenarios
            </Button>
          </>
        ) : null}
      </div>
    );
  }

  // Active conversation
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{selectedScenario.icon}</span>
          <h1 className="font-display text-lg font-bold text-white">
            {selectedScenario.nametr}
          </h1>
        </div>
        <Button variant="danger" size="sm" onClick={endSession}>
          End Session
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.map((msg, i) => (
          <ChatBubble key={i} message={msg} />
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className="bg-surface rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <span
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <span
                  className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-3 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Türkçe yaz..."
            disabled={streaming}
            className="flex-1 bg-surface-light border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber/50 disabled:opacity-50"
          />
          <Button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            size="lg"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
