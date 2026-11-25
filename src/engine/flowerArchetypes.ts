import type { LeafShape, OrganShape } from '@/types/botany';
import type { Archetype } from './archetypes';

type Habit = 'clump' | 'stalk' | 'tuft' | 'shrub' | 'spire' | 'spray';

export interface Flower {
  genus: string;
  words: readonly string[];
  habit: Habit;
  shape: OrganShape;
  size: number;
  petal: string;
  heart: string;
  leaf?: readonly [LeafShape, number];
}

const stem = { barkDark: '#27401f', barkLight: '#6d9a45' };
const wood = { barkDark: '#2b2118', barkLight: '#6f5a41' };
const greens = { leafDeep: '#1f4d1c', leafBright: '#74b244', subsurface: '#b9dc55', organ: '#f3d2dc', organCore: '#e8b83a', glow: 0 };
const bloom = { organShape: 'blossom', organSize: 0.12 } as const;
const ring = (pitches: readonly number[], bud: string) => pitches.map((pitch) => `[&(${pitch})${bud}]`).join('/(137.5)');

const HABITS: Record<Habit, Archetype['template']> = {
  clump: {
    grammar: {
      axiom: '[&(9)S]/(137.5)[&(20)F(0.3)S]/(137.5)[&(6)F(0.15)S]/(137.5)[&(24)S]/(137.5)[&(15)F(0.4)S]',
      rules: [{ symbol: 'S', successor: '[&(24)L(0.7)]/(150)[&(34)L(0.6)]/(100)F(1.2)^(3)F(1.1)^(3)F(1)K' }],
      iterations: 2,
      angleDeg: 30,
      stepLength: 0.62,
      radiusScale: 0.9,
      tropismGravity: -0.04,
    },
    form: { trunkRadius: 0.035, lengthDecay: 1, angleJitter: 0.2, leafShape: 'sword', leafSize: 1.5, ...bloom },
    palette: { ...stem, ...greens },
    mood: 'dawn',
  },
  stalk: {
    grammar: {
      axiom: 'F(0.9)A&(38)F(0.5)K',
      rules: [{ symbol: 'A', successor: 'F[&(64)F(0.3)L]/(137.5)&(3)A' }],
      iterations: 9,
      angleDeg: 30,
      stepLength: 0.36,
      radiusScale: 0.9,
      tropismGravity: -0.05,
    },
    form: { trunkRadius: 0.07, lengthDecay: 0.9, angleJitter: 0.16, leafShape: 'ovate', leafSize: 0.6, ...bloom },
    palette: { ...stem, ...greens },
    mood: 'goldenHour',
  },
  tuft: {
    grammar: {
      axiom: ring([10, 26, 17, 34, 7, 30], 'A'),
      rules: [{ symbol: 'A', successor: 'F[&(48)L]/(137.5)F[&(52)L][&(30)\\(40)F[&(50)L]F(0.8)K]/(137.5)[&(24)F(0.7)F(0.6)K]/(137.5)^(5)F(1.1)F(0.9)K' }],
      iterations: 2,
      angleDeg: 30,
      stepLength: 0.44,
      radiusScale: 0.86,
      tropismGravity: 0.04,
    },
    form: { trunkRadius: 0.03, lengthDecay: 0.92, angleJitter: 0.3, leafShape: 'lanceolate', leafSize: 0.22, ...bloom },
    palette: { ...stem, ...greens },
    mood: 'dawn',
  },
  shrub: {
    grammar: {
      axiom: '[&(16)A]/(118)[&(24)A]/(127)[&(12)A]/(115)[&(28)A]',
      rules: [
        { symbol: 'A', successor: 'FLL[+(32)/(40)AK]/(137.5)[-(28)AK]' },
        { symbol: 'K', successor: '' },
      ],
      iterations: 5,
      angleDeg: 30,
      stepLength: 0.46,
      radiusScale: 0.72,
      tropismGravity: 0.06,
    },
    form: { trunkRadius: 0.075, lengthDecay: 0.9, angleJitter: 0.34, leafShape: 'ovate', leafSize: 0.2, ...bloom },
    palette: { ...wood, ...greens },
    mood: 'studio',
  },
  spire: {
    grammar: {
      axiom: ring([8, 18, 12, 24, 15, 5], 'S'),
      rules: [
        { symbol: 'S', successor: 'F[&(50)L]/(137.5)F[&(56)L]/(137.5)F[&(60)L]/(137.5)F(1.2)P' },
        { symbol: 'P', successor: 'F(0.12)[&(74)K]/(137.5)F(0.12)[&(74)K]/(137.5)F(0.12)[&(74)K]/(137.5)P' },
      ],
      iterations: 8,
      angleDeg: 30,
      stepLength: 0.4,
      radiusScale: 0.9,
      tropismGravity: -0.03,
    },
    form: { trunkRadius: 0.028, lengthDecay: 1, angleJitter: 0.2, leafShape: 'lanceolate', leafSize: 0.3, ...bloom },
    palette: { ...stem, ...greens },
    mood: 'dawn',
  },
  spray: {
    grammar: {
      axiom: 'F(0.7)AB',
      rules: [
        { symbol: 'A', successor: 'F[&(56)L]/(137.5)&(3)A' },
        { symbol: 'B', successor: '[&(42)F(0.9)^(14)F(0.5)K]/(120)[&(50)F(0.8)^(18)F(0.4)K]/(120)[&(36)F(1)^(10)F(0.5)K]F(0.6)K' },
      ],
      iterations: 8,
      angleDeg: 30,
      stepLength: 0.36,
      radiusScale: 0.88,
      tropismGravity: -0.04,
    },
    form: { trunkRadius: 0.05, lengthDecay: 0.9, angleJitter: 0.18, leafShape: 'lanceolate', leafSize: 0.5, ...bloom },
    palette: { ...stem, ...greens },
    mood: 'studio',
  },
};

