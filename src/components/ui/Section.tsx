'use client';

import { useState, type ReactNode } from 'react';

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-t border-hairline">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-bone/80 transition-colors hover:text-brass"
      >
        {title}
        <span className="font-mono text-xs text-lichen">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="flex flex-col gap-3 px-4 pb-4">{children}</div>}
    </section>
  );
}
