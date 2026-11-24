import { downloadBlob, exportSpecimenGlb, specimenFileName } from '@/engine/glbExporter';
import { studio } from '@/scene/studioBridge';
import { useBotanyStore } from '@/store/useBotanyStore';
import { buildShareUrl } from './shareLink';

export interface StudioAction {
  id: string;
  label: string;
  hint: string;
  run: () => Promise<void>;
}

export async function runActivity(label: string, done: string, task: () => Promise<void>): Promise<void> {
  const { setActivity, announce, activity } = useBotanyStore.getState();
  if (activity) return;
  setActivity({ label, progress: null });
  try {
    await task();
    announce(done);
  } catch (error) {
    console.error(error);
    announce(`${label} failed`);
  } finally {
    setActivity(null);
  }
}

export function requireSpecimen() {
  const specimen = studio.specimen;
  if (!specimen) throw new Error('No specimen is ready yet');
  return specimen;
}

export function exportGlb(): Promise<void> {
  return runActivity('Exporting glTF', 'Binary glTF exported', async () => {
    const { bark, foliage } = requireSpecimen();
    const { species } = useBotanyStore.getState();
    const buffer = await exportSpecimenGlb({ species, bark, foliage });
    downloadBlob(new Blob([buffer], { type: 'model/gltf-binary' }), specimenFileName(species, 'glb'));
  });
}

export async function copyShareLink(): Promise<void> {
  const { species, announce } = useBotanyStore.getState();
  const url = buildShareUrl(species);
  window.history.replaceState(null, '', url);
  try {
    await navigator.clipboard.writeText(url);
    announce('Share link copied');
  } catch {
    announce('Link placed in the address bar');
  }
}

export const EXPORT_ACTIONS: readonly StudioAction[] = [
  { id: 'glb', label: 'Binary glTF', hint: 'Mesh with vertex colours for Blender or Unity', run: exportGlb },
];