export const FLOWER_WORDS = ['flower', 'bloom', 'bouquet', 'wildflower', 'floral', 'petal', 'meadow'] as const;

export const FLOWERS: readonly Flower[] = [
  { genus: 'Tulipa', words: ['tulip'], habit: 'clump', shape: 'tulip', size: 0.42, petal: '#d8263f', heart: '#2b2a1c' },
  { genus: 'Crocus', words: ['crocus', 'saffron'], habit: 'clump', shape: 'tulip', size: 0.32, petal: '#8a5fd0', heart: '#f2a01e' },
  { genus: 'Narcissus', words: ['daffodil', 'narcissus', 'jonquil'], habit: 'clump', shape: 'poppy', size: 0.3, petal: '#f6d83a', heart: '#f08a1c' },
  { genus: 'Iris', words: ['iris', 'gladiolus'], habit: 'clump', shape: 'lily', size: 0.4, petal: '#6a4fc8', heart: '#f3c93c' },
  { genus: 'Allium', words: ['allium', 'chive', 'agapanthus'], habit: 'clump', shape: 'pompom', size: 0.34, petal: '#9a63c9', heart: '#7a4aa8' },
  { genus: 'Galanthus', words: ['snowdrop'], habit: 'clump', shape: 'bell', size: 0.22, petal: '#f4f6ee', heart: '#8fbf5a' },
  { genus: 'Nelumbo', words: ['lotus', 'water lily', 'waterlily'], habit: 'clump', shape: 'rose', size: 0.44, petal: '#f3a6c4', heart: '#f1c84a', leaf: ['ovate', 0.6] },
  { genus: 'Helianthus', words: ['sunflower'], habit: 'stalk', shape: 'sunflower', size: 0.5, petal: '#f4b81f', heart: '#3b2416' },
  { genus: 'Bellis', words: ['daisy', 'marguerite', 'chamomile', 'camomile', 'aster', 'oxeye'], habit: 'tuft', shape: 'daisy', size: 0.24, petal: '#f7f5ec', heart: '#f0bd2e' },
  { genus: 'Echinacea', words: ['coneflower', 'echinacea', 'cosmos'], habit: 'tuft', shape: 'daisy', size: 0.26, petal: '#d9659f', heart: '#a5521f' },
  { genus: 'Gerbera', words: ['gerbera', 'zinnia'], habit: 'tuft', shape: 'daisy', size: 0.28, petal: '#f0622e', heart: '#3a2416' },
  { genus: 'Centaurea', words: ['cornflower', 'chicory'], habit: 'tuft', shape: 'daisy', size: 0.2, petal: '#3f6fe0', heart: '#2c2f8a' },
  { genus: 'Papaver', words: ['poppy'], habit: 'tuft', shape: 'poppy', size: 0.3, petal: '#e0301e', heart: '#1c1a17', leaf: ['ovate', 0.16] },
  { genus: 'Ranunculus', words: ['buttercup', 'ranunculus', 'primrose'], habit: 'tuft', shape: 'poppy', size: 0.18, petal: '#f5d223', heart: '#d99a1a', leaf: ['ovate', 0.16] },
  { genus: 'Anemone', words: ['anemone', 'geranium', 'petunia'], habit: 'tuft', shape: 'poppy', size: 0.24, petal: '#e58fc0', heart: '#f0c63a', leaf: ['ovate', 0.18] },
  { genus: 'Viola', words: ['violet', 'pansy', 'viola'], habit: 'tuft', shape: 'poppy', size: 0.17, petal: '#6b3fc4', heart: '#f5c531', leaf: ['ovate', 0.16] },
  { genus: 'Myosotis', words: ['forget me not', 'forget-me-not', 'flax'], habit: 'tuft', shape: 'blossom', size: 0.11, petal: '#6fa8f0', heart: '#f5d94a' },
  { genus: 'Taraxacum', words: ['dandelion'], habit: 'tuft', shape: 'pompom', size: 0.2, petal: '#f7d21e', heart: '#e0a81a' },
  { genus: 'Tagetes', words: ['marigold', 'calendula'], habit: 'tuft', shape: 'pompom', size: 0.24, petal: '#f08a18', heart: '#c8601a' },
  { genus: 'Dahlia', words: ['dahlia', 'chrysanthemum', 'carnation', 'thistle', 'clover'], habit: 'tuft', shape: 'pompom', size: 0.28, petal: '#e04a7a', heart: '#b0305a' },
  { genus: 'Rosa', words: ['rose'], habit: 'shrub', shape: 'rose', size: 0.26, petal: '#c81e3c', heart: '#f0c63a' },
  { genus: 'Paeonia', words: ['peony', 'camellia'], habit: 'shrub', shape: 'rose', size: 0.32, petal: '#f08db4', heart: '#f0c63a' },
  { genus: 'Gardenia', words: ['gardenia', 'jasmine'], habit: 'shrub', shape: 'blossom', size: 0.17, petal: '#f6f3e8', heart: '#f0d46a' },
  { genus: 'Hibiscus', words: ['hibiscus', 'azalea', 'rhododendron'], habit: 'shrub', shape: 'poppy', size: 0.3, petal: '#e8324f', heart: '#f5cf3d' },
  { genus: 'Hydrangea', words: ['hydrangea'], habit: 'shrub', shape: 'pompom', size: 0.3, petal: '#7f9de8', heart: '#5f7ac8' },
  { genus: 'Syringa', words: ['lilac', 'buddleia'], habit: 'shrub', shape: 'pompom', size: 0.26, petal: '#b48ae0', heart: '#8a62c0' },
  { genus: 'Lavandula', words: ['lavender', 'salvia', 'sage', 'heather'], habit: 'spire', shape: 'bell', size: 0.08, petal: '#8f6fd6', heart: '#6a4fb0', leaf: ['needle', 0.16] },
  { genus: 'Lupinus', words: ['lupin', 'lupine', 'delphinium', 'larkspur', 'hyacinth', 'snapdragon'], habit: 'spire', shape: 'blossom', size: 0.13, petal: '#5b6fe0', heart: '#f0d46a', leaf: ['ovate', 0.2] },
  { genus: 'Digitalis', words: ['foxglove', 'fuchsia'], habit: 'spire', shape: 'bell', size: 0.17, petal: '#d76aa8', heart: '#8a2f5f', leaf: ['ovate', 0.26] },
  { genus: 'Hyacinthoides', words: ['bluebell', 'campanula', 'bellflower'], habit: 'spire', shape: 'bell', size: 0.15, petal: '#5f7fe6', heart: '#3f4fb0' },
  { genus: 'Convallaria', words: ['lily of the valley'], habit: 'spire', shape: 'bell', size: 0.1, petal: '#f6f6ee', heart: '#b8d48a', leaf: ['ovate', 0.3] },
  { genus: 'Lilium', words: ['lily', 'daylily', 'amaryllis'], habit: 'spray', shape: 'lily', size: 0.5, petal: '#f6f1e4', heart: '#d9731a' },
  { genus: 'Phalaenopsis', words: ['orchid'], habit: 'spray', shape: 'lily', size: 0.42, petal: '#d75fc0', heart: '#f5d04a', leaf: ['sword', 0.7] },
];

export function flowerArchetype(flower: Flower, onTree?: Archetype['template']): Archetype {
  const { grammar, form, palette, mood } = onTree ?? HABITS[flower.habit];
  const [leafShape, leafSize] = onTree ? [form.leafShape, form.leafSize] : (flower.leaf ?? [form.leafShape, form.leafSize]);
  return {
    genus: flower.genus,
    keywords: flower.words,
    blooming: true,
    template: {
      grammar,
      form: { ...form, leafShape, leafSize, organShape: flower.shape, organSize: onTree ? Math.min(flower.size, 0.2) : flower.size },
      palette: { ...palette, organ: flower.petal, organCore: flower.heart },
      mood,
    },
  };
}
