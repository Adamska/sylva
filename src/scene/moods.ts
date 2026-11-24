import type { LightingMood } from '@/types/botany';

type Position = readonly [number, number, number];

export interface MoodPreset {
  label: string;
  backdrop: string;
  halo: string;
  keyColor: string;
  keyIntensity: number;
  keyPosition: Position;
  backColor: string;
  backIntensity: number;
  backPosition: Position;
  skyColor: string;
  groundColor: string;
  rimColor: string;
  exposure: number;
}

export const MOODS: Record<LightingMood, MoodPreset> = {
  goldenHour: {
    label: 'Golden hour',
    backdrop: '#07070a',
    halo: '#6b3a16',
    keyColor: '#ffd3a1',
    keyIntensity: 1.9,
    keyPosition: [4.5, 5.2, 5.5],
    backColor: '#ff9a45',
    backIntensity: 2.6,
    backPosition: [-3.2, 2.6, -6.5],
    skyColor: '#2b3242',
    groundColor: '#1c130c',
    rimColor: '#ffb873',
    exposure: 1.05,
  },
  studio: {
    label: 'Studio',
    backdrop: '#08090b',
    halo: '#3a3f47',
    keyColor: '#fff3e2',
    keyIntensity: 2.1,
    keyPosition: [5, 6.5, 4.5],
    backColor: '#dbe8ff',
    backIntensity: 2.2,
    backPosition: [-4, 4.2, -6],
    skyColor: '#3b4049',
    groundColor: '#16171b',
    rimColor: '#f4f7ff',
    exposure: 1,
  },
  moonlit: {
    label: 'Moonlit',
    backdrop: '#05070c',
    halo: '#1d3358',
    keyColor: '#a9c1ff',
    keyIntensity: 1.5,
    keyPosition: [-4.5, 6.5, 4],
    backColor: '#d9f1ff',
    backIntensity: 2.4,
    backPosition: [3.5, 3.4, -6.5],
    skyColor: '#16223d',
    groundColor: '#07090f',
    rimColor: '#9cc0ff',
    exposure: 1.1,
  },
  abyssal: {
    label: 'Abyssal',
    backdrop: '#030509',
    halo: '#0b3a52',
    keyColor: '#5fd8d2',
    keyIntensity: 1,
    keyPosition: [3.5, 6, 5],
    backColor: '#ff58d6',
    backIntensity: 1.5,
    backPosition: [-3, 3, -6.5],
    skyColor: '#0a1c38',
    groundColor: '#03040a',
    rimColor: '#5ee6ff',
    exposure: 1.15,
  },
};
