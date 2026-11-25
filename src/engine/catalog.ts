import type { Species } from '@/types/botany';
import { SPECIES_PRESETS } from '@/types/presets';
import { FLOWERS } from './flowerCatalog';
import { synthesizeSpecies, titleCase } from './grammarSynth';
import { EXOTIC_BASES, SHRUB_BASES, TREES } from './treeCatalog';
import type { Variety } from './varieties';
import { DESCRIPTOR_WORDS } from './descriptors';
import { readText } from './wordMatch';

export const CATALOG_GROUPS = ['Featured', 'Trees', 'Shrubs', 'Flowers', 'Exotics'] as const;
export type CatalogGroup = (typeof CATALOG_GROUPS)[number];

export interface CatalogEntry {
  id: string;
  name: string;
  label: string;
  genus: string;
  group: CatalogGroup;
  keywords: string;
  presetId: string | null;
  grow: () => Species;
}

export interface CatalogHit {
  entry: CatalogEntry;
  token: string;
}

const groupOf = (variety: Variety): CatalogGroup => (SHRUB_BASES.has(variety.base) ? 'Shrubs' : EXOTIC_BASES.has(variety.base) ? 'Exotics' : 'Trees');

function fromVariety(variety: Variety, group: CatalogGroup): CatalogEntry {
  const label = variety.words[0];
  let grown: Species | undefined;
  return {
    id: `${group.toLowerCase()}-${label.replace(/ /g, '-')}`,
    name: titleCase(label),
    label,
    genus: variety.genus,
    group,
    keywords: ` ${[...variety.words, ...(variety.hints ?? []), variety.genus.toLowerCase()].join(' ')} `,
    presetId: null,
    grow: () => (grown ??= synthesizeSpecies(label)),
  };
}

const featured: CatalogEntry[] = SPECIES_PRESETS.map(({ id, species }) => ({
  id,
  name: species.name,
  label: species.name.toLowerCase(),
  genus: species.latin.split(' ')[0],
  group: 'Featured',
  keywords: ` ${readText(`${species.name} ${species.latin}`).words.join(' ')} `,
  presetId: id,
  grow: () => species,
}));

const byName = (a: CatalogEntry, b: CatalogEntry) => a.name.localeCompare(b.name);

export const CATALOG: readonly CatalogEntry[] = [
  ...featured,
  ...TREES.map((tree) => fromVariety(tree, groupOf(tree))).sort(byName),
  ...FLOWERS.map((flower) => fromVariety(flower, 'Flowers')).sort(byName),
];

export function filterCatalog(query: string, group: CatalogGroup | null): CatalogEntry[] {
  const tokens = readText(query).words;
  return CATALOG.filter((entry) => (group === null || entry.group === group) && tokens.every((token) => entry.keywords.includes(` ${token}`)));
}

export function suggestFromCatalog(query: string, limit: number): CatalogHit[] {
  const tokens = readText(query).words.filter((token) => token.length >= 2 && !DESCRIPTOR_WORDS.includes(token));
  const hits: (CatalogHit & { rank: number })[] = [];
  for (const entry of CATALOG) {
    if (entry.presetId) continue;
    const token = tokens.filter((candidate) => entry.keywords.includes(` ${candidate}`)).sort((a, b) => b.length - a.length)[0];
    if (!token) continue;
    const exact = entry.keywords.includes(` ${token} `);
    hits.push({ entry, token, rank: token.length * 4 + (entry.label.startsWith(token) ? 2 : 0) + (exact ? 50 : 0) });
  }
  return hits.sort((a, b) => b.rank - a.rank || byName(a.entry, b.entry)).slice(0, limit);
}
