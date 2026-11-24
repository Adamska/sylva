import { composePlate, PLATE_PORTRAIT } from '@/capture/plateComposer';
import { renderPortrait } from '@/capture/portraitStudio';
import { canvasToBlob } from '@/capture/snapshot';
import { captureStill } from '@/capture/stillCapture';
import { createThumbnail } from '@/capture/thumbnails';
import { recordTurntable } from '@/capture/turntable';
import { downloadBlob, exportSpecimenGlb, specimenFileName } from '@/engine/glbExporter';
import { studio } from '@/scene/studioBridge';
import { useBotanyStore } from '@/store/useBotanyStore';
import { useHerbariumStore } from '@/store/useHerbariumStore';
import { buildShareUrl } from './shareLink';

const TURNTABLE_SECONDS = 8;

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

export function exportStill(): Promise<void> {
  return runActivity('Rendering still', 'Transparent PNG saved', async () => {
    const { species } = useBotanyStore.getState();
    downloadBlob(await captureStill(), specimenFileName(species, 'png'));
  });
}

export function exportPlate(): Promise<void> {
  return runActivity('Composing plate', 'Botanical plate saved', async () => {
    const { bark, foliage, stats } = requireSpecimen();
    const { species } = useBotanyStore.getState();
    if (!studio.gl) throw new Error('The stage is not ready');
    const portrait = renderPortrait(studio.gl, { bark, foliage, stats, species, mood: 'studio', ...PLATE_PORTRAIT });
    const plate = await composePlate(portrait, species, stats);
    downloadBlob(await canvasToBlob(plate, 'image/png'), specimenFileName(species, 'plate.png'));
  });
}

export function exportTurntable(): Promise<void> {
  return runActivity('Recording turntable', 'Turntable video saved', async () => {
    const store = useBotanyStore.getState();
    const wasRotating = store.autoRotate;
    if (wasRotating) store.toggleAutoRotate();
    try {
      const clip = await recordTurntable(TURNTABLE_SECONDS, (progress) => store.setActivity({ label: 'Recording turntable', progress }));
      downloadBlob(clip.blob, specimenFileName(store.species, clip.extension));
    } finally {
      studio.turntable = null;
      if (wasRotating) useBotanyStore.getState().toggleAutoRotate();
    }
  });
}

export async function saveToHerbarium(): Promise<void> {
  const { species, announce } = useBotanyStore.getState();
  useHerbariumStore.getState().save(species, await createThumbnail(species));
  announce('Saved to your herbarium');
}

export const EXPORT_ACTIONS: readonly StudioAction[] = [
  { id: 'glb', label: 'Binary glTF', hint: 'Mesh with vertex colours for Blender or Unity', run: exportGlb },
  { id: 'still', label: 'Transparent PNG', hint: 'High resolution still of the current view', run: exportStill },
  { id: 'turntable', label: 'Turntable video', hint: 'Eight second full rotation', run: exportTurntable },
  { id: 'plate', label: 'Botanical plate', hint: 'Poster with portrait, grammar and palette', run: exportPlate },
];
