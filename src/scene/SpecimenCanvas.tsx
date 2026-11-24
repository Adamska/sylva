'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, DepthOfField, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useBotanyStore } from '@/store/useBotanyStore';
import { Atmosphere } from './Atmosphere';
import { BotanicalSpecimen } from './BotanicalSpecimen';
import { CameraRig } from './CameraRig';
import { FrameProbe } from './frameProbe';
import { StudioStage } from './StudioStage';
import { AMBIENCE_GROUP } from './studioBridge';

const MSAA_SAMPLES = 4;

export default function SpecimenCanvas() {
  const autoRotate = useBotanyStore((state) => state.autoRotate || state.presenting);
  const bloom = useBotanyStore((state) => state.shading.bloom);
  const depthOfField = useBotanyStore((state) => state.shading.depthOfField);
  const focusHeight = useBotanyStore((state) => (state.stats ? Math.min(state.stats.height, 4.6) / 2 : 2));

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ position: [6.1, 3.1, 10.1], fov: 30, near: 0.1, far: 90 }}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
    >
      <StudioStage />
      <group name={AMBIENCE_GROUP}>
        <Atmosphere />
      </group>
      <BotanicalSpecimen />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={3.5}
        maxDistance={32}
        maxPolarAngle={Math.PI * 0.53}
        autoRotate={autoRotate}
        autoRotateSpeed={0.45}
      />
      <EffectComposer multisampling={depthOfField > 0 ? 0 : MSAA_SAMPLES}>
        {depthOfField > 0 ? <DepthOfField target={[0, focusHeight, 0]} focalLength={0.025} bokehScale={depthOfField * 3} /> : <></>}
        <Bloom mipmapBlur intensity={bloom} luminanceThreshold={0.82} luminanceSmoothing={0.3} radius={0.72} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
      <CameraRig />
      <FrameProbe />
    </Canvas>
  );
}
