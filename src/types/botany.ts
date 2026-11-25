import { z } from 'zod';

export const LEAF_SHAPES = ['lanceolate', 'needle', 'sword', 'ovate', 'polyp'] as const;
export const ORGAN_SHAPES = ['blossom', 'daisy', 'sunflower', 'tulip', 'rose', 'lily', 'bell', 'poppy', 'pompom', 'berry'] as const;
export const LIGHTING_MOODS = ['goldenHour', 'studio', 'moonlit', 'abyssal', 'dawn'] as const;

export type LeafShape = (typeof LEAF_SHAPES)[number];
export type OrganShape = (typeof ORGAN_SHAPES)[number];
export type LightingMood = (typeof LIGHTING_MOODS)[number];

export interface NumericRange {
  min: number;
  max: number;
  step: number;
}

export const PARAMETER_RANGES = {
  iterations: { min: 1, max: 9, step: 1 },
  angleDeg: { min: 2, max: 120, step: 0.5 },
  stepLength: { min: 0.04, max: 1.2, step: 0.01 },
  radiusScale: { min: 0.5, max: 0.95, step: 0.01 },
  tropismGravity: { min: -1, max: 1, step: 0.01 },
  trunkRadius: { min: 0.02, max: 0.5, step: 0.005 },
  lengthDecay: { min: 0.5, max: 1, step: 0.01 },
  angleJitter: { min: 0, max: 0.6, step: 0.01 },
  leafSize: { min: 0.03, max: 2.4, step: 0.01 },
  organSize: { min: 0.02, max: 0.6, step: 0.005 },
  glow: { min: 0, max: 1, step: 0.01 },
} as const satisfies Record<string, NumericRange>;

export const SENTENCE_PATTERN = /^[A-Za-z0-9+\-&^\\/|[\]!().]*$/;
export const MAX_RULES = 8;
export const DEFAULT_ORGAN_CORE = '#e8b83a';

const ranged = (range: NumericRange) => z.number().min(range.min).max(range.max);
const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/);

export const ruleSchema = z.object({
  symbol: z.string().regex(/^[A-Za-z]$/),
  successor: z.string().max(200).regex(SENTENCE_PATTERN),
});

export const grammarSchema = z.object({
  axiom: z.string().min(1).max(120).regex(SENTENCE_PATTERN),
  rules: z.array(ruleSchema).max(MAX_RULES),
  iterations: ranged(PARAMETER_RANGES.iterations).int(),
  angleDeg: ranged(PARAMETER_RANGES.angleDeg),
  stepLength: ranged(PARAMETER_RANGES.stepLength),
  radiusScale: ranged(PARAMETER_RANGES.radiusScale),
  tropismGravity: ranged(PARAMETER_RANGES.tropismGravity),
});

export const formSchema = z.object({
  trunkRadius: ranged(PARAMETER_RANGES.trunkRadius),
  lengthDecay: ranged(PARAMETER_RANGES.lengthDecay),
  angleJitter: ranged(PARAMETER_RANGES.angleJitter),
  leafShape: z.enum(LEAF_SHAPES),
  leafSize: ranged(PARAMETER_RANGES.leafSize),
  organShape: z.enum(ORGAN_SHAPES),
  organSize: ranged(PARAMETER_RANGES.organSize),
});

export const paletteSchema = z.object({
  barkDark: hexColor,
  barkLight: hexColor,
  leafDeep: hexColor,
  leafBright: hexColor,
  subsurface: hexColor,
  organ: hexColor,
  organCore: hexColor.default(DEFAULT_ORGAN_CORE),
  glow: ranged(PARAMETER_RANGES.glow),
});

export const speciesSchema = z.object({
  name: z.string().min(1).max(48),
  latin: z.string().min(1).max(64),
  grammar: grammarSchema,
  form: formSchema,
  palette: paletteSchema,
  mood: z.enum(LIGHTING_MOODS),
  seed: z.number().int().min(0).max(0xffffffff),
});

export type ProductionRule = z.infer<typeof ruleSchema>;
export type Grammar = z.infer<typeof grammarSchema>;
export type PlantForm = z.infer<typeof formSchema>;
export type Palette = z.infer<typeof paletteSchema>;
export type Species = z.infer<typeof speciesSchema>;

export const AXIOM_ORIGIN = MAX_RULES;
