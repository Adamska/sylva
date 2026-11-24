'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { useHerbariumStore } from '@/store/useHerbariumStore';
import { readSharedSpecies } from '@/studio/shareLink';
import { useShortcuts } from '@/studio/useShortcuts';
import { CommandPalette } from './CommandPalette';
import { EvolveTray } from './EvolveTray';
import { FrameReadout } from './FrameReadout';
import { GrammarControls } from './GrammarControls';
import { PresentationOverlay } from './PresentationOverlay';
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
  const presenting = useBotanyStore((state) => state.presenting);
  const evolving = useBotanyStore((state) => state.evolving);
  const paletteOpen = useBotanyStore((state) => state.paletteOpen);
  const setEvolving = useBotanyStore((state) => state.setEvolving);
  const setPaletteOpen = useBotanyStore((state) => state.setPaletteOpen);
  const [sheetOpen, setSheetOpen] = useState(false);
  useShortcuts();

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
      {presenting && <PresentationOverlay />}
      {paletteOpen && <CommandPalette />}

      <div
        aria-hidden={presenting}
        className={`pointer-events-none absolute inset-0 flex gap-4 p-4 transition-opacity duration-500 lg:p-6 ${presenting ? 'invisible opacity-0' : 'opacity-100'}`}
      >
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <SpecimenPlacard />
            <div className="pointer-events-auto flex shrink-0 gap-1.5">
              <button type="button" onClick={() => setPaletteOpen(true)} className="sylva-pill hidden sm:block">
                Commands
              </button>
              <button type="button" onClick={() => setSheetOpen((open) => !open)} aria-expanded={sheetOpen} className="sylva-pill lg:hidden">
                {sheetOpen ? 'Close' : 'Inspector'}
              </button>
            </div>
          </div>
          <div className="flex items-end gap-6">
            <FrameReadout />
            <div className="flex min-w-0 flex-1 flex-col items-center gap-3 md:pr-44">
              {evolving && <EvolveTray onClose={() => setEvolving(false)} />}
              <SpeciesPromptBar />
            </div>
          </div>
        </div>

        <div
          className={`absolute inset-x-2 bottom-2 z-10 flex h-[68dvh] transition-transform duration-300 ease-out lg:static lg:h-auto lg:max-h-full lg:translate-y-0 ${
            sheetOpen ? 'translate-y-0' : 'translate-y-[110%]'
          }`}
        >
          <GrammarControls onEvolve={() => setEvolving(!evolving)} />
        </div>
      </div>
    </main>
  );
}
