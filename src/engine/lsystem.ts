import { AXIOM_ORIGIN, type Grammar, type ProductionRule } from '@/types/botany';
import { createRng, type Rng } from './random';

export const EXPANSION_LIMITS = {
  maxSymbols: 180_000,
  maxIterations: 9,
} as const;

export interface Expansion {
  sentence: string;
  origins: Uint8Array;
  generations: number;
  truncated: boolean;
}

interface Successor {
  text: string;
  rule: number;
}

type RuleTable = Map<string, Successor[]>;

function buildRuleTable(rules: readonly ProductionRule[]): RuleTable {
  const table: RuleTable = new Map();
  rules.forEach((rule, index) => {
    const successor = { text: rule.successor, rule: index };
    const successors = table.get(rule.symbol);
    if (successors) successors.push(successor);
    else table.set(rule.symbol, [successor]);
  });
  return table;
}

function moduleEnd(sentence: string, index: number): number {
  if (sentence[index + 1] !== '(') return index + 1;
  const close = sentence.indexOf(')', index + 2);
  return close === -1 ? sentence.length : close + 1;
}

function rewrite(sentence: string, origins: Uint8Array, table: RuleTable, rng: Rng, budget: number): Expansion | null {
  const parts: string[] = [];
  const partOrigins: number[] = [];
  let length = 0;
  let index = 0;
  while (index < sentence.length) {
    const end = moduleEnd(sentence, index);
    const successors = table.get(sentence[index]);
    const chosen = successors ? successors[successors.length === 1 ? 0 : Math.floor(rng() * successors.length)] : null;
    const piece = chosen ? chosen.text : sentence.slice(index, end);
    length += piece.length;
    if (length > budget) return null;
    parts.push(piece);
    partOrigins.push(chosen ? chosen.rule : origins[index]);
    index = end;
  }

  const nextOrigins = new Uint8Array(length);
  let offset = 0;
  for (let part = 0; part < parts.length; part++) {
    nextOrigins.fill(partOrigins[part], offset, offset + parts[part].length);
    offset += parts[part].length;
  }
  return { sentence: parts.join(''), origins: nextOrigins, generations: 0, truncated: false };
}

export function expandGrammar(grammar: Grammar, seed: number): Expansion {
  const table = buildRuleTable(grammar.rules);
  const rng = createRng(seed);
  const rounds = Math.min(Math.max(0, Math.floor(grammar.iterations)), EXPANSION_LIMITS.maxIterations);
  let sentence = grammar.axiom.slice(0, EXPANSION_LIMITS.maxSymbols);
  let origins: Uint8Array = new Uint8Array(sentence.length).fill(AXIOM_ORIGIN);
  let generations = 0;

  for (; generations < rounds; generations++) {
    const next = rewrite(sentence, origins, table, rng, EXPANSION_LIMITS.maxSymbols);
    if (next === null) return { sentence, origins, generations, truncated: true };
    if (next.sentence === sentence) break;
    sentence = next.sentence;
    origins = next.origins;
  }
  return { sentence, origins, generations, truncated: false };
}
