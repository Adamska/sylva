'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cachedThumbnail, requestThumbnail } from '@/capture/thumbnailQueue';
import { CATALOG, CATALOG_GROUPS, filterCatalog, type CatalogEntry, type CatalogGroup } from '@/engine/catalog';
import { useBotanyStore } from '@/store/useBotanyStore';

const GROUP_COUNTS = new Map(CATALOG_GROUPS.map((group) => [group, CATALOG.filter((entry) => entry.group === group).length]));
const filterClass = (active: boolean) =>
  `rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] transition-colors ${
    active ? 'border-brass/60 bg-brass/10 text-brass' : 'border-hairline text-lichen hover:text-bone'
  }`;

function CatalogCard({ entry, onPick }: { entry: CatalogEntry; onPick: (entry: CatalogEntry) => void }) {
  const frame = useRef<HTMLButtonElement>(null);
  const [thumbnail, setThumbnail] = useState(() => cachedThumbnail(entry.id));

  useEffect(() => {
    const element = frame.current;
    if (thumbnail || !element) return;
    let cancel: (() => void) | null = null;
    const observer = new IntersectionObserver(
      ([item]) => {
        if (!item.isIntersecting) return;
        observer.disconnect();
        cancel = requestThumbnail(entry.id, entry.grow, setThumbnail);
      },
      { rootMargin: '160px' },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancel?.();
    };
  }, [entry, thumbnail]);

  return (
    <button
      ref={frame}
      type="button"
      onClick={() => onPick(entry)}
      className="group flex flex-col overflow-hidden rounded-xl border border-hairline text-left transition-colors hover:border-brass/60"
    >
      <span className="flex h-28 items-center justify-center bg-gradient-to-b from-white/[0.06] to-transparent">
        {thumbnail ? (
          <img src={thumbnail} alt="" className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="sylva-progress h-px w-10" />
        )}
      </span>
      <span className="flex flex-col gap-0.5 px-2 pb-2 pt-1.5">
        <span className="truncate text-[11px] leading-tight text-bone group-hover:text-brass">{entry.name}</span>
        <span className="truncate font-serif text-[11px] italic leading-tight text-lichen">{entry.genus}</span>
      </span>
    </button>
  );
}

export function CatalogPanel() {
  const setCatalogOpen = useBotanyStore((state) => state.setCatalogOpen);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<CatalogGroup | null>(null);
  const results = useMemo(() => filterCatalog(query, group), [query, group]);
  const sections = CATALOG_GROUPS.map((name) => ({ name, entries: results.filter((entry) => entry.group === name) })).filter((section) => section.entries.length > 0);

  const pick = (entry: CatalogEntry) => {
    const store = useBotanyStore.getState();
    if (entry.presetId) store.selectPreset(entry.presetId);
    else store.plantFromCatalog(entry.grow());
    setCatalogOpen(false);
  };

  return (
    <div className="absolute inset-0 z-40 flex justify-center bg-black/55 p-3 sm:p-8" onPointerDown={() => setCatalogOpen(false)}>
      <section
        role="dialog"
        aria-label="Species catalogue"
        onPointerDown={(event) => event.stopPropagation()}
        className="flex h-full w-full max-w-[66rem] flex-col overflow-hidden rounded-2xl border border-hairline bg-[#0d0e12] shadow-[0_40px_120px_-30px_rgba(0,0,0,1)]"
      >
        <header className="flex flex-col gap-3 border-b border-hairline px-5 pb-3.5 pt-4">
          <div className="flex items-baseline gap-4">
            <h2 className="font-serif text-2xl leading-none text-bone">Catalogue</h2>
            <p className="mr-auto font-mono text-[10px] tabular-nums text-lichen">
              {results.length} of {CATALOG.length} species
            </p>
            <button type="button" onClick={() => setCatalogOpen(false)} className="text-[10px] uppercase tracking-[0.14em] text-bone/75 hover:text-bone">
              Close
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              autoFocus
              value={query}
              spellCheck={false}
              placeholder="Search in English or French"
              aria-label="Search the catalogue"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && results[0] && pick(results[0])}
              className="mr-2 min-w-[12rem] flex-1 rounded-full border border-hairline bg-transparent px-4 py-1.5 text-[13px] text-bone outline-none placeholder:text-lichen/55 focus:border-brass/50"
            />
            <button type="button" aria-pressed={group === null} onClick={() => setGroup(null)} className={filterClass(group === null)}>
              All
            </button>
            {CATALOG_GROUPS.map((name) => (
              <button key={name} type="button" aria-pressed={group === name} onClick={() => setGroup(name)} className={filterClass(group === name)}>
                {name} <span className="font-mono tabular-nums opacity-70">{GROUP_COUNTS.get(name)}</span>
              </button>
            ))}
          </div>
        </header>
        <div className="sylva-scroll flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-4">
          {sections.map((section) => (
            <div key={section.name} className="flex flex-col gap-2">
              <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-bone/70">{section.name}</h3>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(7.4rem,1fr))] gap-2">
                {section.entries.map((entry) => (
                  <CatalogCard key={entry.id} entry={entry} onPick={pick} />
                ))}
              </div>
            </div>
          ))}
          {sections.length === 0 && <p className="py-8 text-center text-[12px] text-lichen">Nothing in the catalogue matches. Describe it in the species bar instead.</p>}
        </div>
      </section>
    </div>
  );
}
