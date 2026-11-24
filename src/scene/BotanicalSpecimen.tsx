'use client';

import { useFrame } from '@react-three/fiber';
import { useDeferredValue, useEffect, useMemo, useRef } from 'react';
import type { Group, Mesh } from 'three';
import { requestBuild } from '@/engine/buildClient';
import { toGeometry } from '@/engine/geometry';
import type { SpecimenStats } from '@/engine/meshBuilder';
import { useBotanyStore } from '@/store/useBotanyStore';
import { Grove } from './Grove';
import { MOODS } from './moods';
import { applyMood, applyPalette, createSpecimenMaterials, organScale } from './specimenMaterials';
import { studio, type DisplayedSpecimen } from './studioBridge';

export const STAGE_ENVELOPE = { height: 4.6, spread: 2.7 } as const;
const GROW_SECONDS = 2.2;
const RETRACT_SECONDS = 0.55;
const DEG_TO_RAD = Math.PI / 180;

export function fitScale(stats: Pick<SpecimenStats, 'height' | 'spread'>): number {
  return Math.min(1, STAGE_ENVELOPE.height / stats.height, STAGE_ENVELOPE.spread / stats.spread);
}

function release(specimen: DisplayedSpecimen | null): void {
  specimen?.bark.dispose();
  specimen?.foliage.dispose();
}

export function BotanicalSpecimen() {
  const grammar = useDeferredValue(useBotanyStore((state) => state.species.grammar));
  const form = useDeferredValue(useBotanyStore((state) => state.species.form));
  const seed = useBotanyStore((state) => state.species.seed);
  const palette = useBotanyStore((state) => state.species.palette);
  const mood = useBotanyStore((state) => state.species.mood);
  const growthCycle = useBotanyStore((state) => state.growthCycle);

  const materials = useMemo(createSpecimenMaterials, []);
  const group = useRef<Group>(null);
  const barkMesh = useRef<Mesh>(null);
  const foliageMesh = useRef<Mesh>(null);
  const shown = useRef<DisplayedSpecimen | null>(null);
  const staged = useRef<DisplayedSpecimen | null>(null);
  const motion = useRef({ growth: 0, retracting: false, awaiting: false, windClock: 0 });

  useEffect(
    () => () => {
      materials.dispose();
      release(shown.current);
      release(staged.current);
      shown.current = staged.current = studio.specimen = null;
    },
    [materials],
  );

  useEffect(() => {
    let stale = false;
    motion.current.awaiting = true;
    void requestBuild({ grammar, form, seed }).then((data) => {
      if (stale) return;
      release(staged.current);
      staged.current = { bark: toGeometry(data.bark), foliage: toGeometry(data.foliage), stats: data.stats, trunkRadius: form.trunkRadius };
      motion.current.awaiting = false;
      useBotanyStore.getState().reportStats(data.stats);
    });
    return () => {
      stale = true;
    };
  }, [grammar, form, seed]);

  useEffect(() => {
    if (shown.current) motion.current.retracting = true;
  }, [growthCycle]);

  useEffect(() => {
    if (!motion.current.retracting) applyPalette(materials.uniforms, palette);
  }, [materials, palette]);
  useEffect(() => applyMood(materials.uniforms, MOODS[mood]), [materials, mood]);

  useFrame((state, delta) => {
    const { wind, shading, life, highlightRule, species } = useBotanyStore.getState();
    const { uniforms } = materials;
    const current = motion.current;
    const step = Math.min(delta, 0.1);
    const heading = wind.headingDeg * DEG_TO_RAD;

    if (current.retracting) {
      current.growth = Math.max(0, current.growth - step / RETRACT_SECONDS);
      if (current.growth === 0 && !current.awaiting) current.retracting = false;
    } else {
      current.growth = Math.min(1, current.growth + step / GROW_SECONDS);
    }

    const next = staged.current;
    if (next && !current.retracting && barkMesh.current && foliageMesh.current && group.current) {
      staged.current = null;
      release(shown.current);
      shown.current = studio.specimen = next;
      barkMesh.current.geometry = next.bark;
      foliageMesh.current.geometry = next.foliage;
      group.current.scale.setScalar(fitScale(next.stats));
      uniforms.uSpecimenHeight.value = next.stats.height;
      uniforms.uTrunkRadius.value = next.trunkRadius;
      applyPalette(uniforms, species.palette);
    }

    current.windClock += step * wind.speed;
    uniforms.uTime.value = state.clock.elapsedTime;
    uniforms.uWindTime.value = current.windClock;
    uniforms.uWindStrength.value += (wind.strength - uniforms.uWindStrength.value) * Math.min(1, step * 4);
    uniforms.uTurbulence.value = wind.turbulence;
    uniforms.uWindDirection.value.set(Math.cos(heading), Math.sin(heading));
    uniforms.uFlutter.value = shading.flutter;
    uniforms.uTranslucency.value = shading.translucency;
    uniforms.uBarkRelief.value = shading.barkRelief;
    uniforms.uGrowth.value = (1 - (1 - current.growth) ** 3) * life.age;
    uniforms.uSeason.value = life.season;
    uniforms.uOrganScale.value = organScale(species.form.organShape, life.season);
    uniforms.uHighlightRule.value = highlightRule ?? uniforms.uHighlightRule.value;
    uniforms.uHighlight.value += ((highlightRule === null ? 0 : 1) - uniforms.uHighlight.value) * Math.min(1, step * 10);
  });

  return (
    <>
      <Grove materials={materials} />
      <group ref={group}>
        <mesh ref={barkMesh} material={materials.bark} customDepthMaterial={materials.barkDepth} castShadow receiveShadow frustumCulled={false} dispose={null} />
        <mesh ref={foliageMesh} material={materials.foliage} customDepthMaterial={materials.foliageDepth} castShadow receiveShadow frustumCulled={false} dispose={null} />
      </group>
    </>
  );
}
