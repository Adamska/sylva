import { BufferAttribute, BufferGeometry } from 'three';
import type { LeafShape, PlantForm } from '@/types/botany';
import type { LimbMetrics } from './limbMetrics';
import { createRng } from './random';
import type { Skeleton } from './turtle';

interface LeafProfile {
  aspect: number;
  cluster: number;
  splayDeg: number;
  droop: number;
  fold: number;
  rows: number;
  flutter: number;
  outline: (t: number) => number;
}

export const LEAF_PROFILES: Record<LeafShape, LeafProfile> = {
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

export const FOLIAGE_LIMITS = { maxBlades: 42_000 } as const;

const GOLDEN_ANGLE = 2.39996323;
const DEG_TO_RAD = Math.PI / 180;

export interface FoliageBuild {
  geometry: BufferGeometry;
  blades: number;
  truncated: boolean;
}

export function buildFoliageGeometry(skeleton: Skeleton, limbs: LimbMetrics, form: PlantForm, seed: number): FoliageBuild {
  const profile = LEAF_PROFILES[form.leafShape];
  const rng = createRng(seed ^ 0x51ed270b);
  const { leafCount, leafOrigins, leafHeadings, leafNormals, leafScales, leafSegments } = skeleton;
  const cluster = Math.max(1, Math.min(profile.cluster, Math.floor(FOLIAGE_LIMITS.maxBlades / Math.max(1, leafCount))));
  const blades = leafCount * cluster;
  const rings = profile.rows + 1;
  const vertexTotal = blades * rings * 3;

  const positions = new Float32Array(vertexTotal * 3);
  const normals = new Float32Array(vertexTotal * 3);
  const uvs = new Float32Array(vertexTotal * 2);
  const anchors = new Float32Array(vertexTotal * 3);
  const sway = new Float32Array(vertexTotal);
  const phase = new Float32Array(vertexTotal);
  const branchFactor = new Float32Array(vertexTotal);
  const shade = new Float32Array(vertexTotal);
  const indices = new Uint32Array(blades * profile.rows * 12);

  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (let leaf = 0; leaf < leafCount; leaf++) {
    cx += leafOrigins[leaf * 3];
    cy += leafOrigins[leaf * 3 + 1];
    cz += leafOrigins[leaf * 3 + 2];
  }
  cx /= leafCount || 1;
  cy /= leafCount || 1;
  cz /= leafCount || 1;
  let canopyRadius = 1e-3;
  for (let leaf = 0; leaf < leafCount; leaf++) {
    const o = leaf * 3;
    canopyRadius = Math.max(canopyRadius, Math.hypot(leafOrigins[o] - cx, leafOrigins[o + 1] - cy, leafOrigins[o + 2] - cz));
  }

  let vertex = 0;
  let cursor = 0;
  for (let leaf = 0; leaf < leafCount; leaf++) {
    const o = leaf * 3;
    const ox = leafOrigins[o];
    const oy = leafOrigins[o + 1];
    const oz = leafOrigins[o + 2];
    const hx = leafHeadings[o];
    const hy = leafHeadings[o + 1];
    const hz = leafHeadings[o + 2];
    const ux = leafNormals[o];
    const uy = leafNormals[o + 1];
    const uz = leafNormals[o + 2];
    const lx = uy * hz - uz * hy;
    const ly = uz * hx - ux * hz;
    const lz = ux * hy - uy * hx;
    const segment = leafSegments[leaf];
    const flex = segment >= 0 ? limbs.endFlex[segment] : 0.08;
    const depth = Math.min(1, Math.hypot(ox - cx, oy - cy, oz - cz) / canopyRadius);
    const exposure = 0.5 + 0.5 * Math.min(1, Math.max(0, (depth - 0.2) / 0.65));

    for (let blade = 0; blade < cluster; blade++) {
      const roll = GOLDEN_ANGLE * (leaf * cluster + blade) + rng() * 0.6;
      const splay = profile.splayDeg * DEG_TO_RAD * (0.7 + 0.6 * rng());
      const radialX = lx * Math.cos(roll) + ux * Math.sin(roll);
      const radialY = ly * Math.cos(roll) + uy * Math.sin(roll);
      const radialZ = lz * Math.cos(roll) + uz * Math.sin(roll);
      let dx = hx * Math.cos(splay) + radialX * Math.sin(splay);
      let dy = hy * Math.cos(splay) + radialY * Math.sin(splay);
      let dz = hz * Math.cos(splay) + radialZ * Math.sin(splay);
      const flat = profile.splayDeg === 0;
      let sx = flat ? lx : hy * radialZ - hz * radialY;
      let sy = flat ? ly : hz * radialX - hx * radialZ;
      let sz = flat ? lz : hx * radialY - hy * radialX;
      const sideLength = Math.hypot(sx, sy, sz) || 1;
      sx /= sideLength;
      sy /= sideLength;
      sz /= sideLength;

      const length = form.leafSize * leafScales[leaf] * (0.78 + 0.44 * rng());
      const halfWidth = length * profile.aspect * 0.5;
      const bladePhase = rng();
      let px = ox;
      let py = oy;
      let pz = oz;

      for (let row = 0; row < rings; row++) {
        const t = row / profile.rows;
        const nx = dy * sz - dz * sy;
        const ny = dz * sx - dx * sz;
        const nz = dx * sy - dy * sx;
        const width = halfWidth * Math.max(0, profile.outline(t));
        const lift = width * profile.fold;
        for (let column = -1; column <= 1; column++) {
          const edge = Math.abs(column);
          const v = vertex * 3;
          positions[v] = px + sx * width * column + nx * lift * edge;
          positions[v + 1] = py + sy * width * column + ny * lift * edge;
          positions[v + 2] = pz + sz * width * column + nz * lift * edge;
          const tilt = -column * profile.fold;
          const normalLength = Math.hypot(nx + sx * tilt, ny + sy * tilt, nz + sz * tilt) || 1;
          normals[v] = (nx + sx * tilt) / normalLength;
          normals[v + 1] = (ny + sy * tilt) / normalLength;
          normals[v + 2] = (nz + sz * tilt) / normalLength;
          uvs[vertex * 2] = (column + 1) * 0.5;
          uvs[vertex * 2 + 1] = t;
          anchors[v] = ox;
          anchors[v + 1] = oy;
          anchors[v + 2] = oz;
          sway[vertex] = t * t * length * profile.flutter;
          phase[vertex] = bladePhase;
          branchFactor[vertex] = flex;
          shade[vertex] = exposure;
          vertex++;
        }
        if (row < profile.rows) {
          const base = vertex - 3;
          indices.set([base, base + 3, base + 1, base + 1, base + 3, base + 4, base + 1, base + 4, base + 2, base + 2, base + 4, base + 5], cursor);
          cursor += 12;
          const stride = length / profile.rows;
          px += dx * stride;
          py += dy * stride;
          pz += dz * stride;
          dy -= (profile.droop / profile.rows) * (0.6 + 0.8 * t);
          const directionLength = Math.hypot(dx, dy, dz) || 1;
          dx /= directionLength;
          dy /= directionLength;
          dz /= directionLength;
        }
      }
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setAttribute('aAnchor', new BufferAttribute(anchors, 3));
  geometry.setAttribute('aSway', new BufferAttribute(sway, 1));
  geometry.setAttribute('aPhase', new BufferAttribute(phase, 1));
  geometry.setAttribute('aBranchFactor', new BufferAttribute(branchFactor, 1));
  geometry.setAttribute('aShade', new BufferAttribute(shade, 1));
  geometry.setIndex(new BufferAttribute(indices, 1));
  return { geometry, blades, truncated: cluster < profile.cluster };
}
