'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { COMMANDS } from '@/studio/commands';

const MOD_LABEL = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

function matches(query: string, text: string): boolean {
  const haystack = text.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

export function CommandPalette() {
  const setPaletteOpen = useBotanyStore((state) => state.setPaletteOpen);
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const list = useRef<HTMLUListElement>(null);
  const results = useMemo(() => COMMANDS.filter((command) => matches(query, `${command.group} ${command.title}`)), [query]);
  const active = Math.min(cursor, results.length - 1);

  useEffect(() => {
    list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const run = (index: number) => {
    const command = results[index];
    if (!command) return;
    setPaletteOpen(false);
    command.run();
  };

  return (
    <div className="absolute inset-0 z-40 flex justify-center bg-black/40 px-4 pt-[14dvh]" onPointerDown={() => setPaletteOpen(false)}>
      <div
        role="dialog"
        aria-label="Command palette"
        onPointerDown={(event) => event.stopPropagation()}
        className="flex h-fit max-h-[60dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-hairline bg-[#0d0e12]/90 shadow-[0_40px_120px_-30px_rgba(0,0,0,1)] backdrop-blur-md"
      >
        <input
          autoFocus
          value={query}
          placeholder="Search commands"
          aria-label="Search commands"
          spellCheck={false}
          onChange={(event) => {
            setQuery(event.target.value);
            setCursor(0);
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setCursor((active + (event.key === 'ArrowDown' ? 1 : results.length - 1)) % Math.max(1, results.length));
            } else if (event.key === 'Enter') run(active);
          }}
          className="border-b border-hairline bg-transparent px-4 py-3.5 text-sm text-bone outline-none placeholder:text-lichen/60"
        />
        <ul ref={list} role="listbox" className="sylva-scroll overflow-y-auto py-1.5">
          {results.map((command, index) => (
            <li
              key={command.id}
              role="option"
              aria-selected={index === active}
              onPointerMove={() => setCursor(index)}
              onClick={() => run(index)}
              className={`flex cursor-pointer items-center gap-3 px-4 py-2 ${index === active ? 'bg-brass/10' : ''}`}
            >
              <span className="w-16 shrink-0 font-mono text-[9px] uppercase tracking-[0.14em] text-lichen">{command.group}</span>
              <span className={`flex-1 text-[12px] ${index === active ? 'text-brass' : 'text-bone'}`}>{command.title}</span>
              {command.shortcut && <kbd className="font-mono text-[10px] text-lichen">{command.shortcut.replace('Mod', MOD_LABEL).replace(/\+/g, ' ')}</kbd>}
            </li>
          ))}
          {results.length === 0 && <li className="px-4 py-3 text-[12px] text-lichen">No matching command</li>}
        </ul>
      </div>
    </div>
  );
}
