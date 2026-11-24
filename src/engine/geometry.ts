import { BufferAttribute, BufferGeometry } from 'three';
import type { MeshData } from './meshData';

export function toGeometry(mesh: MeshData): BufferGeometry {
  const geometry = new BufferGeometry();
  for (const [name, attribute] of Object.entries(mesh.attributes)) {
    geometry.setAttribute(name, new BufferAttribute(attribute.array, attribute.itemSize));
  }
  geometry.setIndex(new BufferAttribute(mesh.index, 1));
  return geometry;
}
