import { GLTFExporter } from 'three-stdlib';
import type { Species } from '@/types/botany';
import { buildExportScene, type ExportSource } from './exportScene';

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
