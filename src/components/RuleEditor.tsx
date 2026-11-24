'use client';

import { cleanSentence, useBotanyStore } from '@/store/useBotanyStore';
import { MAX_RULES } from '@/types/botany';

const fieldClass =
  'w-full rounded-md border border-hairline bg-black/30 px-2 py-1.5 font-mono text-[11px] text-bone outline-none transition-colors placeholder:text-lichen/50 focus:border-brass/60';

export function RuleEditor() {
  const axiom = useBotanyStore((state) => state.species.grammar.axiom);
  const rules = useBotanyStore((state) => state.species.grammar.rules);
  const setGrammar = useBotanyStore((state) => state.setGrammar);
  const setRule = useBotanyStore((state) => state.setRule);
  const addRule = useBotanyStore((state) => state.addRule);
  const removeRule = useBotanyStore((state) => state.removeRule);

  return (
    <div className="flex flex-col gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-[11px] text-lichen">Axiom</span>
        <input
          className={fieldClass}
          value={axiom}
          spellCheck={false}
          maxLength={120}
          onChange={(event) => setGrammar({ axiom: cleanSentence(event.target.value) })}
        />
      </label>

      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-lichen">Production rules</span>
        <button
          type="button"
          onClick={addRule}
          disabled={rules.length >= MAX_RULES}
          className="text-[10px] uppercase tracking-[0.14em] text-brass transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          Add rule
        </button>
      </div>

      {rules.map((rule, index) => (
        <div key={index} className="grid grid-cols-[2rem_auto_1fr_auto] items-center gap-1.5">
          <input
            className={`${fieldClass} text-center text-brass`}
            value={rule.symbol}
            maxLength={1}
            spellCheck={false}
            aria-label={`Rule ${index + 1} symbol`}
            onChange={(event) => setRule(index, { symbol: event.target.value.replace(/[^A-Za-z]/g, '').slice(-1) || rule.symbol })}
          />
          <span className="font-mono text-[11px] text-lichen">→</span>
          <input
            className={fieldClass}
            value={rule.successor}
            maxLength={200}
            spellCheck={false}
            aria-label={`Rule ${index + 1} successor`}
            onChange={(event) => setRule(index, { successor: cleanSentence(event.target.value) })}
          />
          <button
            type="button"
            onClick={() => removeRule(index)}
            aria-label={`Remove rule ${index + 1}`}
            className="px-1 font-mono text-xs text-lichen transition-colors hover:text-bone"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
