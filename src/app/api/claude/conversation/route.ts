import { anthropic, MODEL, DEFAULT_MAX_TOKENS } from '@/lib/anthropic';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, scenario, week, phase } = await request.json();

    const systemPrompt = `You are a Turkish language conversation partner for a beginner-intermediate English speaker working toward A2 level.

Current scenario: ${scenario}
User's current week: ${week} of 22
User's current phase: ${phase}

Rules:
1. Respond ONLY in Turkish, kept simple for A1-A2 level
2. After EVERY response, add a correction note in English on a new line in this exact format:
   "✏️ [corrections if any, or 'Harika Türkçe!' if the user's Turkish was correct]"
3. Keep responses to 1-3 sentences maximum
4. Use vocabulary appropriate to the scenario
5. Be encouraging and warm
6. If the user writes in English, gently redirect them to Turkish with a hint
7. If no user messages yet, start the conversation with a greeting appropriate to the scenario`;

    const apiMessages = messages.length === 0
      ? [{ role: 'user' as const, content: 'Start the conversation.' }]
      : messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

    const stream = await anthropic.messages.stream({
      model: MODEL,
      max_tokens: DEFAULT_MAX_TOKENS,
      system: systemPrompt,
      messages: apiMessages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Conversation error:', error);
    return Response.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
