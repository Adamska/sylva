'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { MathUtils, PerspectiveCamera, Vector3 } from 'three';
import type { OrbitControls } from 'three-stdlib';
import { useBotanyStore } from '@/store/useBotanyStore';
import { fitScale } from './BotanicalSpecimen';
import { GROVE_REACH } from './Grove';
import { studio } from './studioBridge';

const INSPECTOR_BREAKPOINT = 1024;
const INSPECTOR_SHIFT = 156;
const BASE_FOV = 30;
const MAX_FOV = 58;
const HORIZONTAL_HALF_TANGENT = Math.tan(MathUtils.degToRad(BASE_FOV / 2)) * 1.25;
const REFRAME_THRESHOLD = 0.12;
const PLINTH_DEPTH = 0.9;
const offset = new Vector3();

export function CameraRig() {
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const size = useThree((state) => state.size);
  const controls = useThree((state) => state.controls) as OrbitControls | null;
  const stats = useBotanyStore((state) => state.stats);
  const grove = useBotanyStore((state) => state.grove);
  const growthCycle = useBotanyStore((state) => state.growthCycle);
  const goal = useRef({ distance: 0, height: 2, framed: 0, cycle: -1, active: false });

  useEffect(() => {
    Object.assign(studio, { gl, scene, camera, controls });
    if (!controls) return;
    controls.target.set(0, goal.current.height, 0);
    const release = () => {
      goal.current.active = false;
    };
    controls.addEventListener('start', release);
    return () => {
      controls.removeEventListener('start', release);
      Object.assign(studio, { gl: null, scene: null, camera: null, controls: null });
    };
  }, [gl, scene, camera, controls]);

  useEffect(() => {
    if (!(camera instanceof PerspectiveCamera)) return;
    const shift = size.width >= INSPECTOR_BREAKPOINT ? INSPECTOR_SHIFT : 0;
    const fitted = MathUtils.radToDeg(2 * Math.atan(HORIZONTAL_HALF_TANGENT / (size.width / size.height)));
    camera.fov = MathUtils.clamp(fitted, BASE_FOV, MAX_FOV);
    camera.setViewOffset(size.width, size.height, shift, 0, size.width, size.height);
    return () => camera.clearViewOffset();
  }, [camera, size]);

  useEffect(() => {
    if (!stats || !(camera instanceof PerspectiveCamera)) return;
    const scale = fitScale(stats);
    const halfTangent = Math.tan(MathUtils.degToRad(camera.fov / 2));
    const usableAspect = Math.max(0.4, (size.width - (size.width >= INSPECTOR_BREAKPOINT ? INSPECTOR_SHIFT * 2 : 0)) / size.height);
    const halfHeight = (stats.height * scale + PLINTH_DEPTH) / 2;
    const halfWidth = grove ? GROVE_REACH : stats.spread * scale + 0.5;
    const distance = Math.max(halfHeight / halfTangent, halfWidth / (halfTangent * usableAspect)) * 1.12 + halfWidth * 0.4;
    const current = goal.current;
    const moved = Math.abs(distance - current.framed) / Math.max(1, current.framed) > REFRAME_THRESHOLD;
    current.height = (stats.height * scale) / 2;
    if (moved || current.cycle !== growthCycle) {
      Object.assign(current, { distance, framed: distance, cycle: growthCycle, active: true });
    }
  }, [stats, grove, growthCycle, camera, size]);

  useFrame((_, delta) => {
    if (!controls) return;
    const current = goal.current;
    const ease = Math.min(1, delta * 2.4);
    controls.target.y += (current.height - controls.target.y) * ease;

    if (current.active) {
      offset.copy(camera.position).sub(controls.target);
      const radius = offset.length();
      const next = radius + (current.distance - radius) * ease;
      camera.position.copy(controls.target).addScaledVector(offset, next / radius);
      if (Math.abs(current.distance - next) < 0.01) current.active = false;
    }

    const turntable = studio.turntable;
    if (turntable) {
      controls.setAzimuthalAngle(controls.getAzimuthalAngle() + (Math.PI * 2 * delta) / turntable.seconds);
      turntable.elapsed += delta;
    }
  });

  return null;
}
