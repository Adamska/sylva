import type { LeafShape, PlantForm } from '@/types/botany';
import {
  BERRY_INDEX_COUNT,
  BERRY_VERTEX_COUNT,
  bladeIndexCount,
  bladeVertexCount,
  FoliageWriter,
  type BerrySpec,
  type BladeSpec,
} from './foliageWriter';
import type { LimbMetrics } from './limbMetrics';
import type { MeshData } from './meshData';
import { createRng } from './random';
import { ORGAN_NODE, type Skeleton } from './turtle';

interface BladeProfile {
  aspect: number;
  cluster: number;
  splayDeg: number;
  droop: number;
  fold: number;
  rows: number;
  flutter: number;
  outline: (t: number) => number;
}

export const LEAF_PROFILES: Record<LeafShape, BladeProfile> = {
  lanceolate: { aspect: 0.17, cluster: 2, splayDeg: 52, droop: 1.5, fold: 0.22, rows: 4, flutter: 1, outline: (t) => Math.sin(Math.PI * t ** 0.8) ** 0.9 },
  needle: { aspect: 0.045, cluster: 7, splayDeg: 56, droop: 0.1, fold: 0, rows: 2, flutter: 0.35, outline: (t) => 1 - t ** 4 },
  sword: {
    aspect: 0.2,
    cluster: 1,
    splayDeg: 0,
    droop: 0.4,
    fold: 0.42,
    rows: 7,
    flutter: 0.12,
    outline: (t) => (0.72 + 0.28 * Math.sin(Math.PI * Math.min(1, t / 0.55))) * (1 - t ** 1.8) ** 0.9,
  },
  ovate: { aspect: 0.56, cluster: 2, splayDeg: 58, droop: 0.7, fold: 0.18, rows: 4, flutter: 0.9, outline: (t) => Math.sin(Math.PI * t ** 0.7) ** 0.75 },
  polyp: { aspect: 0.82, cluster: 4, splayDeg: 68, droop: -0.25, fold: 0.35, rows: 3, flutter: 0.5, outline: (t) => Math.sin(Math.PI * t ** 0.9) ** 0.5 },
};

const PETAL: BladeProfile = { aspect: 0.66, cluster: 5, splayDeg: 62, droop: -0.2, fold: 0.16, rows: 3, flutter: 0.7, outline: (t) => Math.sin(Math.PI * t ** 0.72) ** 0.6 };

export const FOLIAGE_LIMITS = { maxBlades: 42_000 } as const;

const GOLDEN_ANGLE = 2.39996323;
const DEG_TO_RAD = Math.PI / 180;
const BLOSSOM_TILT_COS = Math.cos(68 * DEG_TO_RAD);
const BLOSSOM_TILT_SIN = Math.sin(68 * DEG_TO_RAD);

export interface FoliageBuild {
  mesh: MeshData;
  blades: number;
  truncated: boolean;
}

