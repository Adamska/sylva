import { Color, DoubleSide, FrontSide, ShaderMaterial, UniformsLib, UniformsUtils, Vector2, Vector3 } from 'three';
import barkFragment from '@/shaders/bark.frag';
import barkVertex from '@/shaders/bark.vert';
import depthFragment from '@/shaders/depth.frag';
import foliageFragment from '@/shaders/foliage.frag';
import foliageVertex from '@/shaders/foliage.vert';
import lightingChunk from '@/shaders/lighting.glsl';
import windChunk from '@/shaders/wind.glsl';
import type { OrganShape, Palette } from '@/types/botany';
import type { MoodPreset } from './moods';

function createUniforms() {
  return {
    uTime: { value: 0 },
    uWindTime: { value: 0 },
    uWindStrength: { value: 0.6 },
    uTurbulence: { value: 1 },
    uWindDirection: { value: new Vector2(1, 0) },
    uSpecimenHeight: { value: 4 },
    uTrunkRadius: { value: 0.2 },
    uGrowth: { value: 1 },
    uSeason: { value: 0.3 },
    uOrganScale: { value: 1 },
    uHighlightRule: { value: 0 },
    uHighlight: { value: 0 },
    uFlutter: { value: 1 },
    uTranslucency: { value: 1 },
    uBarkRelief: { value: 1 },
    uGlow: { value: 0 },
    uKeyDirection: { value: new Vector3(0, 1, 0) },
    uKeyColor: { value: new Color() },
    uBackDirection: { value: new Vector3(0, 1, 0) },
    uBackColor: { value: new Color() },
    uSkyColor: { value: new Color() },
    uGroundColor: { value: new Color() },
    uRimColor: { value: new Color() },
    uBarkDark: { value: new Color() },
    uBarkLight: { value: new Color() },
    uLeafDeep: { value: new Color() },
    uLeafBright: { value: new Color() },
    uSubsurface: { value: new Color() },
    uGlowColor: { value: new Color() },
    uOrganColor: { value: new Color() },
    uOrganCore: { value: new Color() },
  };
}

export type SpecimenUniforms = ReturnType<typeof createUniforms>;

export interface SpecimenMaterials {
  uniforms: SpecimenUniforms;
  bark: ShaderMaterial;
  foliage: ShaderMaterial;
  barkDepth: ShaderMaterial;
  foliageDepth: ShaderMaterial;
  dispose: () => void;
}

export function createSpecimenMaterials(): SpecimenMaterials {
  const uniforms = createUniforms();
  const lit = { ...UniformsUtils.clone(UniformsLib.lights), ...uniforms };
  const barkVertexShader = `${windChunk}\n${barkVertex}`;
  const foliageVertexShader = `${windChunk}\n${foliageVertex}`;

  const bark = new ShaderMaterial({
    name: 'SylvaBark',
    uniforms: lit,
    lights: true,
    vertexShader: barkVertexShader,
    fragmentShader: `${lightingChunk}\n${barkFragment}`,
    side: FrontSide,
  });
  const foliage = new ShaderMaterial({
    name: 'SylvaFoliage',
    uniforms: lit,
    lights: true,
    vertexShader: foliageVertexShader,
    fragmentShader: `${lightingChunk}\n${foliageFragment}`,
    side: DoubleSide,
  });
  const barkDepth = new ShaderMaterial({
    name: 'SylvaBarkDepth',
    uniforms,
    vertexShader: barkVertexShader,
    fragmentShader: depthFragment,
  });
  const foliageDepth = new ShaderMaterial({
    name: 'SylvaFoliageDepth',
    uniforms,
    vertexShader: foliageVertexShader,
    fragmentShader: depthFragment,
    side: DoubleSide,
  });

  const materials = [bark, foliage, barkDepth, foliageDepth];
  return { uniforms, bark, foliage, barkDepth, foliageDepth, dispose: () => materials.forEach((material) => material.dispose()) };
}

export function applyPalette(uniforms: SpecimenUniforms, palette: Palette): void {
  uniforms.uBarkDark.value.set(palette.barkDark);
  uniforms.uBarkLight.value.set(palette.barkLight);
  uniforms.uLeafDeep.value.set(palette.leafDeep);
  uniforms.uLeafBright.value.set(palette.leafBright);
  uniforms.uSubsurface.value.set(palette.subsurface);
  uniforms.uOrganColor.value.set(palette.organ);
  uniforms.uOrganCore.value.set(palette.organCore);
  uniforms.uGlowColor.value.set(palette.leafBright).lerp(uniforms.uSubsurface.value, 0.25);
  uniforms.uGlow.value = palette.glow;
}

export function applyMood(uniforms: SpecimenUniforms, mood: MoodPreset): void {
  uniforms.uKeyDirection.value.set(...mood.keyPosition).normalize();
  uniforms.uKeyColor.value.set(mood.keyColor).multiplyScalar(mood.keyIntensity * mood.exposure);
  uniforms.uBackDirection.value.set(...mood.backPosition).normalize();
  uniforms.uBackColor.value.set(mood.backColor).multiplyScalar(mood.backIntensity * mood.exposure);
  uniforms.uSkyColor.value.set(mood.skyColor).multiplyScalar(mood.exposure);
  uniforms.uGroundColor.value.set(mood.groundColor).multiplyScalar(mood.exposure);
  uniforms.uRimColor.value.set(mood.rimColor);
}

const ramp = (from: number, to: number, value: number) => {
  const t = Math.min(1, Math.max(0, (value - from) / (to - from)));
  return t * t * (3 - 2 * t);
};

export function organScale(shape: OrganShape, season: number): number {
  if (shape === 'berry') return ramp(0.16, 0.3, season) * (1 - ramp(0.86, 0.97, season));
  if (shape === 'blossom') return ramp(0.02, 0.14, season) * (1 - ramp(0.42, 0.56, season));
  return ramp(0.04, 0.2, season) * (1 - ramp(0.62, 0.78, season));
}
