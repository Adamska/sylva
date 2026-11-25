import type { LightingMood } from '@/types/botany';

export interface Tint {
  words: readonly string[];
  hue: number;
  saturation: number;
  shade?: number;
}

export const TINTS: readonly Tint[] = [
  { words: ['red', 'crimson', 'scarlet', 'blood', 'ruby', 'rouge', 'cramoisi', 'ecarlate', 'sang', 'rubis', 'vermillon', 'carmin', 'bordeaux'], hue: 356, saturation: 0.72 },
  { words: ['orange', 'amber', 'ember', 'fire', 'flame', 'autumn', 'rust', 'copper', 'ambre', 'braise', 'feu', 'flamme', 'automne', 'rouille', 'cuivre'], hue: 26, saturation: 0.8 },
  { words: ['gold', 'golden', 'yellow', 'honey', 'sun', 'jaune', 'dore', 'miel', 'soleil'], hue: 47, saturation: 0.78 },
  { words: ['pink', 'rose', 'magenta', 'fuchsia'], hue: 334, saturation: 0.62 },
  { words: ['purple', 'violet', 'amethyst', 'lilac', 'plum', 'indigo', 'pourpre', 'mauve', 'amethyste', 'lilas', 'prune'], hue: 276, saturation: 0.55 },
  { words: ['blue', 'azure', 'sapphire', 'cobalt', 'ice', 'frozen', 'navy', 'bleu', 'azur', 'saphir', 'glace', 'gele', 'marine'], hue: 212, saturation: 0.62 },
  { words: ['teal', 'cyan', 'turquoise', 'aqua', 'jade', 'emerald', 'emeraude'], hue: 176, saturation: 0.6 },
  { words: ['green', 'lime', 'vert'], hue: 112, saturation: 0.55 },
  { words: ['white', 'silver', 'snow', 'frost', 'ghost', 'pale', 'bone', 'ivory', 'cream', 'blanc', 'blanche', 'argent', 'argente', 'neige', 'givre', 'fantome', 'ivoire', 'creme'], hue: 200, saturation: 0.08 },
  { words: ['black', 'ebony', 'obsidian', 'onyx', 'noir', 'ebene'], hue: 275, saturation: 0.3, shade: 0.28 },
];

export const MOOD_WORDS: readonly (readonly [LightingMood, readonly string[]])[] = [
  ['abyssal', ['glow', 'glowing', 'bioluminescent', 'neon', 'abyss', 'deep sea', 'alien', 'luminous', 'radioactive', 'abysse', 'abyssal', 'fond marin', 'extraterrestre', 'lumineux', 'lumineuse', 'fluo']],
  ['moonlit', ['moon', 'night', 'lunar', 'midnight', 'frost', 'ghost', 'winter', 'ice', 'lune', 'nuit', 'lunaire', 'minuit', 'givre', 'fantome', 'hiver', 'glace']],
  ['goldenHour', ['sunset', 'golden', 'autumn', 'dusk', 'savanna', 'ember', 'sun', 'coucher', 'crepuscule', 'dore', 'automne', 'savane', 'soleil', 'braise']],
  ['dawn', ['dawn', 'sunrise', 'morning', 'spring', 'pastel', 'mist', 'aube', 'aurore', 'matin', 'printemps', 'brume', 'lever']],
];

export const GLOW_WORDS = [
  ...['glow', 'glowing', 'bioluminescent', 'neon', 'luminous', 'radioactive', 'ember', 'fire', 'crystal', 'electric'],
  ...['lumineux', 'lumineuse', 'brillant', 'phosphorescent', 'fluo', 'fluorescent', 'radioactif', 'electrique', 'cristal', 'luisant', 'incandescent', 'braise', 'feu'],
];

export const TALL_WORDS = ['giant', 'towering', 'tall', 'ancient', 'colossal', 'huge', 'geant', 'immense', 'gigantesque', 'grand', 'haut', 'ancien', 'ancienne', 'majestueux', 'enorme'];
export const SMALL_WORDS = ['dwarf', 'bonsai', 'tiny', 'small', 'miniature', 'little', 'nain', 'minuscule', 'petit'];
export const LUSH_WORDS = ['lush', 'dense', 'bushy', 'thick', 'luxuriant', 'touffu', 'epais', 'fourni'];
export const SPARSE_WORDS = ['sparse', 'bare', 'skeletal', 'dead', 'clairseme', 'nu', 'squelettique', 'mort', 'depouille', 'sec'];
export const DROOP_WORDS = ['weeping', 'drooping', 'wilting', 'melting', 'pendulous', 'pleureur', 'tombant', 'retombant', 'fane'];
export const GNARL_WORDS = ['twisted', 'gnarled', 'wild', 'chaotic', 'windswept', 'tordu', 'noueux', 'sauvage', 'chaotique', 'torture'];
export const TREE_WORDS = ['tree', 'arbre'];
export const FLOWER_WORDS = ['flower', 'bloom', 'bouquet', 'wildflower', 'floral', 'petal', 'meadow', 'fleur', 'fleuri', 'floraison', 'petale', 'prairie'];

export const isTintWord = (word: string) => TINTS.some((tint) => tint.words.includes(word));
