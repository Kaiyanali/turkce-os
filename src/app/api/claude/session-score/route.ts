import { anthropic, MODEL, EXTENDED_MAX_TOKENS } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, scenario } = await request.json();

    if (!messages || messages.length === 0) {
      return Response.json({
        score: 0,
        errors: ['No conversation to score'],
        grammar_tip: 'Start a conversation first!',
        summary: 'No messages found.',
      });
    }

    const conversationText = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: EXTENDED_MAX_TOKENS,
      system: `You are a Turkish language teacher scoring a student conversation.
You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no extra text.
Use only ASCII characters in your JSON string values - no special quotes or unicode punctuation.
Escape any quotes inside strings with backslash.`,
      messages: [
        {
          role: 'user',
          content: `Score this Turkish conversation practice (scenario: ${scenario}).

Conversation:
${conversationText}

Respond with ONLY this JSON (no other text):
{"score": 7, "errors": ["error 1", "error 2"], "grammar_tip": "tip here", "summary": "summary here"}

Score 1-10. If no errors, use empty array [].`,
        },
      ],
    });

    const text =
      response.content[0].type === 'text' ? response.content[0].text : '';

    const parsed = safeParseLLMJson(text);
    if (parsed) {
      return Response.json(parsed);
    }

    return Response.json({
      score: 5,
      errors: [],
      grammar_tip: 'Keep practicing!',
      summary: 'Session completed. Keep up the good work!',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Session score error:', errMsg);
    return Response.json(
      { error: 'Failed to score session', detail: errMsg },
      { status: 500 }
    );
  }
}

function safeParseLLMJson(text: string): Record<string, unknown> | null {
  // Try direct parse
  try {
    return JSON.parse(text);
  } catch {}

  // Extract JSON block
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;

  let json = match[0];

  // Fix common LLM JSON issues
  json = json
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/\r?\n/g, ' ')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/\t/g, ' ');

  try {
    return JSON.parse(json);
  } catch {}

  // Regex extraction fallback
  const scoreMatch = json.match(/"score"\s*:\s*(\d+)/);
  const tipMatch = json.match(/"grammar_tip"\s*:\s*"([^"]*)"/);
  const summaryMatch = json.match(/"summary"\s*:\s*"([^"]*)"/);
  const errorsMatch = json.match(/"errors"\s*:\s*\[([^\]]*)\]/);

  const errors: string[] = [];
  if (errorsMatch) {
    const items = errorsMatch[1].match(/"([^"]*)"/g);
    if (items) {
      items.forEach((item) => errors.push(item.replace(/"/g, '')));
    }
  }

  return {
    score: scoreMatch ? parseInt(scoreMatch[1]) : 5,
    errors,
    grammar_tip: tipMatch ? tipMatch[1] : 'Keep practicing!',
    summary: summaryMatch ? summaryMatch[1] : 'Session completed.',
  };
}
