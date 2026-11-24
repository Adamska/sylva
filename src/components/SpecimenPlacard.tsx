'use client';

import { useBotanyStore } from '@/store/useBotanyStore';
import { SPECIES_PRESETS } from '@/types/presets';

export function SpecimenPlacard() {
  const name = useBotanyStore((state) => state.species.name);
  const latin = useBotanyStore((state) => state.species.latin);
  const seed = useBotanyStore((state) => state.species.seed);
  const presetId = useBotanyStore((state) => state.presetId);
  const presetIndex = SPECIES_PRESETS.findIndex((preset) => preset.id === presetId);
  const catalogue = presetIndex >= 0 ? `No. ${String(presetIndex + 1).padStart(2, '0')}` : 'Cultivar';

  return (
    <header className="pointer-events-none flex max-w-md flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl leading-none tracking-tight text-bone">Sylva</span>
        <span className="hidden h-px w-8 bg-hairline sm:block" />
        <span className="hidden text-[10px] uppercase tracking-[0.22em] text-lichen sm:block">Botanical grammar atelier</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] tabular-nums text-brass">
          {catalogue} · Seed {seed.toString(16).padStart(8, '0')}
        </span>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-bone sm:text-5xl">{name}</h1>
        <p className="font-serif text-lg italic text-lichen">{latin}</p>
      </div>
    </header>
  );
}
