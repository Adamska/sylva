import type { Grammar, LeafShape, LightingMood, OrganShape, Palette, PlantForm, Species } from '@/types/botany';

export type Template = Omit<Species, 'name' | 'latin' | 'seed'>;

export interface Variety {
  genus: string;
  words: readonly string[];
  hints?: readonly string[];
  base: Template;
  leaf?: readonly [shape: LeafShape, size: number];
  organ?: readonly [shape: OrganShape, size: number, petal: string, heart: string];
  bark?: readonly [dark: string, light: string];
  foliage?: readonly [deep: string, bright: string, subsurface: string];
  grammar?: Partial<Grammar>;
  form?: Partial<PlantForm>;
  mood?: LightingMood;
}

export interface Archetype {
  genus: string;
  template: Template;
  petalsOnly: boolean;
}

const HOSTED_FLOWER_SIZE = 0.2;

export const flowers = (variety: Variety) => variety.organ !== undefined && variety.organ[0] !== 'berry';
export const bearsOrgans = (template: Template) => [template.grammar.axiom, ...template.grammar.rules.map((rule) => rule.successor)].some((sentence) => sentence.includes('K'));

export function cultivate(variety: Variety, host?: Template): Archetype {
  const { grammar, form, palette, mood } = host ?? variety.base;
  const [leafShape, leafSize] = (!host && variety.leaf) || [form.leafShape, form.leafSize];
  const [organShape, organSize, organ, organCore] = variety.organ ?? [form.organShape, form.organSize, palette.organ, palette.organCore];
  const [barkDark, barkLight] = (!host && variety.bark) || [palette.barkDark, palette.barkLight];
  const [leafDeep, leafBright, subsurface] = (!host && variety.foliage) || [palette.leafDeep, palette.leafBright, palette.subsurface];
  return {
    genus: variety.genus,
    petalsOnly: flowers(variety),
    template: {
      grammar: host ? grammar : { ...grammar, ...variety.grammar },
      form: { ...form, ...(host ? null : variety.form), leafShape, leafSize, organShape, organSize: host ? Math.min(organSize, HOSTED_FLOWER_SIZE) : organSize },
      palette: { ...palette, barkDark, barkLight, leafDeep, leafBright, subsurface, organ, organCore },
      mood: (!host && variety.mood) || mood,
    },
  };
}

type Numbers = readonly [iterations: number, angleDeg: number, stepLength: number, radiusScale: number, tropismGravity: number];
type Build = readonly [trunkRadius: number, lengthDecay: number, angleJitter: number, leafShape: LeafShape, leafSize: number];

export function habit(axiom: string, rules: readonly (readonly [string, string])[], numbers: Numbers, build: Build, palette: Palette, mood: LightingMood): Template {
  const [iterations, angleDeg, stepLength, radiusScale, tropismGravity] = numbers;
  const [trunkRadius, lengthDecay, angleJitter, leafShape, leafSize] = build;
  return {
    grammar: { axiom, rules: rules.map(([symbol, successor]) => ({ symbol, successor })), iterations, angleDeg, stepLength, radiusScale, tropismGravity },
    form: { trunkRadius, lengthDecay, angleJitter, leafShape, leafSize, organShape: 'blossom', organSize: 0.12 },
    palette,
    mood,
  };
}

export const ring = (pitches: readonly number[], bud: string, roll = 137.5) => pitches.map((pitch) => `[&(${pitch})${bud}]`).join(`/(${roll})`);
