import { anthropic, MODEL, DEFAULT_MAX_TOKENS } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { english } = await request.json();

    if (!english) {
      return Response.json({ error: 'English word required' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: 'You are a Turkish language expert. Respond ONLY with valid JSON, no markdown.',
      messages: [
        {
          role: 'user',
          content: `Translate this English word/phrase to Turkish and provide context. Return JSON in this exact format:
{"turkish":"the Turkish translation","example_sentence":"an example Turkish sentence using the word","example_translation":"English translation of the example","related":[{"turkish":"related word 1 in Turkish","english":"English meaning"},{"turkish":"related word 2 in Turkish","english":"English meaning"}]}

Word: "${english}"`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return Response.json(data);
    }

    return Response.json({
      turkish: text.trim(),
      example_sentence: '',
      example_translation: '',
      related: [],
    });
  } catch (error) {
    console.error('Vocabulary suggest error:', error);
    return Response.json(
      { error: 'Failed to suggest vocabulary' },
      { status: 500 }
    );
  }
}
