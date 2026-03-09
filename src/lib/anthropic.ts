import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODEL = 'claude-sonnet-4-6';
export const DEFAULT_MAX_TOKENS = 1024;
export const EXTENDED_MAX_TOKENS = 2048;
