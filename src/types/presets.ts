import type { Species } from './botany';

export interface SpeciesPreset {
  id: string;
  species: Species;
}

export const SPECIES_PRESETS: readonly SpeciesPreset[] = [
  {
    id: 'mountain-cherry',
    species: {
      name: 'Mountain Cherry',
      latin: 'Prunus serrulata',
      grammar: {
        axiom: 'F(2.6)/(25)F(1.5)[&(38)X]/(125)[&(46)X]/(112)[&(34)X]/(133)[&(50)X]',
        rules: [
          { symbol: 'X', successor: 'FF[\\(50)&(40)Y]/(137.5)[&(32)Y]/(105)[&(12)Y]' },
          { symbol: 'Y', successor: 'FF[\\(60)&(44)Z]/(137.5)[&(36)Z]/(110)[&(14)Z]' },
          { symbol: 'Z', successor: 'F[&(52)W]/(137.5)F[&(44)W]/(137.5)F[&(38)W]/(137.5)[&(16)W]' },
          { symbol: 'W', successor: 'F(0.45)K/(137.5)+(14)F(0.45)KL/(137.5)-(10)W' },
        ],
        iterations: 7,
        angleDeg: 30,
        stepLength: 0.3,
        radiusScale: 0.66,
        tropismGravity: 0.1,
      },
      form: { trunkRadius: 0.17, lengthDecay: 0.9, angleJitter: 0.36, leafShape: 'ovate', leafSize: 0.12, organShape: 'blossom', organSize: 0.14 },
      palette: {
        barkDark: '#221616',
        barkLight: '#6d4d47',
        leafDeep: '#3f5a2a',
        leafBright: '#a9c56a',
        subsurface: '#ffd9a8',
        organ: '#ffc4d6',
        glow: 0,
      },
      mood: 'dawn',
      seed: 2026,
    },
  },
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
      form: { trunkRadius: 0.2, lengthDecay: 0.88, angleJitter: 0.22, leafShape: 'lanceolate', leafSize: 0.26, organShape: 'blossom', organSize: 0.12 },
      palette: {
        barkDark: '#2a2019',
        barkLight: '#7b6650',
        leafDeep: '#27521f',
        leafBright: '#86bd45',
        subsurface: '#c9e24a',
        organ: '#e9e2a0',
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
      form: { trunkRadius: 0.14, lengthDecay: 0.6, angleJitter: 0.14, leafShape: 'needle', leafSize: 0.2, organShape: 'berry', organSize: 0.12 },
      palette: {
        barkDark: '#241a15',
        barkLight: '#8a5f43',
        leafDeep: '#12352b',
        leafBright: '#4f8f62',
        subsurface: '#b6d96a',
        organ: '#7a4f2e',
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
      form: { trunkRadius: 0.2, lengthDecay: 1, angleJitter: 0.1, leafShape: 'sword', leafSize: 2.2, organShape: 'blossom', organSize: 0.12 },
      palette: {
        barkDark: '#3a3527',
        barkLight: '#8d8667',
        leafDeep: '#2f5c57',
        leafBright: '#9fc7ae',
        subsurface: '#d9f08a',
        organ: '#ead86c',
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
      form: { trunkRadius: 0.17, lengthDecay: 0.86, angleJitter: 0.3, leafShape: 'polyp', leafSize: 0.085, organShape: 'blossom', organSize: 0.12 },
      palette: {
        barkDark: '#0b1f33',
        barkLight: '#2b6f8f',
        leafDeep: '#0f5fa8',
        leafBright: '#3fe9ff',
        subsurface: '#ff4fc8',
        organ: '#ff7ad9',
        glow: 0.85,
      },
      mood: 'abyssal',
      seed: 90210,
    },
  },
];

export const DEFAULT_PRESET = SPECIES_PRESETS[0];
