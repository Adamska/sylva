'use client';

import { useEffect, useState } from 'react';
import { createThumbnail } from '@/capture/thumbnails';
import { breedVariants, type Variant } from '@/engine/mutation';
import { useBotanyStore } from '@/store/useBotanyStore';

const VARIANT_COUNT = 6;

interface Candidate extends Variant {
  thumbnail: string | null;
}

export function EvolveTray({ onClose }: { onClose: () => void }) {
  const adoptSpecies = useBotanyStore((state) => state.adoptSpecies);
  const [generation, setGeneration] = useState(1);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    let cancelled = false;
    const variants = breedVariants(useBotanyStore.getState().species, generation, VARIANT_COUNT);
    setCandidates(variants.map((variant) => ({ ...variant, thumbnail: null })));
    void (async () => {
      for (const [index, variant] of variants.entries()) {
        const thumbnail = await createThumbnail(variant.species);
        if (cancelled) return;
        setCandidates((current) => current.map((candidate, position) => (position === index ? { ...candidate, thumbnail } : candidate)));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [generation]);

  const adopt = (candidate: Candidate) => {
    adoptSpecies(candidate.species);
    setGeneration((current) => current + 1);
  };

  return (
    <section
      aria-label="Evolve the specimen"
      className="pointer-events-auto flex w-full max-w-[44rem] flex-col gap-3 rounded-2xl border border-hairline bg-[#0b0c0f]/70 p-4 shadow-[0_32px_90px_-30px_rgba(0,0,0,0.95)] backdrop-blur-md"
    >
      <header className="flex items-baseline gap-4">
        <h2 className="font-serif text-xl leading-none text-bone">Evolve</h2>
        <p className="mr-auto text-[11px] text-lichen">Keep the variant you prefer. It becomes the parent of the next six.</p>
        <span className="font-mono text-[10px] tabular-nums text-lichen">Gen. {String(generation).padStart(2, '0')}</span>
        <button type="button" onClick={() => setGeneration((current) => current + 1)} className="text-[10px] uppercase tracking-[0.14em] text-brass hover:opacity-80">
          Shuffle
        </button>
        <button type="button" onClick={onClose} className="text-[10px] uppercase tracking-[0.14em] text-bone/75 hover:text-bone">
          Close
        </button>
      </header>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {candidates.map((candidate, index) => (
          <button
            key={`${generation}-${index}`}
            type="button"
            onClick={() => adopt(candidate)}
            className="group flex flex-col overflow-hidden rounded-xl border border-hairline text-left transition-colors hover:border-brass/60"
          >
            <span className="flex h-28 items-center justify-center bg-gradient-to-b from-white/[0.06] to-transparent">
              {candidate.thumbnail ? (
                    <img src={candidate.thumbnail} alt="" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <span className="sylva-progress h-px w-10" />
              )}
            </span>
            <span className="min-h-[2.4rem] px-2 py-1.5 text-[10px] leading-snug text-lichen group-hover:text-bone">{candidate.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
