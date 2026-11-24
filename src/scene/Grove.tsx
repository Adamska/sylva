'use client';

import { useDeferredValue, useEffect, useState } from 'react';
import type { BufferGeometry } from 'three';
import { requestBuild } from '@/engine/buildClient';
import { toGeometry } from '@/engine/geometry';
import { useBotanyStore } from '@/store/useBotanyStore';
import { fitScale } from './BotanicalSpecimen';
import type { SpecimenMaterials } from './specimenMaterials';

interface Sibling {
  bark: BufferGeometry;
  foliage: BufferGeometry;
  scale: number;
}

export const GROVE_REACH = 6.2;
const FLOOR_LEVEL = -0.565;
const SIBLING_DETAIL = 0.6;
const PLOTS = [
  { angleDeg: 100, radius: 4.8, seedOffset: 7919, size: 0.86 },
  { angleDeg: 160, radius: 5.6, seedOffset: 15485, size: 0.94 },
  { angleDeg: 215, radius: 5.2, seedOffset: 32452, size: 0.8 },
  { angleDeg: 270, radius: 4.6, seedOffset: 49979, size: 0.9 },
] as const;

export function Grove({ materials }: { materials: SpecimenMaterials }) {
  const enabled = useBotanyStore((state) => state.grove);
  const grammar = useDeferredValue(useBotanyStore((state) => state.species.grammar));
  const form = useDeferredValue(useBotanyStore((state) => state.species.form));
  const seed = useBotanyStore((state) => state.species.seed);
  const [siblings, setSiblings] = useState<Sibling[]>([]);

  useEffect(() => {
    if (!enabled) {
      setSiblings([]);
      return;
    }
    let stale = false;
    const builds = PLOTS.map((plot) => requestBuild({ grammar, form, seed: (seed + plot.seedOffset) >>> 0, detail: SIBLING_DETAIL }));
    void Promise.all(builds).then((results) => {
      if (stale) return;
      setSiblings(
        results.map((data, index) => ({
          bark: toGeometry(data.bark),
          foliage: toGeometry(data.foliage),
          scale: fitScale(data.stats) * PLOTS[index].size,
        })),
      );
    });
    return () => {
      stale = true;
    };
  }, [enabled, grammar, form, seed]);

  useEffect(
    () => () =>
      siblings.forEach((sibling) => {
        sibling.bark.dispose();
        sibling.foliage.dispose();
      }),
    [siblings],
  );

  return siblings.map((sibling, index) => {
    const plot = PLOTS[index];
    const angle = (plot.angleDeg * Math.PI) / 180;
    return (
      <group key={index} position={[Math.sin(angle) * plot.radius, FLOOR_LEVEL, Math.cos(angle) * plot.radius]} scale={sibling.scale} rotation={[0, angle, 0]}>
        <mesh geometry={sibling.bark} material={materials.bark} customDepthMaterial={materials.barkDepth} castShadow receiveShadow frustumCulled={false} dispose={null} />
        <mesh geometry={sibling.foliage} material={materials.foliage} customDepthMaterial={materials.foliageDepth} castShadow receiveShadow frustumCulled={false} dispose={null} />
      </group>
    );
  });
}
