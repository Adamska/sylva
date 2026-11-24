'use client';

import { useFrame } from '@react-three/fiber';
import { useDeferredValue, useEffect, useMemo, useRef } from 'react';
import { downloadGlb, exportSpecimenGlb, specimenFileName } from '@/engine/glbExporter';
import { buildSpecimen, type SpecimenStats } from '@/engine/meshBuilder';
import { useBotanyStore } from '@/store/useBotanyStore';
import { MOODS } from './moods';
import { applyMood, applyPalette, createSpecimenMaterials } from './specimenMaterials';

export const STAGE_ENVELOPE = { height: 4.6, spread: 2.7 } as const;
const GROWTH_SECONDS = 2.2;
const EXPORT_NOTICE_MS = 2400;
const DEG_TO_RAD = Math.PI / 180;

export function fitScale(stats: Pick<SpecimenStats, 'height' | 'spread'>): number {
  return Math.min(1, STAGE_ENVELOPE.height / stats.height, STAGE_ENVELOPE.spread / stats.spread);
}

export function BotanicalSpecimen() {
  const grammar = useDeferredValue(useBotanyStore((state) => state.species.grammar));
  const form = useDeferredValue(useBotanyStore((state) => state.species.form));
  const seed = useBotanyStore((state) => state.species.seed);
  const palette = useBotanyStore((state) => state.species.palette);
  const mood = useBotanyStore((state) => state.species.mood);
  const growthCycle = useBotanyStore((state) => state.growthCycle);
  const exportRequest = useBotanyStore((state) => state.exportRequest);

  const materials = useMemo(createSpecimenMaterials, []);
  const build = useMemo(() => buildSpecimen({ grammar, form, seed }), [grammar, form, seed]);
  const latestBuild = useRef(build);
  const growth = useRef(0);
  const windClock = useRef(0);

  useEffect(() => () => materials.dispose(), [materials]);

  useEffect(() => {
    latestBuild.current = build;
    useBotanyStore.getState().reportStats(build.stats);
    return () => {
      build.bark.dispose();
      build.foliage.dispose();
    };
  }, [build]);

  useEffect(() => {
    growth.current = 0;
  }, [growthCycle]);

  useEffect(() => {
    materials.uniforms.uSpecimenHeight.value = build.stats.height;
    materials.uniforms.uTrunkRadius.value = form.trunkRadius;
  }, [materials, build, form]);

  useEffect(() => applyPalette(materials.uniforms, palette), [materials, palette]);
  useEffect(() => applyMood(materials.uniforms, MOODS[mood]), [materials, mood]);

  useEffect(() => {
    if (exportRequest === 0) return;
    const { species, setExportStatus } = useBotanyStore.getState();
    const { bark, foliage } = latestBuild.current;
    let cancelled = false;
    let reset: ReturnType<typeof setTimeout> | undefined;
    const settle = (status: 'done' | 'error') => {
      if (cancelled) return;
      setExportStatus(status);
      reset = setTimeout(() => setExportStatus('idle'), EXPORT_NOTICE_MS);
    };
    setExportStatus('working');
    exportSpecimenGlb({ species, bark, foliage })
      .then((buffer) => {
        if (!cancelled) downloadGlb(buffer, specimenFileName(species));
        settle('done');
      })
      .catch(() => settle('error'));
    return () => {
      cancelled = true;
      clearTimeout(reset);
    };
  }, [exportRequest]);

  useFrame((state, delta) => {
    const { wind, shading } = useBotanyStore.getState();
    const { uniforms } = materials;
    const step = Math.min(delta, 0.1);
    const heading = wind.headingDeg * DEG_TO_RAD;

    windClock.current += step * wind.speed;
    growth.current = Math.min(1, growth.current + step / GROWTH_SECONDS);
    const eased = 1 - (1 - growth.current) ** 3;

    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uWindTime.value = windClock.current;
    uniforms.uWindStrength.value += (wind.strength - uniforms.uWindStrength.value) * Math.min(1, step * 4);
    uniforms.uTurbulence.value = wind.turbulence;
    uniforms.uWindDirection.value.set(Math.cos(heading), Math.sin(heading));
    uniforms.uFlutter.value = shading.flutter;
    uniforms.uTranslucency.value = shading.translucency;
    uniforms.uBarkRelief.value = shading.barkRelief;
    uniforms.uGrowth.value = eased;
  });

  return (
    <group scale={fitScale(build.stats)}>
      <mesh geometry={build.bark} material={materials.bark} customDepthMaterial={materials.barkDepth} castShadow frustumCulled={false} />
      <mesh geometry={build.foliage} material={materials.foliage} customDepthMaterial={materials.foliageDepth} castShadow frustumCulled={false} />
    </group>
  );
}
