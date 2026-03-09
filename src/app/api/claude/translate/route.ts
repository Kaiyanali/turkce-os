import { anthropic, MODEL } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return Response.json({ error: 'Text required' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 256,
      system:
        'You are a Turkish-English translator. Translate the given Turkish text to natural English. Return ONLY the English translation, nothing else. No quotes, no explanation.',
      messages: [
        {
          role: 'user',
          content: text,
        },
      ],
    });

    const translation =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    return Response.json({ translation });
  } catch (error) {
    console.error('Translate error:', error);
    return Response.json(
      { error: 'Failed to translate' },
      { status: 500 }
    );
  }
}
