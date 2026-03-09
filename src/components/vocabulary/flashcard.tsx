'use client';

import { VocabularyWord } from '@/types';
import { Badge } from '@/components/ui/badge';

interface FlashcardProps {
  word: VocabularyWord;
  flipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ word, flipped, onFlip }: FlashcardProps) {
  return (
    <div
      className="flashcard-container w-full max-w-sm mx-auto cursor-pointer"
      style={{ height: '240px' }}
      onClick={onFlip}
    >
      <div className={`flashcard-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front — Turkish */}
        <div className="flashcard-front bg-surface border border-white/10 flex flex-col items-center justify-center p-6">
          <Badge variant="amber" className="mb-4">
            {word.category}
          </Badge>
          <h2 className="font-display text-3xl font-bold text-white text-center">
            {word.turkish}
          </h2>
          <p className="text-sm text-gray-500 mt-4">Tap to reveal</p>
        </div>

        {/* Back — English */}
        <div className="flashcard-back bg-surface-light border border-amber/20 flex flex-col items-center justify-center p-6">
          <p className="text-sm text-gray-400 mb-2">English</p>
          <h2 className="font-display text-2xl font-bold text-amber text-center">
            {word.english}
          </h2>
          <p className="text-sm text-gray-500 mt-4">
            {word.turkish}
          </p>
        </div>
      </div>
    </div>
  );
}
