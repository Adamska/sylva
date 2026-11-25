import { ORGAN_NODE, type Skeleton } from './turtle';

const cellKey = (x: number, y: number, z: number) => ((x * 73856093) ^ (y * 19349663) ^ (z * 83492791)) | 0;

export function measureLeafRoom(skeleton: Skeleton, headRadius: number, leafReach: number): Float32Array | null {
  const { leafCount, leafOrigins, leafScales, leafKinds } = skeleton;
  if (headRadius <= 0) return null;

  let widest = 0;
  for (let node = 0; node < leafCount; node++) {
    if (leafKinds[node] === ORGAN_NODE) widest = Math.max(widest, leafScales[node]);
  }
  if (widest === 0) return null;

  const cell = headRadius * widest + leafReach;
  const grid = new Map<number, number[]>();
  for (let node = 0; node < leafCount; node++) {
    if (leafKinds[node] !== ORGAN_NODE) continue;
    const o = node * 3;
    const key = cellKey(Math.floor(leafOrigins[o] / cell), Math.floor(leafOrigins[o + 1] / cell), Math.floor(leafOrigins[o + 2] / cell));
    const bucket = grid.get(key);
    if (bucket) bucket.push(node);
    else grid.set(key, [node]);
  }

  const room = new Float32Array(leafCount).fill(Infinity);
  for (let node = 0; node < leafCount; node++) {
    if (leafKinds[node] === ORGAN_NODE) continue;
    const o = node * 3;
    const x = leafOrigins[o];
    const y = leafOrigins[o + 1];
    const z = leafOrigins[o + 2];
    const cx = Math.floor(x / cell);
    const cy = Math.floor(y / cell);
    const cz = Math.floor(z / cell);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const bucket = grid.get(cellKey(cx + dx, cy + dy, cz + dz));
          if (!bucket) continue;
          for (const organ of bucket) {
            const p = organ * 3;
            const gap = Math.hypot(leafOrigins[p] - x, leafOrigins[p + 1] - y, leafOrigins[p + 2] - z) - headRadius * leafScales[organ];
            room[node] = Math.min(room[node], Math.max(0, gap));
          }
        }
      }
    }
  }
  return room;
}
