import { BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Mesh, MeshStandardMaterial } from 'three';
import type { Species } from '@/types/botany';

export interface ExportLevel {
  bark: BufferGeometry;
  foliage: BufferGeometry;
}

export interface ExportSource {
  species: Species;
  levels: ExportLevel[];
}

export interface ExportScene {
  root: Group;
  dispose: () => void;
}

type VertexWriter = (vertex: number, target: Float32Array, offset: number) => void;

function bakeGeometry(name: string, source: BufferGeometry, tint: VertexWriter, wind: VertexWriter): BufferGeometry {
  const baked = new BufferGeometry();
  baked.name = name;
  for (const attribute of ['position', 'normal', 'uv'] as const) baked.setAttribute(attribute, source.getAttribute(attribute));
  baked.setIndex(source.getIndex());

  const count = source.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  const weights = new Float32Array(count * 3);
  for (let vertex = 0; vertex < count; vertex++) {
    tint(vertex, colors, vertex * 3);
    wind(vertex, weights, vertex * 3);
  }
  baked.setAttribute('color', new BufferAttribute(colors, 3));
  baked.setAttribute('color_1', new BufferAttribute(weights, 3));
  return baked;
}

export function buildExportScene({ species, levels }: ExportSource): ExportScene {
  const { palette } = species;
  const barkDark = new Color(palette.barkDark);
  const barkLight = new Color(palette.barkLight);
  const leafDeep = new Color(palette.leafDeep);
  const leafBright = new Color(palette.leafBright);
  const organ = new Color(palette.organ);
  const scratch = new Color();
  const geometries: BufferGeometry[] = [];

  const barkMaterial = new MeshStandardMaterial({ name: 'Bark', vertexColors: true, roughness: 0.92, metalness: 0 });
  const foliageMaterial = new MeshStandardMaterial({
    name: 'Foliage',
    vertexColors: true,
    roughness: 0.58,
    metalness: 0,
    side: DoubleSide,
    emissive: leafBright.clone().multiplyScalar(palette.glow),
  });

  const root = new Group();
  root.name = species.name;
  root.userData = { generator: 'Sylva', latin: species.latin, seed: species.seed, windWeights: 'COLOR_1: R branch flex, G leaf sway, B phase' };

  levels.forEach((level, index) => {
    const suffix = levels.length > 1 ? `_LOD${index}` : '';
    const age = level.bark.getAttribute('aBarkRoughness');
    const barkFlex = level.bark.getAttribute('aBranchFactor');
    const uv = level.foliage.getAttribute('uv');
    const shade = level.foliage.getAttribute('aShade');
    const isOrgan = level.foliage.getAttribute('aOrgan');
    const flex = level.foliage.getAttribute('aBranchFactor');
    const sway = level.foliage.getAttribute('aSway');
    const phase = level.foliage.getAttribute('aPhase');
    let peakSway = 1e-4;
    for (let vertex = 0; vertex < sway.count; vertex++) peakSway = Math.max(peakSway, sway.getX(vertex));

    const bark = bakeGeometry(
      `Bark${suffix}`,
      level.bark,
      (vertex, target, offset) => scratch.copy(barkLight).lerp(barkDark, 0.3 + 0.45 * age.getX(vertex)).toArray(target, offset),
      (vertex, target, offset) => target.set([barkFlex.getX(vertex), 0, 0], offset),
    );
    const foliage = bakeGeometry(
      `Foliage${suffix}`,
      level.foliage,
      (vertex, target, offset) => {
        scratch.copy(leafDeep).lerp(leafBright, uv.getY(vertex));
        if (isOrgan.getX(vertex) > 0.5) scratch.copy(organ).multiplyScalar(0.7 + 0.3 * uv.getY(vertex));
        scratch.multiplyScalar(0.6 + 0.4 * shade.getX(vertex)).toArray(target, offset);
      },
      (vertex, target, offset) => target.set([flex.getX(vertex), sway.getX(vertex) / peakSway, phase.getX(vertex)], offset),
    );
    geometries.push(bark, foliage);

    const barkMesh = new Mesh(bark, barkMaterial);
    barkMesh.name = bark.name;
    root.add(barkMesh);
    if (level.foliage.getAttribute('position').count > 0) {
      const foliageMesh = new Mesh(foliage, foliageMaterial);
      foliageMesh.name = foliage.name;
      root.add(foliageMesh);
    }
  });

  return {
    root,
    dispose: () => {
      geometries.forEach((geometry) => geometry.dispose());
      barkMaterial.dispose();
      foliageMaterial.dispose();
    },
  };
}
