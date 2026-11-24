'use client';

import { useMemo } from 'react';
import { cleanSentence } from '@/store/useBotanyStore';

interface SentenceFieldProps {
  value: string;
  onChange: (value: string) => void;
  rewritten: ReadonlySet<string>;
  label: string;
  maxLength: number;
}

interface Token {
  text: string;
  tone: string;
}

const TONES = {
  wood: 'text-[#e0bd7c]',
  turn: 'text-[#8fb4d9]',
  bracket: 'font-medium text-bone',
  leaf: 'text-[#9ccf7a]',
  organ: 'text-[#f0a6c0]',
  argument: 'text-lichen/70',
  bud: 'text-[#6fd0c4]',
  inert: 'text-bone/45',
  broken: 'text-[#f08a70] underline decoration-wavy underline-offset-2',
} as const;

function toneFor(symbol: string, rewritten: ReadonlySet<string>): string {
  if (symbol === 'F' || symbol === 'f') return TONES.wood;
  if ('+-&^\\/|'.includes(symbol)) return TONES.turn;
  if (symbol === 'L') return TONES.leaf;
  if (symbol === 'K') return TONES.organ;
  return rewritten.has(symbol) ? TONES.bud : TONES.inert;
}

export function countUnbalanced(sentence: string): number {
  let depth = 0;
  let stray = 0;
  for (const symbol of sentence) {
    if (symbol === '[') depth++;
    else if (symbol === ']' && depth > 0) depth--;
    else if (symbol === ']') stray++;
  }
  return depth + stray;
}

function tokenize(sentence: string, rewritten: ReadonlySet<string>): Token[] {
  const unmatched = new Set<number>();
  const open: number[] = [];
  [...sentence].forEach((symbol, index) => {
    if (symbol === '[') open.push(index);
    else if (symbol === ']' && open.pop() === undefined) unmatched.add(index);
  });
  open.forEach((index) => unmatched.add(index));

  const tokens: Token[] = [];
  let index = 0;
  while (index < sentence.length) {
    const symbol = sentence[index];
    if (symbol === '(') {
      const close = sentence.indexOf(')', index);
      const end = close === -1 ? sentence.length : close + 1;
      tokens.push({ text: sentence.slice(index, end), tone: TONES.argument });
      index = end;
      continue;
    }
    const bracket = symbol === '[' || symbol === ']';
    tokens.push({ text: symbol, tone: unmatched.has(index) ? TONES.broken : bracket ? TONES.bracket : toneFor(symbol, rewritten) });
    index++;
  }
  return tokens;
}

const textClass = 'whitespace-pre-wrap break-all px-2 py-1.5 font-mono text-[11px] leading-[1.55]';

export function SentenceField({ value, onChange, rewritten, label, maxLength }: SentenceFieldProps) {
  const tokens = useMemo(() => tokenize(value, rewritten), [value, rewritten]);

  return (
    <div className="relative rounded-md border border-hairline bg-black/30 transition-colors focus-within:border-brass/60">
      <pre aria-hidden className={`${textClass} pointer-events-none min-h-[1.9rem]`}>
        {tokens.map((token, index) => (
          <span key={index} className={token.tone}>
            {token.text}
          </span>
        ))}
        {'\u200b'}
      </pre>
      <textarea
        value={value}
        aria-label={label}
        maxLength={maxLength}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        onChange={(event) => onChange(cleanSentence(event.target.value))}
        className={`${textClass} absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent text-transparent caret-bone outline-none`}
      />
    </div>
  );
}
