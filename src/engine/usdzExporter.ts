import { BufferAttribute, BufferGeometry, FrontSide, Mesh, MeshStandardMaterial } from 'three';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';
import { buildExportScene, type ExportSource } from './exportScene';

function withBackFaces(source: BufferGeometry): BufferGeometry {
  const index = source.getIndex();
  const count = source.getAttribute('position').count;
  const doubled = new BufferGeometry();
  doubled.name = source.name;

  for (const name of ['position', 'normal', 'uv', 'color'] as const) {
    const attribute = source.getAttribute(name);
    const array = new Float32Array(attribute.array.length * 2);
    array.set(attribute.array);
    array.set(attribute.array, attribute.array.length);
    if (name === 'normal') for (let offset = attribute.array.length; offset < array.length; offset++) array[offset] = -array[offset];
    doubled.setAttribute(name, new BufferAttribute(array, attribute.itemSize));
  }
  if (index) {
    const indices = new Uint32Array(index.count * 2);
    indices.set(index.array);
    for (let face = 0; face < index.count; face += 3) {
      indices.set([index.getX(face) + count, index.getX(face + 2) + count, index.getX(face + 1) + count], index.count + face);
    }
    doubled.setIndex(new BufferAttribute(indices, 1));
  }
  return doubled;
}

export async function exportSpecimenUsdz(source: ExportSource): Promise<ArrayBuffer> {
  const { root, dispose } = buildExportScene({ species: source.species, levels: source.levels.slice(0, 1) });
  const doubled: BufferGeometry[] = [];
  root.traverse((object) => {
    if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial) || object.material.side === FrontSide) return;
    const geometry = withBackFaces(object.geometry as BufferGeometry);
    doubled.push(geometry);
    object.geometry = geometry;
    object.material.side = FrontSide;
  });

  try {
    const archive = await new USDZExporter().parseAsync(root, { quickLookCompatible: true });
    return archive.buffer.slice(archive.byteOffset, archive.byteOffset + archive.byteLength) as ArrayBuffer;
  } finally {
    doubled.forEach((geometry) => geometry.dispose());
    dispose();
  }
}
