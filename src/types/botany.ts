import { z } from 'zod';

export const LEAF_SHAPES = ['lanceolate', 'needle', 'sword', 'ovate', 'polyp'] as const;
export const LIGHTING_MOODS = ['goldenHour', 'studio', 'moonlit', 'abyssal'] as const;

export type LeafShape = (typeof LEAF_SHAPES)[number];
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
  glow: { min: 0, max: 1, step: 0.01 },
} as const satisfies Record<string, NumericRange>;

export const SENTENCE_PATTERN = /^[A-Za-z0-9+\-&^\\/|[\]!().]*$/;
export const MAX_RULES = 8;

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
});

export const paletteSchema = z.object({
  barkDark: hexColor,
  barkLight: hexColor,
  leafDeep: hexColor,
  leafBright: hexColor,
  subsurface: hexColor,
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

export interface SpeciesPreset {
  id: string;
  species: Species;
}

export const SPECIES_PRESETS: readonly SpeciesPreset[] = [
  {
    id: 'weeping-willow',
    species: {
      name: 'Weeping Willow',
      latin: 'Salix babylonica',
      grammar: {
        axiom: 'F(3.4)/(40)F(2.2)[&(32)X]/(128)[&(40)X]/(115)[&(28)X]/(131)[&(44)X]/(120)[&(10)X]',
        rules: [
          { symbol: 'X', successor: 'FF[\\(40)&(42)Y]/(137.5)[&(36)Y]/(110)[&(12)Y]' },
          { symbol: 'Y', successor: 'FF[\\(60)&(46)Z]/(137.5)[&(40)Z]/(100)[&(14)Z]' },
          { symbol: 'Z', successor: 'F[&(55)W]/(137.5)F[&(50)W]/(137.5)F[&(45)W]/(137.5)[&(20)W]' },
          { symbol: 'W', successor: 'F(0.6)L/(137.5)F(0.6)L/(137.5)F(0.6)L/(137.5)F(0.6)LW' },
        ],
        iterations: 7,
        angleDeg: 28,
        stepLength: 0.28,
        radiusScale: 0.64,
        tropismGravity: 0.6,
      },
      form: { trunkRadius: 0.2, lengthDecay: 0.88, angleJitter: 0.22, leafShape: 'lanceolate', leafSize: 0.26 },
      palette: {
        barkDark: '#2a2019',
        barkLight: '#7b6650',
        leafDeep: '#27521f',
        leafBright: '#86bd45',
        subsurface: '#c9e24a',
        glow: 0,
      },
      mood: 'goldenHour',
      seed: 1187,
    },
  },
  {
    id: 'alpine-pine',
    species: {
      name: 'Alpine Pine',
      latin: 'Pinus cembra',
      grammar: {
        axiom: 'F(1.6)F(1.2)A',
        rules: [
          { symbol: 'A', successor: 'F[&(84)B]/(72)[&(78)B]/(72)[&(86)B]/(72)[&(80)B]/(72)[&(88)B]/(37)A' },
          { symbol: 'B', successor: 'FL[+(44)C][-(44)C]/(12)B' },
          { symbol: 'C', successor: 'FLC' },
        ],
        iterations: 8,
        angleDeg: 40,
        stepLength: 0.34,
        radiusScale: 0.6,
        tropismGravity: -0.1,
      },
      form: { trunkRadius: 0.14, lengthDecay: 0.6, angleJitter: 0.14, leafShape: 'needle', leafSize: 0.2 },
      palette: {
        barkDark: '#241a15',
        barkLight: '#8a5f43',
        leafDeep: '#12352b',
        leafBright: '#4f8f62',
        subsurface: '#b6d96a',
        glow: 0,
      },
      mood: 'studio',
      seed: 4021,
    },
  },
  {
    id: 'desert-agave',
    species: {
      name: 'Desert Agave',
      latin: 'Agave deserti',
      grammar: {
        axiom: 'F(1.3)A',
        rules: [
          { symbol: 'A', successor: '[&(5)BL(0.55)]/(137.5)[&(8)BL(0.6)]/(137.5)[&(11)BL(0.65)]/(137.5)[&(14)BL(0.7)]/(137.5)F(0.1)A' },
          { symbol: 'B', successor: '&(9.5)B' },
          { symbol: 'L', successor: 'L' },
        ],
        iterations: 8,
        angleDeg: 137.5 / 2,
        stepLength: 0.26,
        radiusScale: 0.8,
        tropismGravity: 0,
      },
      form: { trunkRadius: 0.2, lengthDecay: 1, angleJitter: 0.1, leafShape: 'sword', leafSize: 2.2 },
      palette: {
        barkDark: '#3a3527',
        barkLight: '#8d8667',
        leafDeep: '#2f5c57',
        leafBright: '#9fc7ae',
        subsurface: '#d9f08a',
        glow: 0,
      },
      mood: 'moonlit',
      seed: 733,
    },
  },
  {
    id: 'coral-tree',
    species: {
      name: 'Bioluminescent Coral Tree',
      latin: 'Corallodendron lucifer',
      grammar: {
        axiom: 'F(1.1)A',
        rules: [
          { symbol: 'A', successor: 'FL[&(38)/(18)A][^(34)\\(42)A]/(92)[+(30)A]' },
          { symbol: 'L', successor: '' },
        ],
        iterations: 7,
        angleDeg: 27,
        stepLength: 0.62,
        radiusScale: 0.74,
        tropismGravity: -0.14,
      },
      form: { trunkRadius: 0.17, lengthDecay: 0.86, angleJitter: 0.3, leafShape: 'polyp', leafSize: 0.085 },
      palette: {
        barkDark: '#0b1f33',
        barkLight: '#2b6f8f',
        leafDeep: '#0f5fa8',
        leafBright: '#3fe9ff',
        subsurface: '#ff4fc8',
        glow: 0.85,
      },
      mood: 'abyssal',
      seed: 90210,
    },
  },
];

export const DEFAULT_PRESET = SPECIES_PRESETS[0];
