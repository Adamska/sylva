import type { OrganShape } from '@/types/botany';
import { INNER_ORGAN, PETAL_ORGAN, STAMEN_ORGAN } from './foliageWriter';

export type FlowerShape = Exclude<OrganShape, 'berry'>;
type Outline = (t: number) => number;

export interface PetalWhorl {
  count: number;
  splayDeg: number;
  curlDeg: number;
  length: number;
  aspect: number;
  fold: number;
  rows: number;
  inset: number;
  turnDeg: number | null;
  tone: number;
  outline: Outline;
}

export interface FlowerProfile {
  whorls: readonly PetalWhorl[];
  core: number;
  dome: number;
  tiltDeg: number;
  lift: number;
  flutter: number;
  scatter: number;
  clearance: number;
}

const rounded: Outline = (t) => Math.sin(Math.PI * t ** 0.72) ** 0.6;
const strap: Outline = (t) => Math.min(1, t * 5) ** 0.5 * (1 - t ** 5) ** 0.5;
const pointed: Outline = (t) => Math.sin(Math.PI * t ** 0.55) ** 0.8 * (1 - 0.3 * t);
const broad: Outline = (t) => Math.sin(Math.PI * (0.08 + 0.86 * t) ** 0.8) ** 0.5;
const tongue: Outline = (t) => Math.min(1, t * 4) ** 0.5 * (1 - 0.55 * t ** 3);
const anther: Outline = (t) => (t > 0.8 ? 2.6 : 1);

function whorl(count: number, splayDeg: number, curlDeg: number, length: number, aspect: number, outline: Outline, extra: Partial<PetalWhorl> = {}): PetalWhorl {
  return { count, splayDeg, curlDeg, length, aspect, outline, fold: 0.2, rows: 3, inset: 0, turnDeg: null, tone: PETAL_ORGAN, ...extra };
}

const stamens = (count: number, splayDeg: number, length: number) => whorl(count, splayDeg, 14, length, 0.045, anther, { fold: 0, rows: 2, tone: STAMEN_ORGAN });

