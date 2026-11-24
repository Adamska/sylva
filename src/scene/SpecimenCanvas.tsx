'use client';

import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect } from 'react';
import { MathUtils, PerspectiveCamera } from 'three';
import { useBotanyStore } from '@/store/useBotanyStore';
import { BotanicalSpecimen, fitScale } from './BotanicalSpecimen';
import { FrameProbe } from './frameProbe';
import { StudioStage } from './StudioStage';

const INSPECTOR_BREAKPOINT = 1024;
const INSPECTOR_SHIFT = 156;
const BASE_FOV = 30;
const MAX_FOV = 58;
const HORIZONTAL_HALF_TANGENT = Math.tan(MathUtils.degToRad(BASE_FOV / 2)) * 1.25;

function ViewFraming() {
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const shift = size.width >= INSPECTOR_BREAKPOINT ? INSPECTOR_SHIFT : 0;
    const fitted = MathUtils.radToDeg(2 * Math.atan(HORIZONTAL_HALF_TANGENT / (size.width / size.height)));
    camera.fov = MathUtils.clamp(fitted, BASE_FOV, MAX_FOV);
    camera.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
    return () => camera.clearViewOffset();
  }, [camera, size]);

  return null;
}

export default function SpecimenCanvas() {
  const autoRotate = useBotanyStore((state) => state.autoRotate);
  const bloom = useBotanyStore((state) => state.shading.bloom);
  const focusHeight = useBotanyStore((state) => (state.stats ? (state.stats.height * fitScale(state.stats)) / 2 : 2));

  return (
    <Canvas
      shadows="percentage"
      dpr={[1, 1.75]}
      camera={{ position: [6.1, 3.1, 10.1], fov: BASE_FOV, near: 0.1, far: 80 }}
      gl={{ antialias: false, powerPreference: 'high-performance', stencil: false }}
    >
      <StudioStage />
      <BotanicalSpecimen />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        minDistance={4.5}
        maxDistance={18}
        maxPolarAngle={Math.PI * 0.53}
        autoRotate={autoRotate}
        autoRotateSpeed={0.45}
        target={[0, focusHeight, 0]}
      />
      <EffectComposer multisampling={4}>
        <Bloom mipmapBlur intensity={bloom} luminanceThreshold={0.82} luminanceSmoothing={0.3} radius={0.72} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
      <ViewFraming />
      <FrameProbe />
    </Canvas>
  );
}
