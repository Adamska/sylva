import {
  MAX_RULES,
  PARAMETER_RANGES,
  speciesSchema,
  type Grammar,
  type NumericRange,
  type Palette,
  type ProductionRule,
  type Species,
} from '@/types/botany';
import type { SpeciesDraft } from '@/types/grammarApi';
import { expandGrammar } from './lsystem';

const MODULE_PATTERN = /[A-Za-z+\-&^\\/|[\]!](?:\(\d{1,4}(?:\.\d{1,3})?\))?/g;
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
const SEGMENT_BUDGET = 9_000;
const LEAF_BUDGET = 7_000;

const FALLBACK_PALETTE: Palette = {
  barkDark: '#2a2019',
  barkLight: '#7b6650',
  leafDeep: '#2f5a2a',
  leafBright: '#9cc45a',
  subsurface: '#e2e05a',
  glow: 0,
};

function clampTo(range: NumericRange, value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(range.max, Math.max(range.min, value));
}

export function sanitizeSentence(text: string, maxLength: number): string {
  const modules = text.match(MODULE_PATTERN) ?? [];
  let sentence = '';
  let depth = 0;
  for (const module of modules) {
    const reserve = depth + (module === '[' ? 1 : 0);
    if (sentence.length + module.length + reserve > maxLength) break;
    if (module === ']') {
      if (depth === 0) continue;
      depth--;
    } else if (module === '[') depth++;
    sentence += module;
  }
  return sentence + ']'.repeat(depth);
}

function sanitizeRules(rules: SpeciesDraft['grammar']['rules']): ProductionRule[] {
  return rules
    .filter((rule) => /^[A-Za-z]$/.test(rule.symbol.trim()))
    .slice(0, MAX_RULES)
    .map((rule) => ({ symbol: rule.symbol.trim(), successor: sanitizeSentence(rule.successor, 200) }));
}

function countSymbol(sentence: string, symbol: string): number {
  let count = 0;
  for (let index = 0; index < sentence.length; index++) if (sentence[index] === symbol) count++;
  return count;
}

export function fitIterations(grammar: Grammar, seed: number): Grammar {
  let iterations = grammar.iterations;
  while (iterations > 1) {
    const expansion = expandGrammar({ ...grammar, iterations }, seed);
    const withinBudget =
      !expansion.truncated &&
      countSymbol(expansion.sentence, 'F') <= SEGMENT_BUDGET &&
      countSymbol(expansion.sentence, 'L') <= LEAF_BUDGET;
    if (withinBudget) break;
    iterations--;
  }
  return { ...grammar, iterations };
}

function normalizePalette(palette: SpeciesDraft['palette']): Palette {
  const pick = (value: string, fallback: string) => (HEX_PATTERN.test(value.trim()) ? value.trim().toLowerCase() : fallback);
  return {
    barkDark: pick(palette.barkDark, FALLBACK_PALETTE.barkDark),
    barkLight: pick(palette.barkLight, FALLBACK_PALETTE.barkLight),
    leafDeep: pick(palette.leafDeep, FALLBACK_PALETTE.leafDeep),
    leafBright: pick(palette.leafBright, FALLBACK_PALETTE.leafBright),
    subsurface: pick(palette.subsurface, FALLBACK_PALETTE.subsurface),
    glow: clampTo(PARAMETER_RANGES.glow, palette.glow, 0),
  };
}

export function normalizeSpecies(draft: SpeciesDraft, seed: number): Species {
  const rules = sanitizeRules(draft.grammar.rules);
  let axiom = sanitizeSentence(draft.grammar.axiom, 120);
  const drawsWood = [axiom, ...rules.map((rule) => rule.successor)].some((sentence) => sentence.includes('F'));
  if (!axiom || !drawsWood) axiom = `F${axiom}`.slice(0, 120);

  const grammar: Grammar = {
    axiom,
    rules,
    iterations: Math.round(clampTo(PARAMETER_RANGES.iterations, draft.grammar.iterations, 5)),
    angleDeg: clampTo(PARAMETER_RANGES.angleDeg, draft.grammar.angleDeg, 25),
    stepLength: clampTo(PARAMETER_RANGES.stepLength, draft.grammar.stepLength, 0.3),
    radiusScale: clampTo(PARAMETER_RANGES.radiusScale, draft.grammar.radiusScale, 0.7),
    tropismGravity: clampTo(PARAMETER_RANGES.tropismGravity, draft.grammar.tropismGravity, 0),
  };
  const normalizedSeed = seed >>> 0;

  return speciesSchema.parse({
    name: draft.name.trim().slice(0, 48) || 'Unnamed Specimen',
    latin: draft.latin.trim().slice(0, 64) || 'Species incognita',
    grammar: fitIterations(grammar, normalizedSeed),
    form: {
      trunkRadius: clampTo(PARAMETER_RANGES.trunkRadius, draft.form.trunkRadius, 0.15),
      lengthDecay: clampTo(PARAMETER_RANGES.lengthDecay, draft.form.lengthDecay, 0.85),
      angleJitter: clampTo(PARAMETER_RANGES.angleJitter, draft.form.angleJitter, 0.15),
      leafShape: draft.form.leafShape,
      leafSize: clampTo(PARAMETER_RANGES.leafSize, draft.form.leafSize, 0.25),
    },
    palette: normalizePalette(draft.palette),
    mood: draft.mood,
    seed: normalizedSeed,
  });
}
