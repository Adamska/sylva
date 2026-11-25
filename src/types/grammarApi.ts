import { z } from 'zod';
import { LEAF_SHAPES, LIGHTING_MOODS, ORGAN_SHAPES, type Species } from './botany';

export const PROMPT_MAX_LENGTH = 240;

export const grammarRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(PROMPT_MAX_LENGTH),
});

export const speciesDraftSchema = z.object({
  name: z.string().describe('Common name of the plant, at most 48 characters'),
  latin: z.string().describe('Plausible binomial Latin name'),
  grammar: z.object({
    axiom: z.string().describe('Starting sentence using the turtle alphabet'),
    rules: z.array(
      z.object({
        symbol: z.string().describe('Single letter that is rewritten'),
        successor: z.string().describe('Replacement sentence'),
      }),
    ),
    iterations: z.number().describe('Rewriting passes, 1 to 9'),
    angleDeg: z.number().describe('Default rotation in degrees for rotations without an argument'),
    stepLength: z.number().describe('Length of one F segment, 0.04 to 1.2'),
    radiusScale: z.number().describe('Child to parent radius ratio at an even fork, 0.5 to 0.95'),
    tropismGravity: z.number().describe('-1 reaches upward, 1 weeps toward the ground'),
  }),
  form: z.object({
    trunkRadius: z.number().describe('Radius at the base, 0.02 to 0.5'),
    lengthDecay: z.number().describe('Segment length multiplier per bracket depth, 0.5 to 1'),
    angleJitter: z.number().describe('Random angular variation, 0 to 0.6'),
    leafShape: z.enum(LEAF_SHAPES),
    leafSize: z.number().describe('Leaf length, 0.03 to 2.4'),
    organShape: z.enum(ORGAN_SHAPES).describe('Shape drawn by the K symbol'),
    organSize: z.number().describe('Petal length or fruit diameter, 0.02 to 0.6'),
  }),
  palette: z.object({
    barkDark: z.string().describe('Hex colour such as #2a2019'),
    barkLight: z.string(),
    leafDeep: z.string(),
    leafBright: z.string(),
    subsurface: z.string().describe('Colour of light transmitted through the leaves'),
    organ: z.string().describe('Colour of petals or fruit'),
    organCore: z.string().describe('Colour of the flower heart: disc, stamens or pistil'),
    glow: z.number().describe('Bioluminescent emission, 0 for ordinary plants up to 1'),
  }),
  mood: z.enum(LIGHTING_MOODS),
});

export type SpeciesDraft = z.infer<typeof speciesDraftSchema>;
export type GrammarSource = 'openai' | 'procedural';

export interface GrammarResponse {
  species: Species;
  source: GrammarSource;
  notice?: string;
}
