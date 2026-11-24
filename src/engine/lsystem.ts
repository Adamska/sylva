import type { Grammar, ProductionRule } from '@/types/botany';
import { createRng, type Rng } from './random';

export const EXPANSION_LIMITS = {
  maxSymbols: 180_000,
  maxIterations: 9,
} as const;

export interface Expansion {
  sentence: string;
  generations: number;
  truncated: boolean;
}

type RuleTable = Map<string, string[]>;

function buildRuleTable(rules: readonly ProductionRule[]): RuleTable {
  const table: RuleTable = new Map();
  for (const rule of rules) {
    const successors = table.get(rule.symbol);
    if (successors) successors.push(rule.successor);
    else table.set(rule.symbol, [rule.successor]);
  }
  return table;
}

function moduleEnd(sentence: string, index: number): number {
  if (sentence[index + 1] !== '(') return index + 1;
  const close = sentence.indexOf(')', index + 2);
  return close === -1 ? sentence.length : close + 1;
}

function rewrite(sentence: string, table: RuleTable, rng: Rng, budget: number): string | null {
  const parts: string[] = [];
  let length = 0;
  let index = 0;
  while (index < sentence.length) {
    const end = moduleEnd(sentence, index);
    const successors = table.get(sentence[index]);
    const piece = successors
      ? successors[successors.length === 1 ? 0 : Math.floor(rng() * successors.length)]
      : sentence.slice(index, end);
    length += piece.length;
    if (length > budget) return null;
    parts.push(piece);
    index = end;
  }
  return parts.join('');
}

export function expandGrammar(grammar: Grammar, seed: number): Expansion {
  const table = buildRuleTable(grammar.rules);
  const rng = createRng(seed);
  const rounds = Math.min(Math.max(0, Math.floor(grammar.iterations)), EXPANSION_LIMITS.maxIterations);
  let sentence = grammar.axiom.slice(0, EXPANSION_LIMITS.maxSymbols);
  let generations = 0;

  for (; generations < rounds; generations++) {
    const next = rewrite(sentence, table, rng, EXPANSION_LIMITS.maxSymbols);
    if (next === null) return { sentence, generations, truncated: true };
    if (next === sentence) break;
    sentence = next;
  }
  return { sentence, generations, truncated: false };
}
