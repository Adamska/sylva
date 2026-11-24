import { BufferAttribute, BufferGeometry } from 'three';
import type { Species } from '@/types/botany';
import { buildFoliageGeometry } from './leafBuilder';
import { measureLimbs, type LimbMetrics } from './limbMetrics';
import { expandGrammar } from './lsystem';
import { interpretSentence, type Skeleton } from './turtle';

export interface SpecimenStats {
  symbols: number;
  generations: number;
  segments: number;
  blades: number;
  vertices: number;
  triangles: number;
  height: number;
  spread: number;
  truncated: boolean;
  buildMs: number;
}

export interface SpecimenBuild {
  bark: BufferGeometry;
  foliage: BufferGeometry;
  stats: SpecimenStats;
}

const MIN_SIDES = 4;
const MAX_SIDES = 12;
const TAU = Math.PI * 2;
const basis = new Float64Array(6);

function resolveBasis(dx: number, dy: number, dz: number, rx: number, ry: number, rz: number): void {
  let along = rx * dx + ry * dy + rz * dz;
  let bx = rx - dx * along;
  let by = ry - dy * along;
  let bz = rz - dz * along;
  if (bx * bx + by * by + bz * bz < 1e-8) {
    const useY = Math.abs(dy) < 0.9;
    along = useY ? dy : dx;
    bx = (useY ? 0 : 1) - dx * along;
    by = (useY ? 1 : 0) - dy * along;
    bz = -dz * along;
  }
  const length = Math.hypot(bx, by, bz);
  bx /= length;
  by /= length;
  bz /= length;
  basis.set([bx, by, bz, dy * bz - dz * by, dz * bx - dx * bz, dx * by - dy * bx]);
}

