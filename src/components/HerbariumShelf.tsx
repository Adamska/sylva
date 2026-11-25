'use client';

import { useEffect } from 'react';
import { createThumbnail } from '@/capture/thumbnails';
import { CATALOG } from '@/engine/catalog';
import { useBotanyStore } from '@/store/useBotanyStore';
import { useHerbariumStore } from '@/store/useHerbariumStore';
import { saveToHerbarium } from '@/studio/actions';
import { SPECIES_PRESETS } from '@/types/presets';

interface CardProps {
  caption: string;
  name: string;
  thumbnail: string | undefined;
  active: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

function SpecimenCard({ caption, name, thumbnail, active, onSelect, onRemove }: CardProps) {
  return (
    <div className="group relative w-[5.6rem] shrink-0">
      <button
        type="button"
        aria-pressed={active}
        onClick={onSelect}
        className={`flex w-full flex-col overflow-hidden rounded-lg border text-left transition-colors ${
          active ? 'border-brass/70 bg-brass/10' : 'border-hairline hover:border-white/25'
        }`}
      >
        <span className="flex h-[4.6rem] items-end justify-center bg-gradient-to-b from-white/[0.05] to-transparent">
          {thumbnail ? (
            <img src={thumbnail} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="mb-3 h-8 w-px bg-hairline" />
          )}
        </span>
        <span className="flex flex-col gap-0.5 px-2 pb-1.5 pt-1">
          <span className="font-mono text-[9px] tabular-nums text-lichen">{caption}</span>
          <span className="truncate text-[10.5px] leading-tight text-bone">{name}</span>
        </span>
      </button>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${name} from the herbarium`}
          className="absolute right-1 top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-black/70 font-mono text-[10px] text-bone group-hover:flex"
        >
          ×
        </button>
      )}
    </div>
  );
}

export function HerbariumShelf() {
  const presetId = useBotanyStore((state) => state.presetId);
  const currentSeed = useBotanyStore((state) => state.species.seed);
  const selectPreset = useBotanyStore((state) => state.selectPreset);
  const adoptSpecies = useBotanyStore((state) => state.adoptSpecies);
  const saved = useHerbariumStore((state) => state.saved);
  const presetThumbnails = useHerbariumStore((state) => state.presetThumbnails);
  const remove = useHerbariumStore((state) => state.remove);
  const setCatalogOpen = useBotanyStore((state) => state.setCatalogOpen);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      for (const preset of SPECIES_PRESETS) {
        if (cancelled || useHerbariumStore.getState().presetThumbnails[preset.id]) continue;
        const thumbnail = await createThumbnail(preset.species);
        if (!cancelled) useHerbariumStore.getState().setPresetThumbnail(preset.id, thumbnail);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="sylva-scroll -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1.5">
      <button
        type="button"
        onClick={() => setCatalogOpen(true)}
        className="flex w-[5.6rem] shrink-0 flex-col justify-between rounded-lg border border-brass/40 bg-brass/[0.07] px-2 pb-1.5 pt-2 text-left transition-colors hover:border-brass/70 hover:bg-brass/15"
      >
        <span className="font-serif text-[1.7rem] leading-none text-brass">{CATALOG.length}</span>
        <span className="flex flex-col gap-0.5">
          <span className="font-mono text-[9px] text-lichen">Browse all</span>
          <span className="text-[10.5px] leading-tight text-bone">Catalogue</span>
        </span>
      </button>
      {SPECIES_PRESETS.map((preset, index) => (
        <SpecimenCard
          key={preset.id}
          caption={`No. ${String(index + 1).padStart(2, '0')}`}
          name={preset.species.name}
          thumbnail={presetThumbnails[preset.id]}
          active={preset.id === presetId}
          onSelect={() => selectPreset(preset.id)}
        />
      ))}
      {saved.map((specimen) => (
        <SpecimenCard
          key={specimen.id}
          caption="Saved"
          name={specimen.species.name}
          thumbnail={specimen.thumbnail}
          active={presetId === null && specimen.species.seed === currentSeed}
          onSelect={() => adoptSpecies(specimen.species)}
          onRemove={() => remove(specimen.id)}
        />
      ))}
      <button
        type="button"
        onClick={() => void saveToHerbarium()}
        className="flex w-[5.6rem] shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-hairline text-[10px] uppercase tracking-[0.14em] text-lichen transition-colors hover:border-brass/50 hover:text-brass"
      >
        <span className="font-mono text-base leading-none">+</span>
        Save
      </button>
    </div>
  );
}
