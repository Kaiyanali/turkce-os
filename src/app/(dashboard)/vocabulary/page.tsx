'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { calculateSM2 } from '@/lib/spaced-repetition';
import { VocabularyWord, SM2Rating } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Flashcard } from '@/components/vocabulary/flashcard';

type Tab = 'review' | 'add' | 'all';

export default function VocabularyPage() {
  const [tab, setTab] = useState<Tab>('review');
  const [allWords, setAllWords] = useState<VocabularyWord[]>([]);
  const [dueWords, setDueWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add mode state
  const [addMode, setAddMode] = useState<'manual' | 'ai'>('manual');
  const [newTurkish, setNewTurkish] = useState('');
  const [newEnglish, setNewEnglish] = useState('');
  const [newCategory, setNewCategory] = useState('phrases');
  const [aiInput, setAiInput] = useState('');
  const [aiResult, setAiResult] = useState<{
    turkish: string;
    example_sentence: string;
    example_translation: string;
    related: { turkish: string; english: string }[];
  } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState('');

  const supabase = createClient();

  const loadWords = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const [allRes, dueRes] = await Promise.all([
      supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('vocabulary')
        .select('*')
        .eq('user_id', user.id)
        .lte('next_review', today)
        .order('ease_factor', { ascending: true }),
    ]);

    if (allRes.data) setAllWords(allRes.data);
    if (dueRes.data) setDueWords(dueRes.data);
  };

  useEffect(() => {
    loadWords();
  }, []);

  const handleRate = async (rating: SM2Rating) => {
    const word = dueWords[currentIndex];
    if (!word) return;

    const result = calculateSM2(
      rating,
      word.ease_factor,
      word.interval_days,
      word.repetitions
    );

    await supabase
      .from('vocabulary')
      .update({
        ease_factor: result.ease_factor,
        interval_days: result.interval_days,
        repetitions: result.repetitions,
        next_review: result.next_review,
        last_reviewed: new Date().toISOString(),
      })
      .eq('id', word.id);

    setReviewed((r) => r + 1);
    setFlipped(false);

    if (currentIndex < dueWords.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(dueWords.length); // done
    }

    // Update streak
    fetch('/api/streak', { method: 'POST' });
  };

  const handleAddWord = async () => {
    if (!newTurkish || !newEnglish) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('vocabulary').insert({
      user_id: user.id,
      turkish: newTurkish,
      english: newEnglish,
      category: newCategory,
      next_review: new Date().toISOString().split('T')[0],
    });

    setNewTurkish('');
    setNewEnglish('');
    setAddSuccess(`Added "${newTurkish}"`);
    setTimeout(() => setAddSuccess(''), 2000);
    loadWords();
  };

  const handleAiSuggest = async () => {
    if (!aiInput) return;
    setAiLoading(true);
    setAiResult(null);

    try {
      const res = await fetch('/api/claude/vocabulary-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ english: aiInput }),
      });
      const data = await res.json();
      setAiResult(data);
      setNewTurkish(data.turkish);
      setNewEnglish(aiInput);
    } catch {
      // ignore
    }
    setAiLoading(false);
  };

  const handleAddRelated = async (word: { turkish: string; english: string }) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('vocabulary').insert({
      user_id: user.id,
      turkish: word.turkish,
      english: word.english,
      category: newCategory,
      next_review: new Date().toISOString().split('T')[0],
    });

    setAddSuccess(`Added "${word.turkish}"`);
    setTimeout(() => setAddSuccess(''), 2000);
    loadWords();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('vocabulary').delete().eq('id', id);
    loadWords();
  };

  const categories = ['all', 'greetings', 'food', 'drinks', 'numbers', 'phrases', 'activities', 'grammar'];
  const filteredWords = allWords.filter((w) => {
    const matchesCategory = filterCategory === 'all' || w.category === filterCategory;
    const matchesSearch =
      !searchQuery ||
      w.turkish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.english.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-display text-2xl font-bold text-white">
        Kelimeler
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-lg p-1">
        {(['review', 'add', 'all'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-amber text-black'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {t === 'review'
              ? `Review (${dueWords.length})`
              : t === 'add'
              ? 'Add'
              : `All (${allWords.length})`}
          </button>
        ))}
      </div>

      {/* Review Tab */}
      {tab === 'review' && (
        <div>
          {dueWords.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">🎉</span>
                <h3 className="font-display text-lg text-white font-semibold">
                  All caught up!
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  No words due for review. Come back tomorrow.
                </p>
              </div>
            </Card>
          ) : currentIndex >= dueWords.length ? (
            <Card>
              <div className="text-center py-8">
                <span className="text-4xl block mb-3">✅</span>
                <h3 className="font-display text-lg text-white font-semibold">
                  Session complete!
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  You reviewed {reviewed} words
                </p>
                <Button
                  onClick={() => {
                    setCurrentIndex(0);
                    setReviewed(0);
                    loadWords();
                  }}
                  className="mt-4"
                >
                  Start Over
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <div className="text-center text-sm text-gray-500 mb-4">
                {currentIndex + 1} of {dueWords.length}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-light rounded-full h-1.5 mb-6">
                <div
                  className="bg-amber rounded-full h-1.5 transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / dueWords.length) * 100}%`,
                  }}
                />
              </div>

              <Flashcard
                word={dueWords[currentIndex]}
                flipped={flipped}
                onFlip={() => setFlipped((f) => !f)}
              />

              {flipped && (
                <div className="grid grid-cols-4 gap-2 mt-6 animate-fade-in">
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => handleRate(0)}
                    className="text-xs"
                  >
                    Again
                  </Button>
                  <button
                    onClick={() => handleRate(2)}
                    className="bg-orange-600/20 text-orange-400 rounded-lg py-3 text-xs font-medium hover:bg-orange-600/30 transition-colors"
                  >
                    Hard
                  </button>
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => handleRate(3)}
                    className="text-xs"
                  >
                    Good
                  </Button>
                  <button
                    onClick={() => handleRate(5)}
                    className="bg-green-600/20 text-green-400 rounded-lg py-3 text-xs font-medium hover:bg-green-600/30 transition-colors"
                  >
                    Easy
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Add Tab */}
      {tab === 'add' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setAddMode('manual')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                addMode === 'manual'
                  ? 'bg-amber/20 text-amber'
                  : 'text-gray-400'
              }`}
            >
              Manual
            </button>
            <button
              onClick={() => setAddMode('ai')}
              className={`px-3 py-1.5 rounded-lg text-sm ${
                addMode === 'ai' ? 'bg-amber/20 text-amber' : 'text-gray-400'
              }`}
            >
              AI Translate
            </button>
          </div>

          {addMode === 'manual' ? (
            <Card>
              <div className="space-y-3">
                <Input
                  label="Turkish"
                  placeholder="Merhaba"
                  value={newTurkish}
                  onChange={(e) => setNewTurkish(e.target.value)}
                />
                <Input
                  label="English"
                  placeholder="Hello"
                  value={newEnglish}
                  onChange={(e) => setNewEnglish(e.target.value)}
                />
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-light border border-white/10 rounded-lg px-4 py-2.5 text-white"
                  >
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="greetings">Greetings</option>
                    <option value="numbers">Numbers</option>
                    <option value="phrases">Phrases</option>
                    <option value="activities">Activities</option>
                    <option value="grammar">Grammar</option>
                  </select>
                </div>
                <Button onClick={handleAddWord} className="w-full">
                  Add Word
                </Button>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="space-y-3">
                <Input
                  label="English word or phrase"
                  placeholder="beautiful"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <Button
                  onClick={handleAiSuggest}
                  loading={aiLoading}
                  className="w-full"
                >
                  Translate
                </Button>

                {aiResult && (
                  <div className="space-y-3 mt-4 animate-fade-in">
                    <div className="bg-surface-light rounded-lg p-4">
                      <p className="text-lg font-display font-bold text-amber">
                        {aiResult.turkish}
                      </p>
                      <p className="text-sm text-gray-400 mt-2 italic">
                        &ldquo;{aiResult.example_sentence}&rdquo;
                      </p>
                      <p className="text-xs text-gray-500">
                        {aiResult.example_translation}
                      </p>
                    </div>
                    <Button onClick={handleAddWord} className="w-full">
                      Add &ldquo;{aiResult.turkish}&rdquo;
                    </Button>

                    {aiResult.related.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">
                          Related words:
                        </p>
                        {aiResult.related.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => handleAddRelated(r)}
                            className="flex items-center justify-between w-full bg-surface rounded-lg px-3 py-2 mb-1 hover:bg-surface-light transition-colors"
                          >
                            <span className="text-sm text-white">
                              {r.turkish}{' '}
                              <span className="text-gray-500">
                                — {r.english}
                              </span>
                            </span>
                            <span className="text-xs text-amber">+ Add</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {addSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 text-sm text-green-400 animate-fade-in">
              {addSuccess}
            </div>
          )}
        </div>
      )}

      {/* All Words Tab */}
      {tab === 'all' && (
        <div className="space-y-4">
          <Input
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-amber text-black'
                    : 'bg-surface-light text-gray-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between bg-surface rounded-lg border border-white/5 px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {word.turkish}
                    </span>
                    <Badge
                      variant={
                        word.ease_factor > 3
                          ? 'green'
                          : word.ease_factor < 1.8
                          ? 'red'
                          : 'amber'
                      }
                    >
                      {word.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">{word.english}</p>
                </div>
                <button
                  onClick={() => handleDelete(word.id)}
                  className="text-gray-600 hover:text-red-400 ml-2 text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