export const FLOWER_PROFILES: Record<FlowerShape, FlowerProfile> = {
  blossom: { whorls: [whorl(5, 62, -12, 1, 0.66, rounded, { fold: 0.16 })], core: 0, dome: 1, tiltDeg: 68, lift: 0.25, flutter: 0.7, scatter: 0.1, clearance: 0 },
  daisy: {
    whorls: [whorl(18, 78, 14, 1, 0.26, strap, { fold: 0.08, inset: 0.24 })],
    core: 0.28,
    dome: 0.55,
    tiltDeg: 0,
    lift: 0.2,
    flutter: 0.35,
    scatter: 0.05, clearance: 0.7,
  },
  sunflower: {
    whorls: [whorl(20, 80, 12, 0.7, 0.36, pointed, { inset: 0.5 }), whorl(14, 66, 8, 0.6, 0.34, pointed, { inset: 0.48 })],
    core: 0.55,
    dome: 0.3,
    tiltDeg: 0,
    lift: 0,
    flutter: 0.12,
    scatter: 0.06, clearance: 0.9,
  },
  tulip: {
    whorls: [whorl(3, 40, -52, 1, 0.74, broad, { fold: 0.32, rows: 5 }), whorl(3, 34, -46, 0.96, 0.7, broad, { fold: 0.32, rows: 5 })],
    core: 0.09,
    dome: 1.6,
    tiltDeg: 0,
    lift: 0.5,
    flutter: 0.15,
    scatter: 0.04, clearance: 0.55,
  },
  rose: {
    whorls: [
      whorl(5, 74, -58, 1, 0.95, broad, { fold: 0.3, rows: 4 }),
      whorl(5, 54, -50, 0.84, 0.9, broad, { fold: 0.3, rows: 4 }),
      whorl(4, 34, -36, 0.68, 0.85, broad, { fold: 0.3 }),
      whorl(3, 16, -14, 0.52, 0.8, broad, { fold: 0.3 }),
    ],
    core: 0,
    dome: 1,
    tiltDeg: 0,
    lift: 0.35,
    flutter: 0.25,
    scatter: 0.08, clearance: 0.6,
  },
  lily: {
    whorls: [whorl(3, 30, 95, 1, 0.3, pointed, { fold: 0.3, rows: 5 }), whorl(3, 26, 85, 0.96, 0.26, pointed, { fold: 0.3, rows: 5 }), stamens(6, 12, 0.8)],
    core: 0,
    dome: 1,
    tiltDeg: 0,
    lift: 0.1,
    flutter: 0.3,
    scatter: 0.05, clearance: 0.5,
  },
  bell: { whorls: [whorl(5, 10, 62, 1, 0.62, broad, { fold: 0.5, rows: 4 })], core: 0, dome: 1, tiltDeg: 0, lift: -1.6, flutter: 0.55, scatter: 0.05, clearance: 0 },
  poppy: {
    whorls: [whorl(3, 62, -40, 1, 0.98, broad, { fold: 0.3, rows: 4 }), whorl(3, 54, -34, 0.94, 0.94, broad, { fold: 0.3, rows: 4 }), stamens(10, 40, 0.3)],
    core: 0.14,
    dome: 1.2,
    tiltDeg: 0,
    lift: 0.45,
    flutter: 0.6,
    scatter: 0.1, clearance: 0.6,
  },
  pompom: {
    whorls: [
      whorl(6, 25, -20, 0.62, 0.42, tongue, { rows: 2 }),
      whorl(10, 55, -20, 0.62, 0.42, tongue, { rows: 2 }),
      whorl(13, 85, -20, 0.62, 0.42, tongue, { rows: 2 }),
      whorl(12, 115, -20, 0.6, 0.42, tongue, { rows: 2 }),
      whorl(9, 145, -20, 0.56, 0.42, tongue, { rows: 2 }),
    ],
    core: 0.3,
    dome: 1,
    tiltDeg: 0,
    lift: 0.2,
    flutter: 0.2,
    scatter: 0.12, clearance: 0.5,
  },
  mum: {
    whorls: [
      whorl(18, 80, -22, 1, 0.2, tongue),
      whorl(16, 64, -28, 0.92, 0.2, tongue),
      whorl(14, 48, -32, 0.8, 0.2, tongue),
      whorl(11, 32, -32, 0.66, 0.22, tongue, { rows: 2 }),
      whorl(7, 16, -24, 0.5, 0.24, tongue, { rows: 2 }),
    ],
    core: 0.12,
    dome: 0.8,
    tiltDeg: 0,
    lift: 0.2,
    flutter: 0.25,
    scatter: 0.1,
    clearance: 0.7,
  },
  trumpet: {
    whorls: [whorl(6, 80, 6, 1, 0.5, pointed), whorl(6, 14, 18, 0.56, 0.62, broad, { fold: 0.5, tone: INNER_ORGAN }), stamens(5, 6, 0.4)],
    core: 0,
    dome: 1,
    tiltDeg: 0,
    lift: 0.1,
    flutter: 0.35,
    scatter: 0.05,
    clearance: 0.6,
  },
  star: {
    whorls: [whorl(5, 78, 8, 1, 0.34, pointed, { fold: 0.15 }), stamens(5, 22, 0.3)],
    core: 0.1,
    dome: 0.8,
    tiltDeg: 0,
    lift: 0.25,
    flutter: 0.5,
    scatter: 0.06,
    clearance: 0.4,
  },
  orchid: {
    whorls: [
      whorl(3, 76, 6, 1, 0.3, pointed),
      whorl(2, 74, -6, 0.94, 0.78, rounded),
      whorl(1, 48, -34, 0.62, 0.8, broad, { fold: 0.45, turnDeg: 180, tone: INNER_ORGAN }),
    ],
    core: 0.08,
    dome: 1.4,
    tiltDeg: 0,
    lift: 0.1,
    flutter: 0.3,
    scatter: 0.04,
    clearance: 0.5,
  },
  calla: {
    whorls: [whorl(1, 22, 40, 1, 1.15, pointed, { fold: 0.8, rows: 5 })],
    core: 0.075,
    dome: 5,
    tiltDeg: 0,
    lift: 0.3,
    flutter: 0.2,
    scatter: 0.04,
    clearance: 0.5,
  },
};
