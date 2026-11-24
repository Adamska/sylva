'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial, Vector3 } from 'three';
import { createRng } from '@/engine/random';
import mistFragment from '@/shaders/mist.frag';
import mistVertex from '@/shaders/mist.vert';
import motesFragment from '@/shaders/motes.frag';
import motesVertex from '@/shaders/motes.vert';
import { useBotanyStore } from '@/store/useBotanyStore';
import { MOODS } from './moods';

const MOTE_COUNT = 360;
const MOTE_RADIUS = 5.2;
const MIST_LEVEL = -0.5;

function createMoteGeometry(): BufferGeometry {
  const rng = createRng(20260);
  const positions = new Float32Array(MOTE_COUNT * 3);
  const seeds = new Float32Array(MOTE_COUNT * 3);
  for (let mote = 0; mote < MOTE_COUNT; mote++) {
    const angle = rng() * Math.PI * 2;
    const radius = Math.sqrt(rng()) * MOTE_RADIUS;
    positions.set([Math.cos(angle) * radius, rng() * 6.4, Math.sin(angle) * radius], mote * 3);
    seeds.set([rng(), rng(), rng()], mote * 3);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new BufferAttribute(seeds, 3));
  return geometry;
}

export function Atmosphere() {
  const moodId = useBotanyStore((state) => state.species.mood);
  const palette = useBotanyStore((state) => state.species.palette);
  const pixelRatio = useThree((state) => state.viewport.dpr);
  const height = useThree((state) => state.size.height);

  const assets = useMemo(() => {
    const additive = { blending: AdditiveBlending, depthWrite: false, transparent: true } as const;
    return {
      geometry: createMoteGeometry(),
      motes: new ShaderMaterial({
        ...additive,
        vertexShader: motesVertex,
        fragmentShader: motesFragment,
        uniforms: {
          uTime: { value: 0 },
          uScale: { value: 40 },
          uRise: { value: 0.05 },
          uHaze: { value: 0.6 },
          uGlow: { value: 0 },
          uBackDirection: { value: new Vector3(0, 0, -1) },
          uDustColor: { value: new Color() },
          uSporeColor: { value: new Color() },
        },
      }),
      mist: new ShaderMaterial({
        ...additive,
        vertexShader: mistVertex,
        fragmentShader: mistFragment,
        uniforms: { uTime: { value: 0 }, uHaze: { value: 0.6 }, uMistColor: { value: new Color() } },
      }),
    };
  }, []);

  useEffect(() => () => Object.values(assets).forEach((asset) => asset.dispose()), [assets]);

  useEffect(() => {
    const mood = MOODS[moodId];
    const motes = assets.motes.uniforms;
    motes.uBackDirection.value.set(...mood.backPosition).normalize();
    motes.uDustColor.value.set(mood.backColor).multiplyScalar(mood.backIntensity);
    motes.uSporeColor.value.set(palette.leafBright).lerp(new Color(palette.subsurface), 0.3);
    motes.uGlow.value = palette.glow;
    motes.uRise.value = 0.04 + palette.glow * 0.22;
    assets.mist.uniforms.uMistColor.value.set(mood.halo).lerp(new Color(mood.backColor), 0.35);
  }, [assets, moodId, palette]);

  useEffect(() => {
    assets.motes.uniforms.uScale.value = height * pixelRatio * 0.03;
  }, [assets, height, pixelRatio]);

  useFrame((state) => {
    const { haze } = useBotanyStore.getState().shading;
    assets.motes.uniforms.uTime.value = state.clock.elapsedTime;
    assets.motes.uniforms.uHaze.value = haze;
    assets.mist.uniforms.uTime.value = state.clock.elapsedTime;
    assets.mist.uniforms.uHaze.value = haze;
  });

  return (
    <>
      <points geometry={assets.geometry} material={assets.motes} frustumCulled={false} dispose={null} />
      <mesh position={[0, MIST_LEVEL, 0]} rotation={[-Math.PI / 2, 0, 0]} material={assets.mist} renderOrder={5} dispose={null}>
        <circleGeometry args={[11, 48]} />
      </mesh>
    </>
  );
}
