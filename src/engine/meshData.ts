export interface AttributeData {
  array: Float32Array;
  itemSize: number;
}

export interface MeshData {
  attributes: Record<string, AttributeData>;
  index: Uint32Array;
}

export interface Bounds {
  height: number;
  spread: number;
}

export function transferables(...meshes: MeshData[]): ArrayBuffer[] {
  return meshes.flatMap((mesh) => [
    mesh.index.buffer as ArrayBuffer,
    ...Object.values(mesh.attributes).map((attribute) => attribute.array.buffer as ArrayBuffer),
  ]);
}

export function measureBounds(...meshes: MeshData[]): Bounds {
  let height = 0.1;
  let spread = 0.1;
  for (const mesh of meshes) {
    const positions = mesh.attributes.position.array;
    for (let offset = 0; offset < positions.length; offset += 3) {
      height = Math.max(height, positions[offset + 1]);
      spread = Math.max(spread, Math.abs(positions[offset]), Math.abs(positions[offset + 2]));
    }
  }
  return { height, spread };
}
