import type { Grammar, PlantForm } from '@/types/botany';
import type { Skeleton } from './turtle';

export interface LimbMetrics {
  startRadius: Float32Array;
  endRadius: Float32Array;
  startFlex: Float32Array;
  endFlex: Float32Array;
  startPath: Float32Array;
  endPath: Float32Array;
  continuation: Int32Array;
  continues: Uint8Array;
  height: number;
  spread: number;
}

const MIN_RADIUS_RATIO = 0.028;
const TIP_TAPER = 0.45;
const JOINT_EPSILON = 1e-4;

export function measureLimbs(skeleton: Skeleton, grammar: Grammar, form: PlantForm): LimbMetrics {
  const { segmentCount: count, starts, ends, parents } = skeleton;
  const lengths = new Float32Array(count);
  const weights = new Float32Array(count);
  const continuation = new Int32Array(count).fill(-1);
  const continues = new Uint8Array(count);
  const startRadius = new Float32Array(count);
  const endRadius = new Float32Array(count);
  const startFlex = new Float32Array(count);
  const endFlex = new Float32Array(count);
  const startPath = new Float32Array(count);
  const endPath = new Float32Array(count);

  let height = 0;
  let spread = 0;
  for (let i = 0; i < count; i++) {
    const o = i * 3;
    lengths[i] = Math.hypot(ends[o] - starts[o], ends[o + 1] - starts[o + 1], ends[o + 2] - starts[o + 2]);
    height = Math.max(height, ends[o + 1]);
    spread = Math.max(spread, Math.hypot(ends[o], ends[o + 2]));
  }

  let rootWeight = 0;
  for (let i = count - 1; i >= 0; i--) {
    weights[i] += lengths[i];
    const parent = parents[i];
    if (parent >= 0) weights[parent] += weights[i];
    else rootWeight = Math.max(rootWeight, weights[i]);
  }

  for (let i = 0; i < count; i++) {
    const parent = parents[i];
    if (parent < 0) continue;
    const o = i * 3;
    const p = parent * 3;
    const gap = Math.hypot(starts[o] - ends[p], starts[o + 1] - ends[p + 1], starts[o + 2] - ends[p + 2]);
    if (gap > JOINT_EPSILON) continue;
    const rival = continuation[parent];
    if (rival < 0 || weights[i] > weights[rival]) continuation[parent] = i;
  }
  for (let i = 0; i < count; i++) {
    if (continuation[i] >= 0) continues[continuation[i]] = 1;
  }

  const exponent = -Math.log2(grammar.radiusScale);
  const minRadius = form.trunkRadius * MIN_RADIUS_RATIO;
  const radiusFor = (weight: number) =>
    Math.max(minRadius, form.trunkRadius * (weight / (rootWeight || 1)) ** exponent);

  let longestPath = 0;
  for (let i = 0; i < count; i++) {
    const parent = parents[i];
    startPath[i] = parent >= 0 ? endPath[parent] : 0;
    endPath[i] = startPath[i] + lengths[i];
    longestPath = Math.max(longestPath, endPath[i]);
  }

  const flexFor = (radius: number, path: number) => {
    const slenderness = 1 - Math.sqrt(Math.min(1, radius / form.trunkRadius));
    return Math.min(1, 0.6 * slenderness + 0.4 * (path / (longestPath || 1)));
  };

  for (let i = 0; i < count; i++) {
    const parent = parents[i];
    const next = continuation[i];
    startRadius[i] = continues[i] ? endRadius[parent] : radiusFor(weights[i]);
    endRadius[i] = next >= 0 ? radiusFor(weights[next]) : startRadius[i] * TIP_TAPER;
    startFlex[i] = parent >= 0 ? endFlex[parent] : 0;
    endFlex[i] = Math.max(startFlex[i], flexFor(endRadius[i], endPath[i]));
  }

  return { startRadius, endRadius, startFlex, endFlex, startPath, endPath, continuation, continues, height, spread };
}
