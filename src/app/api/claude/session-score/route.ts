import { anthropic, MODEL, EXTENDED_MAX_TOKENS } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, scenario } = await request.json();

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: EXTENDED_MAX_TOKENS,
      system:
        'You are a Turkish language teacher scoring a student conversation. Respond with JSON only, no markdown.',
      messages: [
        {
          role: 'user',
          content: `Score this Turkish conversation practice (scenario: ${scenario}).

Conversation:
${conversationText}

Return JSON in this exact format:
{"score":7,"errors":["Error 1 explanation","Error 2 explanation","Error 3 explanation"],"grammar_tip":"One specific grammar rule to study based on the errors","summary":"A brief encouraging summary of how the student did"}

Score 1-10 where: 1-3 = many errors, limited Turkish, 4-6 = some errors but communicating, 7-8 = good with minor errors, 9-10 = excellent near-native.`,
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
      score: 5,
      errors: ['Could not parse detailed errors'],
      grammar_tip: 'Keep practicing!',
      summary: text,
    });
  } catch (error) {
    console.error('Session score error:', error);
    return Response.json(
      { error: 'Failed to score session' },
      { status: 500 }
    );
  }
}
