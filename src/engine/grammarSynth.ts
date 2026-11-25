import { speciesSchema, type Palette, type Species } from '@/types/botany';
import { hslToHex } from './colorOps';
import {
  DROOP_WORDS,
  FLOWER_WORDS,
  GLOW_WORDS,
  GNARL_WORDS,
  isTintWord,
  LUSH_WORDS,
  MOOD_WORDS,
  SMALL_WORDS,
  SPARSE_WORDS,
  TALL_WORDS,
  TINTS,
  TREE_WORDS,
  type Tint,
} from './descriptors';
import { FLOWERS } from './flowerCatalog';
import { clampParameter as clamp, perturbAngles, vary } from './grammarOps';
import { createRng, hashString, type Rng } from './random';
import { fitIterations } from './speciesNormalizer';
import { DEFAULT_TREE, FLOWERING_TREE, TREE_HINTS, TREES } from './treeCatalog';
import { bearsOrgans, cultivate, type Archetype, type Variety } from './varieties';
import { findMatches, findNearest, hasWord, readText, withoutWord, type Match, type Reading } from './wordMatch';

interface Resolution {
  archetype: Archetype;
  word: string | null;
  known: boolean;
}

const AXIOM_LIMIT = 120;
const EPITHET_STEMS = ['aur', 'luc', 'umbr', 'vir', 'sol', 'noct', 'arg', 'flamm', 'cael', 'sylv', 'vesper', 'ign'];
const EPITHET_ENDINGS = ['ea', 'ata', 'ifera', 'escens', 'ina', 'osa', 'ensis', 'ella'];

function tintPalette(palette: Palette, tint: Tint, glow: number): Palette {
  const shade = tint.shade ?? 1;
  return {
    ...palette,
    leafDeep: hslToHex(tint.hue, tint.saturation * 0.85, 0.26 * shade),
    leafBright: hslToHex(tint.hue + 8, tint.saturation, 0.62 * shade),
    subsurface: hslToHex(tint.hue + 22, Math.min(1, tint.saturation + 0.2), 0.66 * shade),
    organ: hslToHex(tint.hue - 12, Math.min(1, tint.saturation + 0.1), 0.78 * shade),
    glow,
  };
}

function tintPetals(palette: Palette, tint: Tint, glow: number): Palette {
  const pale = tint.saturation < 0.2;
  return { ...palette, organ: hslToHex(tint.hue, pale ? 0.2 : Math.min(1, tint.saturation + 0.14), (pale ? 0.94 : 0.6) * (tint.shade ?? 1)), glow };
}

function strongest(matches: Match<Variety>[]): Match<Variety> | undefined {
  const weight = (match: Match<Variety>) => (isTintWord(match.word) ? 0 : 100) + match.word.length;
  return matches.sort((a, b) => weight(b) - weight(a))[0];
}

function resolve(reading: Reading, rng: Rng): Resolution {
  const flower = strongest(findMatches(reading, FLOWERS));
  const tree = strongest(findMatches(reading, TREES));
  const wantsTree = hasWord(reading, TREE_WORDS);

  const overruled = tree !== undefined && flower !== undefined && (isTintWord(flower.word) || tree.word.includes(flower.word));
  if (flower && !overruled) {
    const host = tree ? cultivate(tree.entry).template : wantsTree ? FLOWERING_TREE.base : undefined;
    const carrier = host && !bearsOrgans(host) ? FLOWERING_TREE.base : host;
    return { archetype: cultivate(flower.entry, carrier), word: flower.word, known: true };
  }
  if (tree) return { archetype: cultivate(tree.entry), word: tree.word, known: true };
  const hinted = strongest(findMatches(reading, TREE_HINTS));
  if (hinted) return { archetype: cultivate(hinted.entry), word: null, known: true };
  if (wantsTree) return { archetype: cultivate(hasWord(reading, FLOWER_WORDS) ? FLOWERING_TREE : DEFAULT_TREE), word: null, known: true };
  if (hasWord(reading, FLOWER_WORDS)) return { archetype: cultivate(FLOWERS[Math.floor(rng() * FLOWERS.length)]), word: null, known: false };

  const near = findNearest(reading, FLOWERS) ?? findNearest(reading, TREES);
  if (near) return { archetype: cultivate(near.entry), word: near.word, known: true };
  const pool = [...TREES, ...FLOWERS];
  return { archetype: cultivate(pool[Math.floor(rng() * pool.length)]), word: null, known: false };
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
    .slice(0, 48);
}

function synthesize(prompt: string): { species: Species; known: boolean } {
  const text = prompt.trim().toLowerCase();
  const seed = hashString(text);
  const rng = createRng(seed);
  const reading = readText(text);
  const { archetype, word, known } = resolve(reading, rng);
  const { grammar, form, palette, mood } = archetype.template;
  const hues = word ? withoutWord(reading, word) : reading;

  const stature = hasWord(reading, TALL_WORDS) ? 1.18 : hasWord(reading, SMALL_WORDS) ? 0.72 : 1;
  const lushness = hasWord(reading, LUSH_WORDS) ? 1 : hasWord(reading, SPARSE_WORDS) ? -1 : 0;
  const droop = hasWord(reading, DROOP_WORDS) ? 0.35 : 0;
  const gnarl = hasWord(reading, GNARL_WORDS) ? 0.2 : 0;
  const glow = hasWord(reading, GLOW_WORDS) ? 0.55 + 0.4 * rng() : palette.glow;
  const tint = TINTS.find((candidate) => hasWord(hues, candidate.words));
  const recolor = archetype.petalsOnly ? tintPetals : tintPalette;
  const swayed = perturbAngles(grammar.axiom, rng, 0.14);

  const tuned = {
    axiom: swayed.length <= AXIOM_LIMIT ? swayed : grammar.axiom,
    rules: grammar.rules.map((rule) => ({ symbol: rule.symbol, successor: perturbAngles(rule.successor, rng, 0.14) })),
    iterations: clamp('iterations', grammar.iterations + lushness),
    angleDeg: clamp('angleDeg', grammar.angleDeg * vary(rng, 0.12)),
    stepLength: clamp('stepLength', grammar.stepLength * stature * vary(rng, 0.08)),
    radiusScale: clamp('radiusScale', grammar.radiusScale * vary(rng, 0.05)),
    tropismGravity: clamp('tropismGravity', grammar.tropismGravity + droop + 0.08 * (rng() * 2 - 1)),
  };
  const epithet = EPITHET_STEMS[Math.floor(rng() * EPITHET_STEMS.length)] + EPITHET_ENDINGS[Math.floor(rng() * EPITHET_ENDINGS.length)];

  const species = speciesSchema.parse({
    name: titleCase(text) || 'Unnamed Specimen',
    latin: `${archetype.genus} ${epithet}`,
    grammar: fitIterations(tuned, seed),
    form: {
      ...form,
      trunkRadius: clamp('trunkRadius', form.trunkRadius * stature * vary(rng, 0.1)),
      angleJitter: clamp('angleJitter', form.angleJitter + gnarl),
      leafSize: clamp('leafSize', form.leafSize * vary(rng, 0.12) * (lushness < 0 ? 0.7 : 1)),
    },
    palette: tint ? recolor(palette, tint, glow) : { ...palette, glow },
    mood: MOOD_WORDS.find(([, words]) => hasWord(reading, words))?.[0] ?? mood,
    seed,
  });
  return { species, known };
}

export const synthesizeSpecies = (prompt: string): Species => synthesize(prompt).species;

export function findReference(prompt: string): Species | null {
  const { species, known } = synthesize(prompt);
  return known ? species : null;
}