export function buildFoliageMesh(skeleton: Skeleton, limbs: LimbMetrics, form: PlantForm, seed: number, detail: number): FoliageBuild {
  const { leafCount, leafOrigins, leafHeadings, leafNormals, leafScales, leafSegments, leafRules, leafKinds } = skeleton;
  const rng = createRng(seed ^ 0x51ed270b);
  const leaf = LEAF_PROFILES[form.leafShape];
  const blossoms = form.organShape === 'blossom';
  const stride = Math.max(1, Math.round(1 / detail));
  const widen = Math.sqrt(stride);
  const leafRows = Math.max(1, Math.round(leaf.rows * detail));
  const petalRows = Math.max(1, Math.round(PETAL.rows * detail));

  let leafNodes = 0;
  let organNodes = 0;
  for (let node = 0; node < leafCount; node += stride) {
    if (leafKinds[node] === ORGAN_NODE) organNodes++;
    else leafNodes++;
  }
  const organBudget = FOLIAGE_LIMITS.maxBlades * 0.5;
  const organStep = Math.max(1, Math.ceil((organNodes * (blossoms ? PETAL.cluster : 1)) / organBudget));
  const keptOrgans = Math.ceil(organNodes / organStep);
  const petals = blossoms ? keptOrgans * PETAL.cluster : 0;
  const cluster = Math.max(1, Math.min(leaf.cluster, Math.floor((FOLIAGE_LIMITS.maxBlades - petals) / Math.max(1, leafNodes))));
  const leafBlades = leafNodes * cluster;
  const berries = blossoms ? 0 : keptOrgans;

  const writer = new FoliageWriter(
    leafBlades * bladeVertexCount(leafRows) + petals * bladeVertexCount(petalRows) + berries * BERRY_VERTEX_COUNT,
    leafBlades * bladeIndexCount(leafRows) + petals * bladeIndexCount(petalRows) + berries * BERRY_INDEX_COUNT,
  );

  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (let node = 0; node < leafCount; node++) {
    cx += leafOrigins[node * 3];
    cy += leafOrigins[node * 3 + 1];
    cz += leafOrigins[node * 3 + 2];
  }
  cx /= leafCount || 1;
  cy /= leafCount || 1;
  cz /= leafCount || 1;
  let canopyRadius = 1e-3;
  for (let node = 0; node < leafCount; node++) {
    const o = node * 3;
    canopyRadius = Math.max(canopyRadius, Math.hypot(leafOrigins[o] - cx, leafOrigins[o + 1] - cy, leafOrigins[o + 2] - cz));
  }

  const spec = { outline: leaf.outline } as BladeSpec & BerrySpec;
  let organIndex = 0;

  for (let node = 0; node < leafCount; node += stride) {
    const o = node * 3;
    let hx = leafHeadings[o];
    let hy = leafHeadings[o + 1];
    let hz = leafHeadings[o + 2];
    let ux = leafNormals[o];
    let uy = leafNormals[o + 1];
    let uz = leafNormals[o + 2];
    let lx = uy * hz - uz * hy;
    let ly = uz * hx - ux * hz;
    let lz = ux * hy - uy * hx;
    const isOrgan = leafKinds[node] === ORGAN_NODE;
    if (isOrgan && blossoms) {
      const roll = GOLDEN_ANGLE * node;
      const ax = hx * BLOSSOM_TILT_COS + (lx * Math.cos(roll) + ux * Math.sin(roll)) * BLOSSOM_TILT_SIN;
      const ay = hy * BLOSSOM_TILT_COS + (ly * Math.cos(roll) + uy * Math.sin(roll)) * BLOSSOM_TILT_SIN + 0.25;
      const az = hz * BLOSSOM_TILT_COS + (lz * Math.cos(roll) + uz * Math.sin(roll)) * BLOSSOM_TILT_SIN;
      const axisLength = Math.hypot(ax, ay, az) || 1;
      const along = (hx * ax + hy * ay + hz * az) / (axisLength * axisLength);
      lx = hx - ax * along;
      ly = hy - ay * along;
      lz = hz - az * along;
      const leftLength = Math.hypot(lx, ly, lz) || 1;
      [hx, hy, hz] = [ax / axisLength, ay / axisLength, az / axisLength];
      [lx, ly, lz] = [lx / leftLength, ly / leftLength, lz / leftLength];
      [ux, uy, uz] = [hy * lz - hz * ly, hz * lx - hx * lz, hx * ly - hy * lx];
    }
    const depth = Math.min(1, Math.hypot(leafOrigins[o] - cx, leafOrigins[o + 1] - cy, leafOrigins[o + 2] - cz) / canopyRadius);

    spec.ox = leafOrigins[o];
    spec.oy = leafOrigins[o + 1];
    spec.oz = leafOrigins[o + 2];
    spec.flex = leafSegments[node] >= 0 ? limbs.endFlex[leafSegments[node]] : 0.08;
    spec.shade = 0.5 + 0.5 * Math.min(1, Math.max(0, (depth - 0.2) / 0.65));
    spec.rule = leafRules[node];
    spec.organ = isOrgan ? 1 : 0;

    if (isOrgan && organIndex++ % organStep !== 0) continue;
    if (isOrgan && !blossoms) {
      spec.radius = form.organSize * 0.5 * leafScales[node] * (0.75 + 0.5 * rng()) * widen;
      spec.cx = spec.ox + (rng() - 0.5) * spec.radius;
      spec.cy = spec.oy - spec.radius * 1.3;
      spec.cz = spec.oz + (rng() - 0.5) * spec.radius;
      spec.phase = rng();
      writer.berry(spec);
      continue;
    }

    const profile = isOrgan ? PETAL : leaf;
    const count = isOrgan ? PETAL.cluster : cluster;
    const size = isOrgan ? form.organSize : form.leafSize;
    const turn = isOrgan ? (Math.PI * 2) / PETAL.cluster : GOLDEN_ANGLE;
    const offset = isOrgan ? rng() * Math.PI : GOLDEN_ANGLE * node * cluster;
    const organPhase = rng();
    spec.rows = isOrgan ? petalRows : leafRows;
    spec.droop = profile.droop;
    spec.fold = profile.fold;
    spec.flutter = profile.flutter;
    spec.outline = profile.outline;

    for (let blade = 0; blade < count; blade++) {
      const roll = offset + turn * blade + (isOrgan ? 0 : rng() * 0.6);
      const splay = profile.splayDeg * DEG_TO_RAD * (isOrgan ? 0.9 + 0.2 * rng() : 0.7 + 0.6 * rng());
      const radialX = lx * Math.cos(roll) + ux * Math.sin(roll);
      const radialY = ly * Math.cos(roll) + uy * Math.sin(roll);
      const radialZ = lz * Math.cos(roll) + uz * Math.sin(roll);
      const flat = profile.splayDeg === 0;
      const sx = flat ? lx : hy * radialZ - hz * radialY;
      const sy = flat ? ly : hz * radialX - hx * radialZ;
      const sz = flat ? lz : hx * radialY - hy * radialX;
      const sideLength = Math.hypot(sx, sy, sz) || 1;
      spec.dx = hx * Math.cos(splay) + radialX * Math.sin(splay);
      spec.dy = hy * Math.cos(splay) + radialY * Math.sin(splay);
      spec.dz = hz * Math.cos(splay) + radialZ * Math.sin(splay);
      spec.sx = sx / sideLength;
      spec.sy = sy / sideLength;
      spec.sz = sz / sideLength;
      spec.length = size * leafScales[node] * (isOrgan ? 0.85 + 0.3 * rng() : 0.78 + 0.44 * rng());
      spec.halfWidth = spec.length * profile.aspect * 0.5 * widen;
      spec.phase = isOrgan ? organPhase : rng();
      writer.blade(spec);
    }
  }

  return { mesh: writer.toMesh(), blades: leafBlades + petals + berries, truncated: cluster < leaf.cluster || organStep > 1 };
}
