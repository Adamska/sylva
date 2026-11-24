'use client';

import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { CanvasTexture, Color, MeshStandardMaterial, ShaderMaterial, SRGBColorSpace } from 'three';
import backdropFragment from '@/shaders/backdrop.frag';
import backdropVertex from '@/shaders/backdrop.vert';
import { useBotanyStore } from '@/store/useBotanyStore';
import { MOODS } from './moods';
import { AMBIENCE_GROUP } from './studioBridge';

const PEDESTAL_SEGMENTS = 96;
const FLOOR_LEVEL = -0.565;

const TIERS: readonly { top: number; bottom: number; height: number; y: number }[] = [
  { top: 0.62, bottom: 0.64, height: 0.035, y: -0.0175 },
  { top: 0.98, bottom: 1.0, height: 0.035, y: -0.0525 },
  { top: 1.32, bottom: 1.34, height: 0.035, y: -0.0875 },
  { top: 1.62, bottom: 1.66, height: 0.1, y: -0.155 },
  { top: 1.5, bottom: 1.5, height: 0.26, y: -0.335 },
  { top: 1.72, bottom: 1.76, height: 0.1, y: -0.515 },
];

function createRadialTexture(plateau: number): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(plateau, '#ffffff');
    gradient.addColorStop(plateau + (1 - plateau) * 0.5, '#3c3c3c');
    gradient.addColorStop(1, '#000000');
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function Backdrop({ base, halo }: { base: string; halo: string }) {
  const aspect = useThree((state) => state.size.width / state.size.height);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: backdropVertex,
        fragmentShader: backdropFragment,
        uniforms: { uBase: { value: new Color() }, uHalo: { value: new Color() }, uAspect: { value: 1 } },
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => {
    material.uniforms.uBase.value.set(base);
    material.uniforms.uHalo.value.set(halo);
    material.uniforms.uAspect.value = aspect;
  }, [material, base, halo, aspect]);

  return (
    <mesh name={AMBIENCE_GROUP} material={material} renderOrder={-10} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
    </mesh>
  );
}

function Pedestal({ accent }: { accent: string }) {
  const assets = useMemo(
    () => ({
      stone: new MeshStandardMaterial({ color: '#46474c', roughness: 0.72, metalness: 0.05 }),
      inlay: new MeshStandardMaterial({ color: '#b8935a', roughness: 0.3, metalness: 0.85, emissive: '#3a2a12' }),
      floor: new MeshStandardMaterial({ color: '#0e0f12', roughness: 0.86, metalness: 0, transparent: true }),
      contact: new MeshStandardMaterial({ color: '#000000', transparent: true, opacity: 0.55, depthWrite: false, roughness: 1 }),
      floorFade: createRadialTexture(0.3),
      contactFade: createRadialTexture(0.05),
    }),
    [],
  );

  useEffect(() => {
    assets.floor.alphaMap = assets.floorFade;
    assets.contact.alphaMap = assets.contactFade;
    return () => Object.values(assets).forEach((asset) => asset.dispose());
  }, [assets]);
  useEffect(() => {
    assets.inlay.emissive.set(accent).multiplyScalar(0.12);
  }, [assets, accent]);

  return (
    <group>
      {TIERS.map((tier) => (
        <mesh key={tier.y} position={[0, tier.y, 0]} material={assets.stone} castShadow receiveShadow>
          <cylinderGeometry args={[tier.top, tier.bottom, tier.height, PEDESTAL_SEGMENTS]} />
        </mesh>
      ))}
      {[1.33, 1.635].map((radius, index) => (
        <mesh key={radius} position={[0, index === 0 ? -0.069 : -0.104, 0]} rotation={[Math.PI / 2, 0, 0]} material={assets.inlay}>
          <torusGeometry args={[radius, 0.007, 8, 160]} />
        </mesh>
      ))}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} material={assets.contact}>
        <circleGeometry args={[0.6, 48]} />
      </mesh>
      <mesh name={AMBIENCE_GROUP} position={[0, FLOOR_LEVEL, 0]} rotation={[-Math.PI / 2, 0, 0]} material={assets.floor} receiveShadow>
        <circleGeometry args={[24, 96]} />
      </mesh>
    </group>
  );
}

export function StudioStage() {
  const mood = MOODS[useBotanyStore((state) => state.species.mood)];
  const reach = useBotanyStore((state) => (state.grove ? 9.5 : 5.5));

  return (
    <>
      <Backdrop base={mood.backdrop} halo={mood.halo} />
      <hemisphereLight args={[mood.skyColor, mood.groundColor, 1.6 * mood.exposure]} />
      <directionalLight
        castShadow
        position={mood.keyPosition}
        color={mood.keyColor}
        intensity={mood.keyIntensity * mood.exposure}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={6}
      >
        <orthographicCamera attach="shadow-camera" args={[-reach, reach, reach + 0.5, -reach * 0.6, 0.5, 30]} />
      </directionalLight>
      <directionalLight position={mood.backPosition} color={mood.backColor} intensity={mood.backIntensity * mood.exposure * 0.45} />
      <Pedestal accent={mood.rimColor} />
    </>
  );
}
