import { speciesSchema, type LightingMood, type Palette, type Species } from '@/types/botany';
import { ARCHETYPES, DEFAULT_ARCHETYPE, type Archetype } from './archetypes';
import { hslToHex } from './colorOps';
import { clampParameter as clamp, perturbAngles, vary } from './grammarOps';
import { createRng, hashString, type Rng } from './random';
import { fitIterations } from './speciesNormalizer';

interface Tint {
  words: readonly string[];
  hue: number;
  saturation: number;
}

const TINTS: readonly Tint[] = [
  { words: ['red', 'crimson', 'scarlet', 'blood', 'ruby'], hue: 356, saturation: 0.72 },
  { words: ['orange', 'amber', 'ember', 'fire', 'flame', 'autumn', 'rust'], hue: 26, saturation: 0.8 },
  { words: ['gold', 'golden', 'yellow', 'honey', 'sun'], hue: 47, saturation: 0.78 },
  { words: ['pink', 'blossom', 'sakura', 'cherry', 'rose'], hue: 334, saturation: 0.62 },
  { words: ['purple', 'violet', 'amethyst', 'lilac', 'plum'], hue: 276, saturation: 0.55 },
  { words: ['blue', 'azure', 'sapphire', 'cobalt', 'ice', 'frozen'], hue: 212, saturation: 0.62 },
  { words: ['teal', 'cyan', 'turquoise', 'aqua', 'jade'], hue: 176, saturation: 0.6 },
  { words: ['white', 'silver', 'snow', 'frost', 'ghost', 'pale', 'bone'], hue: 200, saturation: 0.08 },
];

const MOOD_WORDS: readonly (readonly [LightingMood, readonly string[]])[] = [
  ['abyssal', ['glow', 'glowing', 'bioluminescent', 'neon', 'abyss', 'deep sea', 'alien', 'luminous', 'radioactive']],
  ['moonlit', ['moon', 'night', 'lunar', 'midnight', 'frost', 'ghost', 'winter', 'ice']],
  ['goldenHour', ['sunset', 'golden', 'autumn', 'dusk', 'savanna', 'ember', 'sun']],
  ['dawn', ['dawn', 'sunrise', 'morning', 'spring', 'pastel', 'mist']],
];

const GLOW_WORDS = ['glow', 'glowing', 'bioluminescent', 'neon', 'luminous', 'radioactive', 'ember', 'fire', 'crystal', 'electric'];
const EPITHET_STEMS = ['aur', 'luc', 'umbr', 'vir', 'sol', 'noct', 'arg', 'flamm', 'cael', 'sylv', 'vesper', 'ign'];
const EPITHET_ENDINGS = ['ea', 'ata', 'ifera', 'escens', 'ina', 'osa', 'ensis', 'ella'];

function hasWord(text: string, words: readonly string[]): boolean {
  const tokens = text.split(/[^a-z]+/).flatMap((token) => [token, token.replace(/s$/, '')]);
  return words.some((word) => (word.includes(' ') ? text.includes(word) : tokens.includes(word)));
}

function tintPalette(palette: Palette, tint: Tint, glow: number): Palette {
  return {
    ...palette,
    leafDeep: hslToHex(tint.hue, tint.saturation * 0.85, 0.26),
    leafBright: hslToHex(tint.hue + 8, tint.saturation, 0.62),
    subsurface: hslToHex(tint.hue + 22, Math.min(1, tint.saturation + 0.2), 0.66),
    organ: hslToHex(tint.hue - 12, Math.min(1, tint.saturation + 0.1), 0.78),
    glow,
  };
}

function pickArchetype(text: string, rng: Rng): Archetype {
  const match = ARCHETYPES.find((archetype) => hasWord(text, archetype.keywords));
  if (match) return match;
  if (hasWord(text, DEFAULT_ARCHETYPE.keywords)) return DEFAULT_ARCHETYPE;
  const pool = [DEFAULT_ARCHETYPE, ...ARCHETYPES];
  return pool[Math.floor(rng() * pool.length)];
}

function titleCase(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ')
    .slice(0, 48);
}

export function synthesizeSpecies(prompt: string): Species {
  const text = prompt.trim().toLowerCase();
  const seed = hashString(text);
  const rng = createRng(seed);
  const archetype = pickArchetype(text, rng);
  const { grammar, form, palette, mood } = archetype.template;

  const stature = hasWord(text, ['giant', 'towering', 'tall', 'ancient', 'colossal']) ? 1.18 : hasWord(text, ['dwarf', 'bonsai', 'tiny', 'small', 'miniature']) ? 0.72 : 1;
  const lushness = hasWord(text, ['lush', 'dense', 'bushy', 'thick']) ? 1 : hasWord(text, ['sparse', 'bare', 'skeletal', 'dead']) ? -1 : 0;
  const droop = hasWord(text, ['weeping', 'drooping', 'wilting', 'melting']) ? 0.35 : 0;
  const gnarl = hasWord(text, ['twisted', 'gnarled', 'wild', 'chaotic', 'windswept']) ? 0.2 : 0;
  const glow = hasWord(text, GLOW_WORDS) ? 0.55 + 0.4 * rng() : palette.glow;
  const tint = TINTS.find((candidate) => hasWord(text, candidate.words));

  const tuned = {
    axiom: perturbAngles(grammar.axiom, rng, 0.14),
    rules: grammar.rules.map((rule) => ({ symbol: rule.symbol, successor: perturbAngles(rule.successor, rng, 0.14) })),
    iterations: clamp('iterations', grammar.iterations + lushness),
    angleDeg: clamp('angleDeg', grammar.angleDeg * vary(rng, 0.12)),
    stepLength: clamp('stepLength', grammar.stepLength * stature * vary(rng, 0.08)),
    radiusScale: clamp('radiusScale', grammar.radiusScale * vary(rng, 0.05)),
    tropismGravity: clamp('tropismGravity', grammar.tropismGravity + droop + 0.08 * (rng() * 2 - 1)),
  };
  const epithet = EPITHET_STEMS[Math.floor(rng() * EPITHET_STEMS.length)] + EPITHET_ENDINGS[Math.floor(rng() * EPITHET_ENDINGS.length)];

  return speciesSchema.parse({
    name: titleCase(text) || 'Unnamed Specimen',
    latin: `${archetype.genus} ${epithet}`,
    grammar: fitIterations(tuned, seed),
    form: {
      ...form,
      trunkRadius: clamp('trunkRadius', form.trunkRadius * stature * vary(rng, 0.1)),
      angleJitter: clamp('angleJitter', form.angleJitter + gnarl),
      leafSize: clamp('leafSize', form.leafSize * vary(rng, 0.12) * (lushness < 0 ? 0.7 : 1)),
    },
    palette: tint ? tintPalette(palette, tint, glow) : { ...palette, glow },
    mood: MOOD_WORDS.find(([, words]) => hasWord(text, words))?.[0] ?? mood,
    seed,
  });
}
