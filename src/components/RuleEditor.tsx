'use client';

import { useMemo, useState } from 'react';
import { useBotanyStore } from '@/store/useBotanyStore';
import { AXIOM_ORIGIN, MAX_RULES } from '@/types/botany';
import { AlphabetLegend } from './AlphabetLegend';
import { countUnbalanced, SentenceField } from './ui/SentenceField';

const linkClass = 'text-[10px] uppercase tracking-[0.14em] text-brass transition-opacity hover:opacity-80 disabled:opacity-30';

function BracketWarning({ sentence }: { sentence: string }) {
  const count = countUnbalanced(sentence);
  if (count === 0) return null;
  return (
    <p className="font-mono text-[10px] text-[#f08a70]">
      {count} unbalanced {count === 1 ? 'bracket' : 'brackets'}
    </p>
  );
}

export function RuleEditor() {
  const axiom = useBotanyStore((state) => state.species.grammar.axiom);
  const rules = useBotanyStore((state) => state.species.grammar.rules);
  const highlightRule = useBotanyStore((state) => state.highlightRule);
  const setGrammar = useBotanyStore((state) => state.setGrammar);
  const setRule = useBotanyStore((state) => state.setRule);
  const addRule = useBotanyStore((state) => state.addRule);
  const removeRule = useBotanyStore((state) => state.removeRule);
  const setHighlightRule = useBotanyStore((state) => state.setHighlightRule);
  const [legendOpen, setLegendOpen] = useState(false);
  const rewritten = useMemo(() => new Set(rules.map((rule) => rule.symbol)), [rules]);

  const trace = (rule: number) => ({
    onMouseEnter: () => setHighlightRule(rule),
    onMouseLeave: () => setHighlightRule(null),
    onFocus: () => setHighlightRule(rule),
    onBlur: () => setHighlightRule(null),
  });
  const rowClass = (rule: number) =>
    `flex flex-col gap-1 rounded-md border-l-2 pl-2 transition-colors ${highlightRule === rule ? 'border-brass' : 'border-transparent'}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-lichen">Axiom</span>
        <button type="button" aria-expanded={legendOpen} onClick={() => setLegendOpen((open) => !open)} className={linkClass}>
          {legendOpen ? 'Hide alphabet' : 'Alphabet'}
        </button>
      </div>
      {legendOpen && <AlphabetLegend />}

      <div className={rowClass(AXIOM_ORIGIN)} {...trace(AXIOM_ORIGIN)}>
        <SentenceField label="Axiom" value={axiom} maxLength={120} rewritten={rewritten} onChange={(value) => setGrammar({ axiom: value })} />
        <BracketWarning sentence={axiom} />
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="text-[11px] text-lichen">Production rules</span>
        <button type="button" onClick={addRule} disabled={rules.length >= MAX_RULES} className={linkClass}>
          Add rule
        </button>
      </div>

      {rules.map((rule, index) => (
        <div key={index} className={rowClass(index)} {...trace(index)}>
          <div className="grid grid-cols-[1.9rem_auto_1fr_auto] items-start gap-1.5">
            <input
              className="rounded-md border border-hairline bg-black/30 py-1.5 text-center font-mono text-[11px] text-[#6fd0c4] outline-none focus:border-brass/60"
              value={rule.symbol}
              maxLength={1}
              spellCheck={false}
              aria-label={`Rule ${index + 1} symbol`}
              onChange={(event) => setRule(index, { symbol: event.target.value.replace(/[^A-Za-z]/g, '').slice(-1) || rule.symbol })}
            />
            <span className="pt-1.5 font-mono text-[11px] text-lichen">→</span>
            <SentenceField
              label={`Rule ${index + 1} successor`}
              value={rule.successor}
              maxLength={200}
              rewritten={rewritten}
              onChange={(successor) => setRule(index, { successor })}
            />
            <button
              type="button"
              onClick={() => removeRule(index)}
              aria-label={`Remove rule ${index + 1}`}
              className="px-1 pt-1 font-mono text-xs text-lichen transition-colors hover:text-bone"
            >
              ×
            </button>
          </div>
          <BracketWarning sentence={rule.successor} />
        </div>
      ))}
      <p className="text-[10px] leading-snug text-lichen/70">Hover a rule to light the growth it produced.</p>
    </div>
  );
}
