'use client';

import { useBotanyStore } from '@/store/useBotanyStore';
import { SPECIES_PRESETS } from '@/types/presets';

export function HerbariumShelf() {
  const presetId = useBotanyStore((state) => state.presetId);
  const selectPreset = useBotanyStore((state) => state.selectPreset);

  return (
    <div className="sylva-scroll -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
      {SPECIES_PRESETS.map((preset, index) => (
        <button
          key={preset.id}
          type="button"
          aria-pressed={preset.id === presetId}
          onClick={() => selectPreset(preset.id)}
          className={`flex w-[5.4rem] shrink-0 flex-col gap-0.5 rounded-lg border px-2 py-2 text-left transition-colors ${
            preset.id === presetId ? 'border-brass/60 bg-brass/10' : 'border-hairline hover:border-white/25'
          }`}
        >
          <span className="font-mono text-[9px] tabular-nums text-lichen">No. {String(index + 1).padStart(2, '0')}</span>
          <span className="line-clamp-2 text-[11px] leading-tight text-bone">{preset.species.name}</span>
        </button>
      ))}
    </div>
  );
}
