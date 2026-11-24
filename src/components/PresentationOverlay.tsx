'use client';

import { useEffect } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { SPECIES_PRESETS } from '@/types/presets';

const DWELL_MS = 14_000;

export function PresentationOverlay() {
  const name = useBotanyStore((state) => state.species.name);
  const latin = useBotanyStore((state) => state.species.latin);
  const setPresenting = useBotanyStore((state) => state.setPresenting);

  useEffect(() => {
    const timer = setInterval(() => {
      const { presetId, selectPreset } = useBotanyStore.getState();
      const index = SPECIES_PRESETS.findIndex((preset) => preset.id === presetId);
      selectPreset(SPECIES_PRESETS[(index + 1) % SPECIES_PRESETS.length].id);
    }, DWELL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-8 lg:p-12">
      <button
        type="button"
        onClick={() => setPresenting(false)}
        className="pointer-events-auto self-end font-mono text-[10px] uppercase tracking-[0.18em] text-bone/50 transition-colors hover:text-bone"
      >
        Exit presentation · Esc
      </button>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-brass">Sylva · Botanical grammar atelier</span>
        <h1 key={name} className="sylva-rise font-serif text-5xl leading-none tracking-tight text-bone lg:text-7xl">
          {name}
        </h1>
        <p key={latin} className="sylva-rise font-serif text-xl italic text-lichen lg:text-2xl">
          {latin}
        </p>
      </div>
    </div>
  );
}
