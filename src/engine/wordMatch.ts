export interface Reading {
  plain: string;
  singular: string;
  stems: ReadonlySet<string>;
  words: readonly string[];
}

export interface Keyed {
  words: readonly string[];
}

export interface Match<Entry extends Keyed> {
  entry: Entry;
  word: string;
}

const stemsOf = (word: string) => [word, word.replace(/s$/, ''), word.replace(/x$/, ''), word.replace(/es$/, ''), word.replace(/e$/, ''), word.replace(/ies$/, 'y')];
const singularOf = (word: string) => (word.endsWith('ies') ? `${word.slice(0, -3)}y` : word.replace(/[sx]$/, ''));
const isPhrase = (word: string) => word.includes(' ');

function fromWords(words: readonly string[]): Reading {
  return { plain: ` ${words.join(' ')} `, singular: ` ${words.map(singularOf).join(' ')} `, stems: new Set(words.flatMap(stemsOf)), words };
}

export function readText(raw: string): Reading {
  const folded = raw.toLowerCase().replace(/œ/g, 'oe').replace(/æ/g, 'ae').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return fromWords(folded.split(/[^a-z]+/).filter(Boolean));
}

export function matches(reading: Reading, word: string): boolean {
  return isPhrase(word) ? reading.plain.includes(` ${word} `) || reading.singular.includes(` ${word} `) : reading.stems.has(word);
}

export const hasWord = (reading: Reading, words: readonly string[]) => words.some((word) => matches(reading, word));

export function withoutWord(reading: Reading, word: string): Reading {
  const parts = word.split(' ');
  return fromWords(reading.words.filter((candidate) => !parts.some((part) => stemsOf(candidate).includes(part) || singularOf(candidate) === part)));
}

export function findMatches<Entry extends Keyed>(reading: Reading, entries: readonly Entry[]): Match<Entry>[] {
  return entries.flatMap((entry) => entry.words.filter((word) => matches(reading, word)).map((word) => ({ entry, word })));
}

function editDistance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

export function findNearest<Entry extends Keyed>(reading: Reading, entries: readonly Entry[]): Match<Entry> | null {
  let best: Match<Entry> | null = null;
  let bestDistance = Infinity;
  for (const entry of entries) {
    for (const word of entry.words) {
      if (isPhrase(word) || word.length < 6) continue;
      const allowed = word.length >= 9 ? 2 : 1;
      for (const candidate of reading.words) {
        if (candidate[0] !== word[0] || Math.abs(candidate.length - word.length) > allowed + 1) continue;
        const distance = Math.min(editDistance(candidate, word), editDistance(singularOf(candidate), word));
        if (distance <= allowed && distance < bestDistance) {
          best = { entry, word: candidate };
          bestDistance = distance;
        }
      }
    }
  }
  return best;
}
