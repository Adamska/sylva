import type { Species } from '@/types/botany';
import { buildBarkMesh } from './barkBuilder';
import { buildFoliageMesh } from './leafBuilder';
import { measureLimbs } from './limbMetrics';
import { expandGrammar } from './lsystem';
import { measureBounds, type MeshData } from './meshData';
import { interpretSentence } from './turtle';

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

export interface SpecimenData {
  bark: MeshData;
  foliage: MeshData;
  stats: SpecimenStats;
}

export interface GrowthInputs extends Pick<Species, 'grammar' | 'form' | 'seed'> {
  detail?: number;
}

export function buildSpecimen(inputs: GrowthInputs): SpecimenData {
  const startedAt = performance.now();
  const detail = Math.min(1, Math.max(0.1, inputs.detail ?? 1));
  const expansion = expandGrammar(inputs.grammar, inputs.seed);
  const skeleton = interpretSentence(expansion, inputs.grammar, inputs.form, inputs.seed);
  const limbs = measureLimbs(skeleton, inputs.grammar, inputs.form);
  const bark = buildBarkMesh(skeleton, limbs, inputs.form.trunkRadius, detail);
  const foliage = buildFoliageMesh(skeleton, limbs, inputs.form, inputs.seed, detail);
  const bounds = measureBounds(bark, foliage.mesh);

  return {
    bark,
    foliage: foliage.mesh,
    stats: {
      symbols: expansion.sentence.length,
      generations: expansion.generations,
      segments: skeleton.segmentCount,
      blades: foliage.blades,
      vertices: (bark.attributes.position.array.length + foliage.mesh.attributes.position.array.length) / 3,
      triangles: (bark.index.length + foliage.mesh.index.length) / 3,
      height: bounds.height,
      spread: bounds.spread,
      truncated: expansion.truncated || skeleton.truncated || foliage.truncated,
      buildMs: performance.now() - startedAt,
    },
  };
}
