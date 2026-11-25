import type { Species } from '@/types/botany';
import { SPECIES_PRESETS } from '@/types/presets';
import { habit, ring, type Template } from './varieties';

const [cherry, willow, pine, agave, coral] = SPECIES_PRESETS.map((preset) => preset.species);
const fromPreset = ({ grammar, form, palette, mood }: Species): Template => ({ grammar, form, palette, mood });

const greens = { leafDeep: '#2c5a26', leafBright: '#93c552', subsurface: '#dfe45a', organ: '#f3d2dc', organCore: '#e8b83a', glow: 0 };
const brown = { barkDark: '#231b15', barkLight: '#77634c' };
const woodland = { ...brown, ...greens };
const regrow = (tree: Species, twig: string): Template =>
  fromPreset({ ...tree, grammar: { ...tree.grammar, rules: tree.grammar.rules.map((rule) => (rule.symbol === 'W' ? { ...rule, successor: twig } : rule)) } });

export const TREE_HABITS = {
  broadleaf: habit(
    'F(1.9)/(30)F(1.2)A',
    [
      ['A', 'FLLL[&(44)A]/(137.5)[&(34)A]/(137.5)[&(48)A]'],
      ['L', ''],
    ],
    [7, 30, 0.5, 0.68, -0.06],
    [0.2, 0.84, 0.3, 'ovate', 0.24],
    woodland,
    'goldenHour',
  ),
  cherry: fromPreset(cherry),
  willow: fromPreset(willow),
  orchard: regrow(cherry, 'F(0.45)LL/(137.5)+(14)F(0.45)L/(137.5)-(10)F(0.3)LKW'),
  cascade: regrow(willow, 'F(0.6)L/(137.5)F(0.6)K/(137.5)F(0.6)K/(137.5)F(0.6)KW'),
  pine: fromPreset(pine),
  agave: fromPreset(agave),
  coral: fromPreset(coral),
  bush: habit('[&(16)A]/(118)[&(24)A]/(127)[&(12)A]/(115)[&(28)A]', [['A', 'FLL[+(32)/(40)A]/(137.5)[-(28)A]']], [6, 30, 0.46, 0.72, 0.08], [0.07, 0.9, 0.34, 'ovate', 0.2], { ...woodland, barkDark: '#2b2118', barkLight: '#6f5a41' }, 'studio'),
  fern: habit(
    '[&(24)X]/(72)[&(34)X]/(72)[&(20)X]/(72)[&(30)X]/(72)[&(26)X]/(36)[&(48)X]/(144)[&(52)X]',
    [
      ['X', 'F[+(64)P][-(64)P]X'],
      ['P', 'F(0.6)LP'],
    ],
    [9, 60, 0.34, 0.7, 0.3],
    [0.03, 0.72, 0.12, 'lanceolate', 0.17],
    { ...woodland, barkDark: '#24301a', barkLight: '#5d7a35', leafDeep: '#1f4d24', leafBright: '#7fc24a', subsurface: '#d6ee58' },
    'studio',
  ),
  palm: habit(
    'F(1.3)&(4)F(1.3)&(3)F(1.3)^(5)F(1.3)^(4)F(1.3)C',
    [
      ['C', '[&(38)X]/(51)[&(66)X]/(51)[&(48)X]/(51)[&(84)X]/(51)[&(58)X]/(51)[&(98)X]/(51)[&(30)X]/(51)[&(74)X]'],
      ['X', 'F(0.5)[+(72)L][-(72)L]F(0.5)[+(72)L][-(72)L]X'],
    ],
    [9, 51, 0.52, 0.6, 0.85],
    [0.13, 0.5, 0.1, 'lanceolate', 0.46],
    { ...woodland, barkDark: '#2e2419', barkLight: '#8c7654', leafDeep: '#1f5a2c', leafBright: '#8fcf55', subsurface: '#e8ea5c', organ: '#d9a441', organCore: '#8a5a22' },
    'goldenHour',
  ),
  bamboo: habit(
    '[&(4)S]/(97)[&(8)f(0.6)^(3)S]/(131)[&(6)f(0.4)^(2)S]/(110)[&(10)f(0.7)^(4)S]/(125)[&(3)f(0.3)S]',
    [
      ['S', 'F[&(58)T]/(137.5)S'],
      ['T', 'F(0.25)LT'],
    ],
    [9, 40, 0.48, 0.9, 0.16],
    [0.045, 0.92, 0.16, 'lanceolate', 0.26],
    { ...woodland, barkDark: '#3c4a1c', barkLight: '#a6b44c', leafDeep: '#2d5f25', leafBright: '#a4d25a', subsurface: '#eef06a' },
    'studio',
  ),
  columnar: habit(
    'F(1.1)A',
    [
      ['A', 'F[&(26)B]/(137.5)[&(30)B]/(137.5)A'],
      ['B', 'FL[+(20)FL]/(137.5)[-(18)FL]^(7)B'],
    ],
    [9, 30, 0.3, 0.62, -0.32],
    [0.13, 0.78, 0.2, 'round', 0.14],
    woodland,
    'goldenHour',
  ),
  umbrella: habit(
    `F(2.4)/(40)F(1.6)${ring([58, 64, 52], 'A', 120)}/(60)[&(22)A]`,
    [
      ['A', 'F^(11)F[+(40)ALL/(90)LL]/(180)[-(36)ALL/(90)LL]'],
      ['L', ''],
    ],
    [6, 30, 0.4, 0.7, 0.1],
    [0.19, 0.88, 0.3, 'lanceolate', 0.2],
    { ...woodland, barkDark: '#2a2016', barkLight: '#8a6f4e' },
    'goldenHour',
  ),
  bottle: habit(
    `F(2.6)F(1.3)${ring([62, 70, 58, 66, 74], 'A', 72)}`,
    [
      ['A', 'FL[+(40)A]/(137.5)[-(34)^(20)A]'],
      ['L', ''],
    ],
    [4, 30, 0.42, 0.55, -0.1],
    [0.5, 0.8, 0.3, 'ovate', 0.13],
    { ...woodland, barkDark: '#3a2c22', barkLight: '#9a8266' },
    'goldenHour',
  ),
  birch: habit(
    'F(1.4)A',
    [
      ['A', 'F[&(46)B]/(137.5)[&(40)B]/(137.5)A'],
      ['B', 'F[+(34)C]/(137.5)[-(30)C]^(8)B'],
      ['C', 'F(0.8)LL/(137.5)C'],
    ],
    [8, 30, 0.34, 0.6, 0.35],
    [0.1, 0.84, 0.28, 'round', 0.13],
    { ...woodland, barkDark: '#34332f', barkLight: '#e6e3d8' },
    'dawn',
  ),
  cactus: habit(
    'F(1.2)F(1.1)A/(150)F(0.9)B/(100)F(0.8)C/(120)F(1)F(0.9)F(0.8)K',
    [
      ['A', '[&(86)F(1.3)^(82)F(1.2)F(1)F(0.8)K]'],
      ['B', '[&(84)F(1.1)^(84)F(1)F(0.8)K]'],
      ['C', '[&(88)F(1.2)^(80)F(0.8)K]'],
    ],
    [1, 30, 0.5, 0.93, -0.02],
    [0.2, 0.92, 0.1, 'needle', 0.1],
    { ...greens, barkDark: '#24482c', barkLight: '#5f9a5a', organ: '#f6f1e4', organCore: '#f0c63a' },
    'goldenHour',
  ),
} as const;
