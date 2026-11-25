import { createGoogle } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import type { GoogleLanguageModelOptions } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';
import type { GrammarSource } from '@/types/grammarApi';

export interface ConfiguredModel {
  source: Exclude<GrammarSource, 'procedural'>;
  model: LanguageModel;
  providerOptions?: { google: GoogleLanguageModelOptions };
}

const DEFAULT_GEMINI_MODEL = 'gemini-flash-latest';
const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';
const LEGACY_THINKING_BUDGET = 1024;

export function resolveModel(): ConfiguredModel | null {
  const geminiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (geminiKey) {
    const id = process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;
    const thinkingConfig = id.startsWith('gemini-2') ? { thinkingBudget: LEGACY_THINKING_BUDGET } : { thinkingLevel: 'low' as const };
    return { source: 'gemini', model: createGoogle({ apiKey: geminiKey })(id), providerOptions: { google: { thinkingConfig } } };
  }
  const openaiKey = process.env.OPENAI_API_KEY ?? process.env.OPENAI_KEY;
  if (openaiKey) {
    return { source: 'openai', model: createOpenAI({ apiKey: openaiKey })(process.env.OPENAI_MODEL ?? DEFAULT_OPENAI_MODEL) };
  }
  return null;
}
