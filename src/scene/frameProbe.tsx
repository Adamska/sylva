'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

interface FrameProbeTargets {
  fps: HTMLElement | null;
  frameTime: HTMLElement | null;
}

export const frameProbeTargets: FrameProbeTargets = { fps: null, frameTime: null };

const SAMPLE_WINDOW_SECONDS = 0.5;

export function FrameProbe() {
  const sample = useRef({ frames: 0, elapsed: 0 });

  useFrame((_, delta) => {
    const current = sample.current;
    current.frames++;
    current.elapsed += delta;
    if (current.elapsed < SAMPLE_WINDOW_SECONDS) return;

    const fps = current.frames / current.elapsed;
    if (frameProbeTargets.fps) frameProbeTargets.fps.textContent = fps.toFixed(0);
    if (frameProbeTargets.frameTime) frameProbeTargets.frameTime.textContent = (1000 / fps).toFixed(1);
    current.frames = 0;
    current.elapsed = 0;
  });

  return null;
}
