import { anthropic, MODEL, EXTENDED_MAX_TOKENS } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { week, phase, vocabCount, categories, recentScores, recentErrors } =
      await request.json();

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: EXTENDED_MAX_TOKENS,
      system:
        'You are a Turkish language learning coach creating a personalized weekly study plan. Respond with JSON only, no markdown.',
      messages: [
        {
          role: 'user',
          content: `Create a weekly study brief for a Turkish learner.

Context:
- Week ${week} of 22 (targeting A2 by August)
- Phase ${phase} (1=Foundation, 2=Building, 3=Fluency)
- Vocabulary count: ${vocabCount} words
- Categories studied: ${categories?.join(', ') || 'none yet'}
- Recent conversation scores: ${recentScores?.join(', ') || 'none yet'}
- Recent errors: ${recentErrors?.join('; ') || 'none yet'}

Return JSON:
{"grammar_focus":"The specific grammar topic to study this week","top_vocab":["word1 — meaning","word2 — meaning","word3 — meaning","word4 — meaning","word5 — meaning"],"recommended_scenario":"Which conversation scenario to practice and why","youtube_search":"A specific YouTube search query to find helpful Turkish content","motivational_tr":"A motivational sentence in Turkish","motivational_en":"English translation of the motivational sentence"}`,
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
      grammar_focus: 'Review the basics',
      top_vocab: [],
      recommended_scenario: 'cafe',
      youtube_search: 'Turkish for beginners A1',
      motivational_tr: 'Her gün biraz daha iyi oluyorsun!',
      motivational_en: 'You are getting better every day!',
    });
  } catch (error) {
    console.error('Weekly brief error:', error);
    return Response.json(
      { error: 'Failed to generate brief' },
      { status: 500 }
    );
  }
}
