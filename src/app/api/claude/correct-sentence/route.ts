import { anthropic, MODEL, DEFAULT_MAX_TOKENS } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { sentence } = await request.json();

    if (!sentence) {
      return Response.json({ error: 'Sentence required' }, { status: 400 });
    }

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system:
        'You are a Turkish language teacher correcting student sentences. Respond with JSON only, no markdown.',
      messages: [
        {
          role: 'user',
          content: `Correct this Turkish sentence and explain any errors:

"${sentence}"

Return JSON:
{"corrected":"The corrected Turkish sentence","explanation":"Clear explanation of what was wrong and why, in English","grammar_rule":"The specific grammar rule that applies"}

If the sentence is already correct, set corrected to the same sentence and explanation to "Your Turkish is correct! Well done."`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return Response.json(JSON.parse(jsonMatch[0]));
    }

    return Response.json({
      corrected: sentence,
      explanation: text,
      grammar_rule: '',
    });
  } catch (error) {
    console.error('Correct sentence error:', error);
    return Response.json(
      { error: 'Failed to correct sentence' },
      { status: 500 }
    );
  }
}
