import type { LeafShape, PlantForm } from '@/types/botany';
import { bladeIndexCount, bladeVertexCount, FoliageWriter, LEAF_ORGAN } from './foliageWriter';
import type { LimbMetrics } from './limbMetrics';
import type { MeshData } from './meshData';
import { measureLeafRoom } from './leafRoom';
import { planOrgans, type OrganFrame, type OrganScratch } from './organBuilder';
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
  fanDeg?: number;
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
    flutter: 0.04,
    outline: (t) => (0.72 + 0.28 * Math.sin(Math.PI * Math.min(1, t / 0.55))) * (1 - t ** 1.8) ** 0.9,
  },
  ovate: { aspect: 0.56, cluster: 2, splayDeg: 58, droop: 0.7, fold: 0.18, rows: 4, flutter: 0.9, outline: (t) => Math.sin(Math.PI * t ** 0.7) ** 0.75 },
  polyp: { aspect: 0.82, cluster: 4, splayDeg: 68, droop: -0.25, fold: 0.35, rows: 3, flutter: 0.5, outline: (t) => Math.sin(Math.PI * t ** 0.9) ** 0.5 },
  lobed: {
    aspect: 0.52,
    cluster: 2,
    splayDeg: 56,
    droop: 0.7,
    fold: 0.14,
    rows: 6,
    flutter: 0.85,
    outline: (t) => Math.sin(Math.PI * t ** 0.75) ** 0.7 * (0.74 + 0.26 * Math.cos(6 * Math.PI * t)),
  },
  round: { aspect: 0.96, cluster: 2, splayDeg: 60, droop: 0.5, fold: 0.1, rows: 5, flutter: 1, outline: (t) => Math.sqrt(Math.max(0, 1 - (2 * t - 1) ** 2)) },
  palmate: { aspect: 0.3, cluster: 5, splayDeg: 58, droop: 0.6, fold: 0.16, rows: 3, flutter: 0.8, fanDeg: 38, outline: (t) => Math.sin(Math.PI * t ** 0.6) ** 0.8 },
};

export const FOLIAGE_LIMITS = { maxBlades: 42_000, maxOrganVertices: 90_000 } as const;

const GOLDEN_ANGLE = 2.39996323;
const DEG_TO_RAD = Math.PI / 180;
const SPARSE_NODES = 240;

export interface FoliageBuild {
  mesh: MeshData;
  blades: number;
  truncated: boolean;
}

