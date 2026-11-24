import { SPECIES_PRESETS, type Species } from '@/types/botany';

export interface Archetype {
  genus: string;
  keywords: readonly string[];
  template: Omit<Species, 'name' | 'latin' | 'seed'>;
}

const [willow, pine, agave, coral] = SPECIES_PRESETS.map((preset) => preset.species);
const fromPreset = ({ grammar, form, palette, mood }: Species): Archetype['template'] => ({ grammar, form, palette, mood });

const leafGreens = { leafDeep: '#2c5a26', leafBright: '#93c552', subsurface: '#dfe45a', glow: 0 };

export const DEFAULT_ARCHETYPE: Archetype = {
  genus: 'Quercus',
  keywords: ['oak', 'maple', 'beech', 'elm', 'birch', 'ash', 'tree', 'broadleaf', 'deciduous', 'cherry', 'apple', 'sakura', 'baobab'],
  template: {
    grammar: {
      axiom: 'F(1.9)/(30)F(1.2)A',
      rules: [
        { symbol: 'A', successor: 'FLLL[&(44)A]/(137.5)[&(34)A]/(137.5)[&(48)A]' },
        { symbol: 'L', successor: '' },
      ],
      iterations: 7,
      angleDeg: 30,
      stepLength: 0.5,
      radiusScale: 0.68,
      tropismGravity: -0.06,
    },
    form: { trunkRadius: 0.2, lengthDecay: 0.84, angleJitter: 0.3, leafShape: 'ovate', leafSize: 0.24 },
    palette: { barkDark: '#231b15', barkLight: '#77634c', ...leafGreens },
    mood: 'goldenHour',
  },
};

export const ARCHETYPES: readonly Archetype[] = [
  { genus: 'Salix', keywords: ['willow', 'weeping', 'drooping', 'cascade', 'cascading', 'wisteria', 'pendulous'], template: fromPreset(willow) },
  { genus: 'Pinus', keywords: ['pine', 'fir', 'spruce', 'cedar', 'juniper', 'cypress', 'yew', 'conifer', 'larch', 'redwood', 'sequoia', 'christmas', 'evergreen'], template: fromPreset(pine) },
  { genus: 'Agave', keywords: ['agave', 'aloe', 'succulent', 'yucca', 'rosette', 'bromeliad', 'pineapple', 'cactus', 'desert'], template: fromPreset(agave) },
  { genus: 'Corallodendron', keywords: ['coral', 'alien', 'bioluminescent', 'neon', 'crystal', 'reef', 'fungus', 'mushroom', 'abyss', 'nebula'], template: fromPreset(coral) },
  {
    genus: 'Rosa',
    keywords: ['bush', 'shrub', 'rose', 'lavender', 'sage', 'berry', 'hedge', 'tea', 'thicket', 'bramble'],
    template: {
      grammar: {
        axiom: '[&(16)A]/(118)[&(24)A]/(127)[&(12)A]/(115)[&(28)A]',
        rules: [{ symbol: 'A', successor: 'FLL[+(32)/(40)A]/(137.5)[-(28)A]' }],
        iterations: 6,
        angleDeg: 30,
        stepLength: 0.46,
        radiusScale: 0.72,
        tropismGravity: 0.08,
      },
      form: { trunkRadius: 0.07, lengthDecay: 0.9, angleJitter: 0.34, leafShape: 'ovate', leafSize: 0.2 },
      palette: { barkDark: '#2b2118', barkLight: '#6f5a41', ...leafGreens },
      mood: 'studio',
    },
  },
  {
    genus: 'Dryopteris',
    keywords: ['fern', 'frond', 'bracken', 'moss', 'undergrowth', 'rainforest floor'],
    template: {
      grammar: {
        axiom: '[&(24)X]/(72)[&(34)X]/(72)[&(20)X]/(72)[&(30)X]/(72)[&(26)X]/(36)[&(48)X]/(144)[&(52)X]',
        rules: [
          { symbol: 'X', successor: 'F[+(64)P][-(64)P]X' },
          { symbol: 'P', successor: 'F(0.6)LP' },
        ],
        iterations: 9,
        angleDeg: 60,
        stepLength: 0.34,
        radiusScale: 0.7,
        tropismGravity: 0.3,
      },
      form: { trunkRadius: 0.03, lengthDecay: 0.72, angleJitter: 0.12, leafShape: 'lanceolate', leafSize: 0.17 },
      palette: { barkDark: '#24301a', barkLight: '#5d7a35', leafDeep: '#1f4d24', leafBright: '#7fc24a', subsurface: '#d6ee58', glow: 0 },
      mood: 'studio',
    },
  },
  {
    genus: 'Phoenix',
    keywords: ['palm', 'coconut', 'cycad', 'date', 'tropical', 'island', 'oasis'],
    template: {
      grammar: {
        axiom: 'F(1.3)&(4)F(1.3)&(3)F(1.3)^(5)F(1.3)^(4)F(1.3)C',
        rules: [
          { symbol: 'C', successor: '[&(38)X]/(51)[&(66)X]/(51)[&(48)X]/(51)[&(84)X]/(51)[&(58)X]/(51)[&(98)X]/(51)[&(30)X]/(51)[&(74)X]' },
          { symbol: 'X', successor: 'F(0.5)[+(72)L][-(72)L]F(0.5)[+(72)L][-(72)L]X' },
        ],
        iterations: 9,
        angleDeg: 51,
        stepLength: 0.52,
        radiusScale: 0.6,
        tropismGravity: 0.85,
      },
      form: { trunkRadius: 0.13, lengthDecay: 0.5, angleJitter: 0.1, leafShape: 'lanceolate', leafSize: 0.46 },
      palette: { barkDark: '#2e2419', barkLight: '#8c7654', leafDeep: '#1f5a2c', leafBright: '#8fcf55', subsurface: '#e8ea5c', glow: 0 },
      mood: 'goldenHour',
    },
  },
  {
    genus: 'Phyllostachys',
    keywords: ['bamboo', 'reed', 'grass', 'cane', 'papyrus', 'stalk', 'wheat'],
    template: {
      grammar: {
        axiom: '[&(4)S]/(97)[&(8)f(0.6)^(3)S]/(131)[&(6)f(0.4)^(2)S]/(110)[&(10)f(0.7)^(4)S]/(125)[&(3)f(0.3)S]',
        rules: [
          { symbol: 'S', successor: 'F[&(58)T]/(137.5)S' },
          { symbol: 'T', successor: 'F(0.25)LT' },
        ],
        iterations: 9,
        angleDeg: 40,
        stepLength: 0.48,
        radiusScale: 0.9,
        tropismGravity: 0.16,
      },
      form: { trunkRadius: 0.045, lengthDecay: 0.92, angleJitter: 0.16, leafShape: 'lanceolate', leafSize: 0.26 },
      palette: { barkDark: '#3c4a1c', barkLight: '#a6b44c', leafDeep: '#2d5f25', leafBright: '#a4d25a', subsurface: '#eef06a', glow: 0 },
      mood: 'studio',
    },
  },
];
