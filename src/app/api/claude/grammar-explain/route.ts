import { anthropic, MODEL, EXTENDED_MAX_TOKENS } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic, userVocab } = await request.json();

    if (!topic) {
      return Response.json({ error: 'Topic required' }, { status: 400 });
    }

    const vocabContext =
      userVocab && userVocab.length > 0
        ? `The student already knows these Turkish words: ${userVocab.join(', ')}. Use these words in your examples where possible.`
        : '';

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: EXTENDED_MAX_TOKENS,
      system:
        'You are a Turkish language teacher explaining grammar to an English speaker. Be clear, use simple language, and always provide examples. Respond with JSON only, no markdown.',
      messages: [
        {
          role: 'user',
          content: `Explain this Turkish grammar topic: "${topic}"

${vocabContext}

Return JSON in this exact format:
{"explanation":"A clear explanation of the grammar rule in 2-4 paragraphs","examples":["Example 1 in Turkish — English translation","Example 2 in Turkish — English translation","Example 3 in Turkish — English translation","Example 4 in Turkish — English translation","Example 5 in Turkish — English translation"]}`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      return Response.json(data);
    }

    return Response.json({
      explanation: text,
      examples: [],
    });
  } catch (error) {
    console.error('Grammar explain error:', error);
    return Response.json(
      { error: 'Failed to explain grammar' },
      { status: 500 }
    );
  }
}