export function buildFoliageMesh(skeleton: Skeleton, limbs: LimbMetrics, form: PlantForm, seed: number, detail: number): FoliageBuild {
  const { leafCount, leafOrigins, leafHeadings, leafNormals, leafScales, leafSegments, leafRules, leafKinds } = skeleton;
  const rng = createRng(seed ^ 0x51ed270b);
  const leaf = LEAF_PROFILES[form.leafShape];
  const organs = planOrgans(form.organShape, detail);
  const leafRows = Math.max(1, Math.round(leaf.rows * detail));

  let organNodes = 0;
  for (let node = 0; node < leafCount; node++) if (leafKinds[node] === ORGAN_NODE) organNodes++;
  const leafNodes = leafCount - organNodes;
  const thin = (count: number) => Math.max(1, Math.min(Math.round(1 / detail), Math.floor(count / SPARSE_NODES)));
  const leafStride = thin(leafNodes);
  const organThin = thin(organNodes);
  const organBudget = Math.min(FOLIAGE_LIMITS.maxBlades * 0.5, (FOLIAGE_LIMITS.maxOrganVertices / organs.vertices) * organs.blades);
  const organStride = Math.max(organThin, Math.ceil((organNodes * organs.blades) / organBudget));
  const keptLeaves = Math.ceil(leafNodes / leafStride);
  const keptOrgans = Math.ceil(organNodes / organStride);
  const organBlades = keptOrgans * organs.blades;
  const cluster = Math.max(1, Math.min(leaf.cluster, Math.floor((FOLIAGE_LIMITS.maxBlades - organBlades) / Math.max(1, keptLeaves))));
  const leafBlades = keptLeaves * cluster;
  const leafWiden = Math.sqrt(leafStride);
  const organWiden = Math.sqrt(organThin);

  const writer = new FoliageWriter(
    leafBlades * bladeVertexCount(leafRows) + keptOrgans * organs.vertices,
    leafBlades * bladeIndexCount(leafRows) + keptOrgans * organs.indices,
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

  const room = measureLeafRoom(skeleton, organs.clearance * form.organSize, form.leafSize * 1.25);
  const fan = (leaf.fanDeg ?? 0) * DEG_TO_RAD;
  const spec = { outline: leaf.outline } as OrganScratch;
  const frame = {} as OrganFrame;
  const flat = leaf.splayDeg === 0;
  let leafSeen = 0;
  let organSeen = 0;
  let [stemX, stemY, stemZ, sideX, sideY, sideZ] = [0, 1, 0, 1, 0, 0];

  for (let node = 0; node < leafCount; node++) {
    const isOrgan = leafKinds[node] === ORGAN_NODE;
    if ((isOrgan ? organSeen++ % organStride : leafSeen++ % leafStride) !== 0) continue;
    const o = node * 3;
    const hx = (frame.hx = leafHeadings[o]);
    const hy = (frame.hy = leafHeadings[o + 1]);
    const hz = (frame.hz = leafHeadings[o + 2]);
    const ux = (frame.ux = leafNormals[o]);
    const uy = (frame.uy = leafNormals[o + 1]);
    const uz = (frame.uz = leafNormals[o + 2]);
    const lx = (frame.lx = uy * hz - uz * hy);
    const ly = (frame.ly = uz * hx - ux * hz);
    const lz = (frame.lz = ux * hy - uy * hx);
    const depth = Math.min(1, Math.hypot(leafOrigins[o] - cx, leafOrigins[o + 1] - cy, leafOrigins[o + 2] - cz) / canopyRadius);

    spec.ox = leafOrigins[o];
    spec.oy = leafOrigins[o + 1];
    spec.oz = leafOrigins[o + 2];
    spec.flex = leafSegments[node] >= 0 ? limbs.endFlex[leafSegments[node]] : 0.08;
    spec.shade = 0.5 + 0.5 * Math.min(1, Math.max(0, (depth - 0.2) / 0.65));
    spec.rule = leafRules[node];
    if (isOrgan) {
      organs.write(writer, spec, frame, node, form.organSize * leafScales[node], organWiden, rng);
      continue;
    }

    const offset = GOLDEN_ANGLE * node * cluster;
    spec.organ = LEAF_ORGAN;
    spec.rows = leafRows;
    spec.droop = leaf.droop;
    spec.curl = 0;
    spec.fold = leaf.fold;
    spec.flutter = leaf.flutter;
    spec.outline = leaf.outline;
    spec.rx = spec.ry = spec.rz = 0;

    const reach = room ? room[node] : Infinity;
    for (let blade = 0; blade < cluster; blade++) {
      const spoke = fan * (blade - (cluster - 1) / 2);
      if (fan === 0 || blade === 0) {
        const roll = offset + GOLDEN_ANGLE * blade + rng() * 0.6;
        const splay = leaf.splayDeg * DEG_TO_RAD * (0.7 + 0.6 * rng());
        const radialX = lx * Math.cos(roll) + ux * Math.sin(roll);
        const radialY = ly * Math.cos(roll) + uy * Math.sin(roll);
        const radialZ = lz * Math.cos(roll) + uz * Math.sin(roll);
        const sx = flat ? lx : hy * radialZ - hz * radialY;
        const sy = flat ? ly : hz * radialX - hx * radialZ;
        const sz = flat ? lz : hx * radialY - hy * radialX;
        const sideLength = Math.hypot(sx, sy, sz) || 1;
        [stemX, stemY, stemZ] = [hx * Math.cos(splay) + radialX * Math.sin(splay), hy * Math.cos(splay) + radialY * Math.sin(splay), hz * Math.cos(splay) + radialZ * Math.sin(splay)];
        [sideX, sideY, sideZ] = [sx / sideLength, sy / sideLength, sz / sideLength];
      }
      spec.ax = spec.dx = stemX * Math.cos(spoke) + sideX * Math.sin(spoke);
      spec.ay = spec.dy = stemY * Math.cos(spoke) + sideY * Math.sin(spoke);
      spec.az = spec.dz = stemZ * Math.cos(spoke) + sideZ * Math.sin(spoke);
      spec.sx = sideX * Math.cos(spoke) - stemX * Math.sin(spoke);
      spec.sy = sideY * Math.cos(spoke) - stemY * Math.sin(spoke);
      spec.sz = sideZ * Math.cos(spoke) - stemZ * Math.sin(spoke);
      spec.length = Math.min(reach, form.leafSize * leafScales[node] * (0.78 + 0.44 * rng()) * (1 - 0.22 * Math.abs(spoke)));
      spec.halfWidth = spec.length * leaf.aspect * 0.5 * leafWiden;
      spec.phase = rng();
      writer.blade(spec);
    }
  }

  return { mesh: writer.toMesh(), blades: leafBlades + organBlades, truncated: cluster < leaf.cluster || organStride > organThin };
}