function buildBarkGeometry(skeleton: Skeleton, limbs: LimbMetrics, trunkRadius: number): BufferGeometry {
  const { segmentCount: count, starts, ends, frames, parents } = skeleton;
  const { startRadius, endRadius, startFlex, endFlex, startPath, endPath, continuation, continues } = limbs;

  const sides = new Uint8Array(count);
  let vertexTotal = 0;
  let indexTotal = 0;
  for (let i = 0; i < count; i++) {
    const girth = Math.sqrt(Math.min(1, startRadius[i] / trunkRadius));
    sides[i] = continues[i] ? sides[parents[i]] : Math.min(MAX_SIDES, Math.max(MIN_SIDES, Math.round(3.4 + 9 * girth)));
    const ring = sides[i] + 1;
    const terminal = continuation[i] < 0;
    vertexTotal += (continues[i] ? ring : ring * 2) + (terminal ? 1 : 0);
    indexTotal += sides[i] * (terminal ? 9 : 6);
  }

  const positions = new Float32Array(vertexTotal * 3);
  const normals = new Float32Array(vertexTotal * 3);
  const uvs = new Float32Array(vertexTotal * 2);
  const branchFactor = new Float32Array(vertexTotal);
  const roughness = new Float32Array(vertexTotal);
  const indices = new Uint32Array(indexTotal);
  const directions = new Float32Array(count * 3);
  const references = new Float32Array(count * 3);
  const endRings = new Uint32Array(count);
  let vertex = 0;
  let cursor = 0;

  for (let i = 0; i < count; i++) {
    const o = i * 3;
    const length = Math.hypot(ends[o] - starts[o], ends[o + 1] - starts[o + 1], ends[o + 2] - starts[o + 2]) || 1;
    directions.set([(ends[o] - starts[o]) / length, (ends[o + 1] - starts[o + 1]) / length, (ends[o + 2] - starts[o + 2]) / length], o);
  }

  const writeRing = (segment: number, atEnd: boolean, dx: number, dy: number, dz: number): number => {
    const o = segment * 3;
    const center = atEnd ? ends : starts;
    const radius = atEnd ? endRadius[segment] : startRadius[segment];
    const flex = atEnd ? endFlex[segment] : startFlex[segment];
    const path = atEnd ? endPath[segment] : startPath[segment];
    const grain = Math.sqrt(Math.min(1, radius / trunkRadius));
    const first = vertex;
    resolveBasis(dx, dy, dz, references[o], references[o + 1], references[o + 2]);
    references.set([basis[0], basis[1], basis[2]], o);
    for (let s = 0; s <= sides[segment]; s++) {
      const angle = (s / sides[segment]) * TAU;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const nx = basis[0] * cos + basis[3] * sin;
      const ny = basis[1] * cos + basis[4] * sin;
      const nz = basis[2] * cos + basis[5] * sin;
      const v = vertex * 3;
      positions[v] = center[o] + nx * radius;
      positions[v + 1] = center[o + 1] + ny * radius;
      positions[v + 2] = center[o + 2] + nz * radius;
      normals[v] = nx;
      normals[v + 1] = ny;
      normals[v + 2] = nz;
      uvs[vertex * 2] = s / sides[segment];
      uvs[vertex * 2 + 1] = path;
      branchFactor[vertex] = flex;
      roughness[vertex] = grain;
      vertex++;
    }
    return first;
  };

  for (let i = 0; i < count; i++) {
    const o = i * 3;
    const parent = parents[i];
    const next = continuation[i];
    const source = continues[i] ? references.subarray(parent * 3, parent * 3 + 3) : frames.subarray(o, o + 3);
    references.set(source, o);

    const startRing = continues[i] ? endRings[parent] : writeRing(i, false, directions[o], directions[o + 1], directions[o + 2]);
    let jx = directions[o];
    let jy = directions[o + 1];
    let jz = directions[o + 2];
    if (next >= 0) {
      jx += directions[next * 3];
      jy += directions[next * 3 + 1];
      jz += directions[next * 3 + 2];
      const joint = Math.hypot(jx, jy, jz);
      if (joint > 1e-4) {
        jx /= joint;
        jy /= joint;
        jz /= joint;
      } else {
        jx = directions[o];
        jy = directions[o + 1];
        jz = directions[o + 2];
      }
    }
    const endRing = writeRing(i, true, jx, jy, jz);
    endRings[i] = endRing;

    for (let s = 0; s < sides[i]; s++) {
      indices.set([startRing + s, startRing + s + 1, endRing + s, startRing + s + 1, endRing + s + 1, endRing + s], cursor);
      cursor += 6;
    }
    if (next < 0) {
      const bulge = endRadius[i] * 0.8;
      positions.set([ends[o] + jx * bulge, ends[o + 1] + jy * bulge, ends[o + 2] + jz * bulge], vertex * 3);
      normals.set([jx, jy, jz], vertex * 3);
      uvs.set([0.5, endPath[i] + bulge], vertex * 2);
      branchFactor[vertex] = endFlex[i];
      roughness[vertex] = roughness[endRing];
      for (let s = 0; s < sides[i]; s++) {
        indices.set([endRing + s, endRing + s + 1, vertex], cursor);
        cursor += 3;
      }
      vertex++;
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('normal', new BufferAttribute(normals, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setAttribute('aBranchFactor', new BufferAttribute(branchFactor, 1));
  geometry.setAttribute('aBarkRoughness', new BufferAttribute(roughness, 1));
  geometry.setIndex(new BufferAttribute(indices, 1));
  return geometry;
}

export function buildSpecimen(species: Species): SpecimenBuild {
  const startedAt = performance.now();
  const expansion = expandGrammar(species.grammar, species.seed);
  const skeleton = interpretSentence(expansion.sentence, species.grammar, species.form, species.seed);
  const limbs = measureLimbs(skeleton, species.grammar, species.form);
  const bark = buildBarkGeometry(skeleton, limbs, species.form.trunkRadius);
  const { geometry: foliage, blades, truncated: foliageTruncated } = buildFoliageGeometry(skeleton, limbs, species.form, species.seed);

  bark.computeBoundingBox();
  foliage.computeBoundingBox();
  const boxes = [bark.boundingBox, foliage.boundingBox].filter((box) => box !== null && !box.isEmpty());
  const height = Math.max(0.1, ...boxes.map((box) => box?.max.y ?? 0));
  const spread = Math.max(0.1, ...boxes.flatMap((box) => (box ? [box.max.x, -box.min.x, box.max.z, -box.min.z] : [])));
  const vertices = bark.getAttribute('position').count + foliage.getAttribute('position').count;
  const triangles = ((bark.index?.count ?? 0) + (foliage.index?.count ?? 0)) / 3;

  return {
    bark,
    foliage,
    stats: {
      symbols: expansion.sentence.length,
      generations: expansion.generations,
      segments: skeleton.segmentCount,
      blades,
      vertices,
      triangles,
      height,
      spread,
      truncated: expansion.truncated || skeleton.truncated || foliageTruncated,
      buildMs: performance.now() - startedAt,
    },
  };
}
