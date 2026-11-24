'use client';

import { useState, type FormEvent } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { PROMPT_MAX_LENGTH } from '@/types/grammarApi';

const SOURCE_LABELS = {
  openai: 'Grammar composed by the language model',
  procedural: 'Grammar grown by the procedural generator',
} as const;

export function SpeciesPromptBar() {
  const [prompt, setPrompt] = useState('');
  const generation = useBotanyStore((state) => state.generation);
  const growFromPrompt = useBotanyStore((state) => state.growFromPrompt);
  const working = generation.status === 'working';

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void growFromPrompt(prompt);
  };

  const status =
    generation.status === 'error'
      ? generation.message
      : generation.status === 'done' && generation.source
        ? (generation.message ?? SOURCE_LABELS[generation.source])
        : null;

  return (
    <div className="pointer-events-auto flex w-full max-w-[34rem] flex-col items-center gap-2">
      <p
        aria-live="polite"
        className={`h-4 font-mono text-[10px] tracking-wide ${generation.status === 'error' ? 'text-[#e8a08a]' : 'text-lichen'}`}
      >
        {working ? 'Translating description into a grammar' : status}
      </p>
      <form
        onSubmit={submit}
        className="relative flex w-full items-center gap-2 overflow-hidden rounded-full border border-hairline bg-[#0b0c0f]/55 py-1.5 pl-5 pr-1.5 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.95)] backdrop-blur-md transition-colors focus-within:border-brass/50"
      >
        <span className="font-serif text-lg italic text-brass">Species</span>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={PROMPT_MAX_LENGTH}
          spellCheck={false}
          aria-label="Describe a plant to grow"
          placeholder="crimson weeping cherry at midnight"
          className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] text-bone outline-none placeholder:text-lichen/55"
        />
        <button
          type="submit"
          disabled={working || prompt.trim().length === 0}
          className="rounded-full bg-brass px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-obsidian transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {working ? 'Growing' : 'Grow'}
        </button>
        {working && <span className="sylva-progress absolute inset-x-0 bottom-0 h-px" />}
      </form>
    </div>
  );
}
