import { MathUtils, Mesh, PerspectiveCamera, Scene, type BufferGeometry, type WebGLRenderer } from 'three';
import type { SpecimenStats } from '@/engine/meshBuilder';
import { MOODS } from '@/scene/moods';
import { applyMood, applyPalette, createSpecimenMaterials, organScale, type SpecimenMaterials } from '@/scene/specimenMaterials';
import type { LightingMood, Species } from '@/types/botany';
import { renderSnapshot } from './snapshot';

export interface PortraitRequest {
  bark: BufferGeometry;
  foliage: BufferGeometry;
  stats: SpecimenStats;
  species: Species;
  width: number;
  height: number;
  mood?: LightingMood;
}

interface PortraitSet {
  scene: Scene;
  camera: PerspectiveCamera;
  bark: Mesh;
  foliage: Mesh;
  materials: SpecimenMaterials;
}

const PORTRAIT_FOV = 26;
const PORTRAIT_SEASON = 0.3;
const AZIMUTH = MathUtils.degToRad(28);
const ELEVATION = MathUtils.degToRad(7);
let portraitSet: PortraitSet | null = null;

function acquireSet(): PortraitSet {
  if (portraitSet) return portraitSet;
  const materials = createSpecimenMaterials();
  const bark = new Mesh(undefined, materials.bark);
  const foliage = new Mesh(undefined, materials.foliage);
  bark.frustumCulled = foliage.frustumCulled = false;
  const scene = new Scene();
  scene.add(bark, foliage);
  portraitSet = { scene, camera: new PerspectiveCamera(PORTRAIT_FOV, 1, 0.1, 120), bark, foliage, materials };
  return portraitSet;
}

export function renderPortrait(gl: WebGLRenderer, request: PortraitRequest): HTMLCanvasElement {
  const { scene, camera, bark, foliage, materials } = acquireSet();
  const { species, stats, width, height } = request;
  const { uniforms } = materials;

  applyPalette(uniforms, species.palette);
  applyMood(uniforms, MOODS[request.mood ?? species.mood]);
  uniforms.uWindStrength.value = 0;
  uniforms.uFlutter.value = 0;
  uniforms.uGrowth.value = 1;
  uniforms.uHighlight.value = 0;
  uniforms.uSeason.value = PORTRAIT_SEASON;
  uniforms.uOrganScale.value = organScale(species.form.organShape, PORTRAIT_SEASON);
  uniforms.uSpecimenHeight.value = stats.height;
  uniforms.uTrunkRadius.value = species.form.trunkRadius;

  const halfTangent = Math.tan(MathUtils.degToRad(PORTRAIT_FOV / 2));
  const aspect = width / height;
  const distance = Math.max(stats.height / 2 / halfTangent, stats.spread / (halfTangent * aspect)) * 1.1 + stats.spread * 0.35;
  const focus = stats.height * 0.5;
  camera.aspect = aspect;
  camera.position.set(Math.sin(AZIMUTH) * Math.cos(ELEVATION) * distance, focus + Math.sin(ELEVATION) * distance, Math.cos(AZIMUTH) * Math.cos(ELEVATION) * distance);
  camera.lookAt(0, focus, 0);
  camera.updateProjectionMatrix();

  bark.geometry = request.bark;
  foliage.geometry = request.foliage;
  return renderSnapshot(gl, scene, camera, width, height);
}

export function disposePortraitStudio(): void {
  portraitSet?.materials.dispose();
  portraitSet = null;
}
