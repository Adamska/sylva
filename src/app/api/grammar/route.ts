import { openai } from '@ai-sdk/openai';
import { generateText, Output } from 'ai';
import { synthesizeSpecies } from '@/engine/grammarSynth';
import { hashString } from '@/engine/random';
import { normalizeSpecies } from '@/engine/speciesNormalizer';
import { grammarRequestSchema, speciesDraftSchema, type GrammarResponse } from '@/types/grammarApi';
import { GRAMMAR_SYSTEM_PROMPT } from './systemPrompt';

export const runtime = 'nodejs';
export const maxDuration = 30;

const DEFAULT_MODEL = 'gpt-5-mini';

function proceduralResponse(prompt: string, notice?: string): Response {
  const body: GrammarResponse = { species: synthesizeSpecies(prompt), source: 'procedural', notice };
  return Response.json(body);
}

export async function POST(request: Request): Promise<Response> {
  const payload: unknown = await request.json().catch(() => null);
  const parsed = grammarRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return Response.json({ error: 'Describe a plant in 1 to 240 characters.' }, { status: 400 });
  }
  const { prompt } = parsed.data;

  if (!process.env.OPENAI_API_KEY) return proceduralResponse(prompt);

  try {
    const { output } = await generateText({
      model: openai(process.env.OPENAI_MODEL ?? DEFAULT_MODEL),
      output: Output.object({ schema: speciesDraftSchema }),
      instructions: GRAMMAR_SYSTEM_PROMPT,
      prompt,
      timeout: 25_000,
    });
    const body: GrammarResponse = { species: normalizeSpecies(output, hashString(prompt.toLowerCase())), source: 'openai' };
    return Response.json(body);
  } catch (error) {
    console.error('Grammar generation failed, falling back to procedural synthesis', error);
    return proceduralResponse(prompt, 'The language model was unavailable, so this specimen was grown procedurally.');
  }
}
