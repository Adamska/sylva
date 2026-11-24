import type { BufferGeometry, Camera, Scene, WebGLRenderer } from 'three';
import type { OrbitControls } from 'three-stdlib';
import type { SpecimenStats } from '@/engine/meshBuilder';

export interface DisplayedSpecimen {
  bark: BufferGeometry;
  foliage: BufferGeometry;
  stats: SpecimenStats;
  trunkRadius: number;
}

export interface Turntable {
  seconds: number;
  elapsed: number;
}

interface StudioBridge {
  gl: WebGLRenderer | null;
  scene: Scene | null;
  camera: Camera | null;
  controls: OrbitControls | null;
  specimen: DisplayedSpecimen | null;
  turntable: Turntable | null;
}

export const studio: StudioBridge = { gl: null, scene: null, camera: null, controls: null, specimen: null, turntable: null };

export const AMBIENCE_GROUP = 'sylva-ambience';
