'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { useHerbariumStore } from '@/store/useHerbariumStore';
import { REFINEMENTS } from '@/studio/refinements';
import { PROMPT_MAX_LENGTH } from '@/types/grammarApi';

const SOURCE_LABELS = {
  openai: 'Grammar composed by the language model',
  procedural: 'Grammar grown by the procedural generator',
} as const;

const SUGGESTIONS = ['crimson weeping cherry at midnight', 'towering glowing blue fir', 'windswept golden bamboo', 'frozen ghost birch'] as const;
const chipClass =
  'shrink-0 rounded-full border border-hairline bg-[#0b0c0f]/55 px-2.5 py-1 text-[10px] text-bone/80 backdrop-blur-md transition-colors hover:border-brass/50 hover:text-brass';

export function SpeciesPromptBar() {
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);
  const [recall, setRecall] = useState(-1);
  const generation = useBotanyStore((state) => state.generation);
  const growFromPrompt = useBotanyStore((state) => state.growFromPrompt);
  const recent = useHerbariumStore((state) => state.prompts);
  const working = generation.status === 'working';
  const suggesting = focused && prompt.trim().length === 0;

  const grow = (description: string) => {
    const text = description.trim();
    if (!text) return;
    setPrompt(text);
    setRecall(-1);
    useHerbariumStore.getState().rememberPrompt(text);
    void growFromPrompt(text);
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    grow(prompt);
  };
  const recallHistory = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    const next = Math.max(-1, Math.min(recent.length - 1, recall + (event.key === 'ArrowUp' ? 1 : -1)));
    event.preventDefault();
    setRecall(next);
    setPrompt(next === -1 ? '' : recent[next]);
  };

  const status =
    generation.status === 'error'
      ? generation.message
      : generation.status === 'done' && generation.source
        ? (generation.message ?? SOURCE_LABELS[generation.source])
        : null;

  return (
    <div className="pointer-events-auto flex w-full max-w-[38rem] flex-col items-center gap-2">
      <p aria-live="polite" className={`h-4 font-mono text-[10px] tracking-wide ${generation.status === 'error' ? 'text-[#e8a08a]' : 'text-lichen'}`}>
        {working ? 'Translating description into a grammar' : status}
      </p>

      <div className="sylva-scroll flex w-full items-center gap-1.5 overflow-x-auto pb-0.5">
        <span className="shrink-0 pr-1 font-mono text-[9px] uppercase tracking-[0.16em] text-lichen">{suggesting ? 'Try' : 'Refine'}</span>
        {suggesting
          ? [...recent.slice(0, 2), ...SUGGESTIONS].slice(0, 5).map((suggestion) => (
              <button key={suggestion} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => grow(suggestion)} className={chipClass}>
                {suggestion}
              </button>
            ))
          : REFINEMENTS.map((refinement) => (
              <button key={refinement.id} type="button" onClick={refinement.apply} className={chipClass}>
                {refinement.label}
              </button>
            ))}
      </div>

      <form
        onSubmit={submit}
        className="relative flex w-full items-center gap-2 overflow-hidden rounded-full border border-hairline bg-[#0b0c0f]/55 py-1.5 pl-5 pr-1.5 shadow-[0_24px_70px_-30px_rgba(0,0,0,0.95)] backdrop-blur-md transition-colors focus-within:border-brass/50"
      >
        <span className="font-serif text-lg italic text-brass">Species</span>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={recallHistory}
          maxLength={PROMPT_MAX_LENGTH}
          spellCheck={false}
          aria-label="Describe a plant to grow"
          placeholder="Describe a plant, real or imagined"
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
