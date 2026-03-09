'use client';

import { useState } from 'react';
import { ChatMessage } from '@/types';

interface ChatBubbleProps {
  message: ChatMessage;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const [translation, setTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const isUser = message.role === 'user';

  if (message.role === 'system') {
    return (
      <div className="text-center py-3">
        <p className="text-sm text-gray-500 italic">{message.content}</p>
      </div>
    );
  }

  // Extract the Turkish part (before any ✏️ correction)
  const turkishPart = message.content.split('✏️')[0].trim();

  const handleTranslate = async () => {
    if (translation) {
      setTranslation(null);
      return;
    }

    setTranslating(true);
    try {
      const res = await fetch('/api/claude/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: turkishPart }),
      });
      const data = await res.json();
      setTranslation(data.translation);
    } catch {
      setTranslation('Translation failed');
    }
    setTranslating(false);
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
    >
      <div className="max-w-[85%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-amber-dim text-white rounded-br-md'
              : 'bg-surface text-gray-200 rounded-bl-md'
          }`}
        >
          {!isUser && message.content.includes('✏️') ? (
            <>
              {message.content.split('✏️').map((part, i) =>
                i === 0 ? (
                  <p key={i} className="text-sm leading-relaxed">
                    {part}
                  </p>
                ) : (
                  <div
                    key={i}
                    className="mt-2 pt-2 border-t border-teal/30 text-sm"
                  >
                    <span className="text-teal-light">✏️{part}</span>
                  </div>
                )
              )}
            </>
          ) : (
            <p className="text-sm leading-relaxed">{message.content}</p>
          )}
        </div>

        {/* Translation toggle */}
        {turkishPart.length > 0 && (
          <div className={`mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="text-[10px] text-gray-500 hover:text-amber transition-colors px-1"
            >
              {translating
                ? '...'
                : translation
                ? 'Hide translation'
                : '🔄 Translate'}
            </button>
            {translation && (
              <p
                className={`text-xs text-gray-400 italic mt-0.5 px-1 animate-fade-in ${
                  isUser ? 'text-right' : 'text-left'
                }`}
              >
                {translation}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
