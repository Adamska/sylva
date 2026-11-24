import { BufferAttribute, BufferGeometry, Color, DoubleSide, Group, Mesh, MeshStandardMaterial } from 'three';
import { GLTFExporter } from 'three-stdlib';
import type { Species } from '@/types/botany';

export interface ExportSource {
  species: Species;
  bark: BufferGeometry;
  foliage: BufferGeometry;
}

type VertexTint = (vertex: number, target: Color) => void;

function bakeGeometry(name: string, source: BufferGeometry, tint: VertexTint): BufferGeometry {
  const baked = new BufferGeometry();
  baked.name = name;
  for (const name of ['position', 'normal', 'uv'] as const) {
    baked.setAttribute(name, source.getAttribute(name));
  }
  baked.setIndex(source.getIndex());

  const count = source.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  const scratch = new Color();
  for (let vertex = 0; vertex < count; vertex++) {
    tint(vertex, scratch);
    scratch.toArray(colors, vertex * 3);
  }
  baked.setAttribute('color', new BufferAttribute(colors, 3));
  return baked;
}

function buildExportScene({ species, bark, foliage }: ExportSource): { root: Group; dispose: () => void } {
  const { palette } = species;
  const barkDark = new Color(palette.barkDark);
  const barkLight = new Color(palette.barkLight);
  const leafDeep = new Color(palette.leafDeep);
  const leafBright = new Color(palette.leafBright);

  const barkAge = bark.getAttribute('aBarkRoughness');
  const leafUv = foliage.getAttribute('uv');
  const leafShade = foliage.getAttribute('aShade');

  const barkGeometry = bakeGeometry('Bark', bark, (vertex, target) => {
    target.copy(barkLight).lerp(barkDark, 0.3 + 0.45 * barkAge.getX(vertex));
  });
  const foliageGeometry = bakeGeometry('Foliage', foliage, (vertex, target) => {
    target.copy(leafDeep).lerp(leafBright, leafUv.getY(vertex)).multiplyScalar(0.6 + 0.4 * leafShade.getX(vertex));
  });

  const barkMaterial = new MeshStandardMaterial({ name: 'Bark', vertexColors: true, roughness: 0.92, metalness: 0 });
  const foliageMaterial = new MeshStandardMaterial({
    name: 'Foliage',
    vertexColors: true,
    roughness: 0.58,
    metalness: 0,
    side: DoubleSide,
    emissive: leafBright.clone().multiplyScalar(palette.glow),
  });

  const barkMesh = new Mesh(barkGeometry, barkMaterial);
  barkMesh.name = 'Bark';
  const foliageMesh = new Mesh(foliageGeometry, foliageMaterial);
  foliageMesh.name = 'Foliage';

  const root = new Group();
  root.name = species.name;
  root.userData = { generator: 'Sylva', latin: species.latin, seed: species.seed };
  root.add(barkMesh);
  if (foliage.getAttribute('position').count > 0) root.add(foliageMesh);

  return {
    root,
    dispose: () => {
      barkGeometry.dispose();
      foliageGeometry.dispose();
      barkMaterial.dispose();
      foliageMaterial.dispose();
    },
  };
}

export async function exportSpecimenGlb(source: ExportSource): Promise<ArrayBuffer> {
  const { root, dispose } = buildExportScene(source);
  try {
    const result = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true });
    if (!(result instanceof ArrayBuffer)) throw new Error('Exporter returned JSON instead of a binary buffer');
    return result;
  } finally {
    dispose();
  }
}

export function specimenFileName(species: Species, extension: string): string {
  const slug = species.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `sylva-${slug || 'specimen'}.${extension}`;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
