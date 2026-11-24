import { LEAF_SHAPES, type Species } from '@/types/botany';
import { hexToHsl, shiftHue } from './colorOps';
import { clampParameter, perturbAngles, vary } from './grammarOps';
import { createRng } from './random';
import { fitIterations } from './speciesNormalizer';

export interface Variant {
  species: Species;
  label: string;
}

export function mutateSpecies(base: Species, seed: number): Species {
  const rng = createRng(seed);
  const { grammar, form, palette } = base;
  const hueShift = (rng() * 2 - 1) * 22;
  const iterationStep = rng() < 0.14 ? (rng() < 0.5 ? -1 : 1) : 0;
  const leafShape = rng() < 0.08 ? LEAF_SHAPES[Math.floor(rng() * LEAF_SHAPES.length)] : form.leafShape;

  const mutated = {
    axiom: perturbAngles(grammar.axiom, rng, 0.18),
    rules: grammar.rules.map((rule) => ({ symbol: rule.symbol, successor: perturbAngles(rule.successor, rng, 0.18) })),
    iterations: clampParameter('iterations', grammar.iterations + iterationStep),
    angleDeg: clampParameter('angleDeg', grammar.angleDeg * vary(rng, 0.15)),
    stepLength: clampParameter('stepLength', grammar.stepLength * vary(rng, 0.12)),
    radiusScale: clampParameter('radiusScale', grammar.radiusScale * vary(rng, 0.05)),
    tropismGravity: clampParameter('tropismGravity', grammar.tropismGravity + (rng() * 2 - 1) * 0.22),
  };

  return {
    ...base,
    grammar: fitIterations(mutated, seed),
    form: {
      ...form,
      leafShape,
      trunkRadius: clampParameter('trunkRadius', form.trunkRadius * vary(rng, 0.14)),
      lengthDecay: clampParameter('lengthDecay', form.lengthDecay * vary(rng, 0.04)),
      angleJitter: clampParameter('angleJitter', form.angleJitter + (rng() * 2 - 1) * 0.08),
      leafSize: clampParameter('leafSize', form.leafSize * vary(rng, 0.2)),
      organSize: clampParameter('organSize', form.organSize * vary(rng, 0.15)),
    },
    palette: {
      ...palette,
      leafDeep: shiftHue(palette.leafDeep, hueShift),
      leafBright: shiftHue(palette.leafBright, hueShift),
      subsurface: shiftHue(palette.subsurface, hueShift * 0.7),
      organ: shiftHue(palette.organ, hueShift * 0.5),
    },
    seed: seed >>> 0,
  };
}

function hueDelta(from: string, to: string): number {
  return ((hexToHsl(to).hue - hexToHsl(from).hue + 540) % 360) - 180;
}

export function describeVariant(base: Species, variant: Species): string {
  const traits: { weight: number; text: string }[] = [];
  const consider = (delta: number, scale: number, positive: string, negative: string) =>
    traits.push({ weight: Math.abs(delta) / scale, text: delta > 0 ? positive : negative });

  consider(variant.grammar.tropismGravity - base.grammar.tropismGravity, 0.12, 'more weeping', 'more upright');
  consider(variant.grammar.stepLength / base.grammar.stepLength - 1, 0.07, 'taller', 'more compact');
  consider(variant.form.leafSize / base.form.leafSize - 1, 0.12, 'larger leaves', 'finer leaves');
  consider(variant.form.trunkRadius / base.form.trunkRadius - 1, 0.09, 'stouter', 'more slender');
  consider(variant.form.angleJitter - base.form.angleJitter, 0.05, 'wilder', 'tidier');
  consider(variant.grammar.iterations - base.grammar.iterations, 0.5, 'denser', 'sparser');
  consider(hueDelta(base.palette.leafBright, variant.palette.leafBright), 12, 'cooler hue', 'warmer hue');
  if (variant.form.leafShape !== base.form.leafShape) traits.push({ weight: 3, text: `${variant.form.leafShape} leaves` });

  const strongest = traits.filter((trait) => trait.weight >= 0.5).sort((a, b) => b.weight - a.weight).slice(0, 2);
  return strongest.length > 0 ? strongest.map((trait) => trait.text).join(', ') : 'subtle variation';
}

export function breedVariants(base: Species, generation: number, count: number): Variant[] {
  return Array.from({ length: count }, (_, index) => {
    const species = mutateSpecies(base, (base.seed + generation * 7919 + index * 104729 + 1) >>> 0);
    return { species, label: describeVariant(base, species) };
  });
}
