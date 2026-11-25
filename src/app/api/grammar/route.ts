import { generateText, Output } from 'ai';
import { findReference, synthesizeSpecies } from '@/engine/grammarSynth';
import { hashString } from '@/engine/random';
import { normalizeSpecies } from '@/engine/speciesNormalizer';
import { grammarRequestSchema, speciesDraftSchema, type GrammarResponse } from '@/types/grammarApi';
import { resolveModel } from './languageModel';
import { GRAMMAR_SYSTEM_PROMPT } from './systemPrompt';

export const runtime = 'nodejs';
export const maxDuration = 30;

function describe(prompt: string): string {
  const reference = findReference(prompt);
  if (!reference) return prompt;
  const { grammar, form, palette, mood } = reference;
  return `${prompt}\n\nReference specimen for this kind of plant, to adapt to the description rather than copy:\n${JSON.stringify({ grammar, form, palette, mood })}`;
}

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

  const configured = resolveModel();
  if (!configured) return proceduralResponse(prompt);

  try {
    const { output } = await generateText({
      model: configured.model,
      providerOptions: configured.providerOptions,
      output: Output.object({ schema: speciesDraftSchema }),
      instructions: GRAMMAR_SYSTEM_PROMPT,
      prompt: describe(prompt),
      maxRetries: 0,
      timeout: 25_000,
    });
    const body: GrammarResponse = { species: normalizeSpecies(output, hashString(prompt.toLowerCase())), source: configured.source };
    return Response.json(body);
  } catch (error) {
    console.error('Grammar generation failed, falling back to procedural synthesis', error);
    return proceduralResponse(prompt, 'The language model was unavailable, so this specimen was grown procedurally.');
  }
}
