'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { useHerbariumStore } from '@/store/useHerbariumStore';
import { readSharedSpecies } from '@/studio/shareLink';
import { EvolveTray } from './EvolveTray';
import { FrameReadout } from './FrameReadout';
import { GrammarControls } from './GrammarControls';
import { SpeciesPromptBar } from './SpeciesPromptBar';
import { SpecimenPlacard } from './SpecimenPlacard';
import { StatusToast } from './StatusToast';

const SpecimenCanvas = dynamic(() => import('@/scene/SpecimenCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center font-mono text-[10px] uppercase tracking-[0.2em] text-lichen">
      Preparing the atelier
    </div>
  ),
});

export function Atelier() {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [evolving, setEvolving] = useState(false);

  useEffect(() => {
    void useHerbariumStore.persist.rehydrate();
    const shared = readSharedSpecies(window.location.hash);
    if (shared) useBotanyStore.getState().adoptSpecies(shared);
  }, []);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-obsidian">
      <div className="absolute inset-0">
        <SpecimenCanvas />
      </div>
      <StatusToast />

      <div className="pointer-events-none absolute inset-0 flex gap-4 p-4 lg:p-6">
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <SpecimenPlacard />
          <div className="flex items-end gap-6">
            <FrameReadout />
            <div className="flex flex-1 flex-col items-center gap-3 md:pr-44">
              {evolving && <EvolveTray onClose={() => setEvolving(false)} />}
              <SpeciesPromptBar />
            </div>
          </div>
        </div>

        <div className={`${inspectorOpen ? 'flex' : 'hidden'} absolute inset-y-4 right-4 max-h-[calc(100%-5rem)] lg:static lg:flex lg:max-h-full`}>
          <GrammarControls onEvolve={() => setEvolving((open) => !open)} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setInspectorOpen((open) => !open)}
        aria-expanded={inspectorOpen}
        className="absolute right-4 top-4 z-10 rounded-full border border-hairline bg-[#0b0c0f]/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-bone backdrop-blur-md lg:hidden"
      >
        {inspectorOpen ? 'Close' : 'Inspector'}
      </button>
    </main>
  );
}
