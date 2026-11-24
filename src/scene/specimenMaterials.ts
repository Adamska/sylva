import { Color, DoubleSide, FrontSide, ShaderMaterial, Vector2, Vector3 } from 'three';
import barkFragment from '@/shaders/bark.frag';
import barkVertex from '@/shaders/bark.vert';
import depthFragment from '@/shaders/depth.frag';
import foliageFragment from '@/shaders/foliage.frag';
import foliageVertex from '@/shaders/foliage.vert';
import lightingChunk from '@/shaders/lighting.glsl';
import windChunk from '@/shaders/wind.glsl';
import type { Palette } from '@/types/botany';
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
  const barkVertexShader = `${windChunk}\n${barkVertex}`;
  const foliageVertexShader = `${windChunk}\n${foliageVertex}`;

  const bark = new ShaderMaterial({
    name: 'SylvaBark',
    uniforms,
    vertexShader: barkVertexShader,
    fragmentShader: `${lightingChunk}\n${barkFragment}`,
    side: FrontSide,
  });
  const foliage = new ShaderMaterial({
    name: 'SylvaFoliage',
    uniforms,
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
