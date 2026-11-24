import { composePlate, PLATE_PORTRAIT } from '@/capture/plateComposer';
import { renderPortrait } from '@/capture/portraitStudio';
import { canvasToBlob } from '@/capture/snapshot';
import { captureStill } from '@/capture/stillCapture';
import { createThumbnail } from '@/capture/thumbnails';
import { recordTurntable } from '@/capture/turntable';
import { requestBuild } from '@/engine/buildClient';
import { toGeometry } from '@/engine/geometry';
import { downloadBlob, exportSpecimenGlb, specimenFileName } from '@/engine/glbExporter';
import { studio } from '@/scene/studioBridge';
import { useBotanyStore } from '@/store/useBotanyStore';
import { useHerbariumStore } from '@/store/useHerbariumStore';
import { buildShareUrl } from './shareLink';

const TURNTABLE_SECONDS = 8;
const LOD_DETAILS = [0.5, 0.25] as const;
const USDZ_DETAIL = 0.5;

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
    const { species } = useBotanyStore.getState();
    const buffer = await exportSpecimenGlb({ species, levels: [requireSpecimen()] });
    downloadBlob(new Blob([buffer], { type: 'model/gltf-binary' }), specimenFileName(species, 'glb'));
  });
}

export function exportGlbWithLods(): Promise<void> {
  return runActivity('Building detail levels', 'glTF with detail levels exported', async () => {
    const { species } = useBotanyStore.getState();
    const reduced = await Promise.all(LOD_DETAILS.map((detail) => requestBuild({ grammar: species.grammar, form: species.form, seed: species.seed, detail })));
    const levels = reduced.map((data) => ({ bark: toGeometry(data.bark), foliage: toGeometry(data.foliage) }));
    try {
      const buffer = await exportSpecimenGlb({ species, levels: [requireSpecimen(), ...levels] });
      downloadBlob(new Blob([buffer], { type: 'model/gltf-binary' }), specimenFileName(species, 'lods.glb'));
    } finally {
      levels.forEach((level) => {
        level.bark.dispose();
        level.foliage.dispose();
      });
    }
  });
}

export function exportUsdz(): Promise<void> {
  return runActivity('Exporting USDZ', 'USDZ exported', async () => {
    const { species } = useBotanyStore.getState();
    const [{ exportSpecimenUsdz }, data] = await Promise.all([
      import('@/engine/usdzExporter'),
      requestBuild({ grammar: species.grammar, form: species.form, seed: species.seed, detail: USDZ_DETAIL }),
    ]);
    const level = { bark: toGeometry(data.bark), foliage: toGeometry(data.foliage) };
    try {
      const buffer = await exportSpecimenUsdz({ species, levels: [level] });
      downloadBlob(new Blob([buffer], { type: 'model/vnd.usdz+zip' }), specimenFileName(species, 'usdz'));
    } finally {
      level.bark.dispose();
      level.foliage.dispose();
    }
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
  { id: 'glb', label: 'Binary glTF', hint: 'Mesh, vertex colours and wind weights', run: exportGlb },
  { id: 'glb-lods', label: 'glTF with detail levels', hint: 'LOD0 to LOD2 named for engine import', run: exportGlbWithLods },
  { id: 'usdz', label: 'USDZ for augmented reality', hint: 'Lighter mesh for Quick Look on iPhone and iPad', run: exportUsdz },
  { id: 'still', label: 'Transparent PNG', hint: 'High resolution still of the current view', run: exportStill },
  { id: 'turntable', label: 'Turntable video', hint: 'Eight second full rotation', run: exportTurntable },
  { id: 'plate', label: 'Botanical plate', hint: 'Poster with portrait, grammar and palette', run: exportPlate },
];
