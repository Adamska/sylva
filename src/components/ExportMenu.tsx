'use client';

import { useEffect, useRef, useState } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { EXPORT_ACTIONS } from '@/studio/actions';

export function ExportMenu() {
  const activity = useBotanyStore((state) => state.activity);
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    return () => window.removeEventListener('pointerdown', close);
  }, [open]);

  return (
    <div ref={container} className="relative ml-auto">
      {open && (
        <ul
          role="menu"
          className="absolute bottom-full right-0 mb-2 w-60 overflow-hidden rounded-xl border border-hairline bg-[#0d0e12]/95 py-1 shadow-[0_24px_70px_-20px_rgba(0,0,0,0.95)] backdrop-blur-md"
        >
          {EXPORT_ACTIONS.map((action) => (
            <li key={action.id} role="none">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  void action.run();
                }}
                className="flex w-full flex-col gap-0.5 px-3.5 py-2 text-left transition-colors hover:bg-white/5"
              >
                <span className="text-[11px] text-bone">{action.label}</span>
                <span className="text-[10px] text-lichen">{action.hint}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={activity !== null}
        onClick={() => setOpen((current) => !current)}
        className="rounded-md bg-brass px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-obsidian transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {activity ? activity.label : 'Export'}
      </button>
    </div>
  );
}
