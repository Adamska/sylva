import type { StateCreator } from 'zustand';
import { MAX_RULES, speciesSchema, type Grammar, type LightingMood, type Palette, type PlantForm, type ProductionRule, type Species } from '@/types/botany';
import type { GrammarResponse, GrammarSource } from '@/types/grammarApi';
import { DEFAULT_PRESET, SPECIES_PRESETS } from '@/types/presets';
import type { BotanyState } from './useBotanyStore';

export type TaskStatus = 'idle' | 'working' | 'done' | 'error';

interface HistoryEntry {
  species: Species;
  presetId: string | null;
}

export interface GenerationState {
  status: TaskStatus;
  source: GrammarSource | null;
  message: string | null;
}

export interface SpeciesSlice {
  species: Species;
  presetId: string | null;
  growthCycle: number;
  past: HistoryEntry[];
  future: HistoryEntry[];
  generation: GenerationState;
  selectPreset: (id: string) => void;
  adoptSpecies: (species: Species, presetId?: string | null) => void;
  setGrammar: (patch: Partial<Grammar>) => void;
  setForm: (patch: Partial<PlantForm>) => void;
  setPalette: (patch: Partial<Palette>) => void;
  setMood: (mood: LightingMood) => void;
  setRule: (index: number, patch: Partial<ProductionRule>) => void;
  addRule: () => void;
  removeRule: (index: number) => void;
  reseed: () => void;
  undo: () => void;
  redo: () => void;
  growFromPrompt: (prompt: string) => Promise<void>;
}

const HISTORY_LIMIT = 80;
const COALESCE_MS = 700;
const UNSAFE_SENTENCE_CHARACTERS = /[^A-Za-z0-9+\-&^\\/|[\]!().]/g;
const IDLE_GENERATION: GenerationState = { status: 'idle', source: null, message: null };

export const cleanSentence = (text: string) => text.replace(UNSAFE_SENTENCE_CHARACTERS, '');

let lastEdit = { tag: '', at: 0 };

function remember(state: BotanyState, tag: string): Pick<SpeciesSlice, 'past' | 'future'> {
  const now = Date.now();
  const coalesce = tag === lastEdit.tag && now - lastEdit.at < COALESCE_MS;
  lastEdit = { tag, at: now };
  if (coalesce) return { past: state.past, future: [] };
  const entry = { species: state.species, presetId: state.presetId };
  return { past: [...state.past.slice(-HISTORY_LIMIT + 1), entry], future: [] };
}

export const createSpeciesSlice: StateCreator<BotanyState, [], [], SpeciesSlice> = (set, get) => {
  const edit = (tag: string, change: (species: Species) => Partial<Species>, keepPreset = false) =>
    set((state) => ({
      ...remember(state, tag),
      species: { ...state.species, ...change(state.species) },
      presetId: keepPreset ? state.presetId : null,
    }));
  const editGrammar = (tag: string, change: (grammar: Grammar) => Partial<Grammar>) =>
    edit(tag, (species) => ({ grammar: { ...species.grammar, ...change(species.grammar) } }));

  return {
    species: DEFAULT_PRESET.species,
    presetId: DEFAULT_PRESET.id,
    growthCycle: 0,
    past: [],
    future: [],
    generation: IDLE_GENERATION,

    selectPreset: (id) => {
      const preset = SPECIES_PRESETS.find((candidate) => candidate.id === id);
      if (preset) get().adoptSpecies(preset.species, preset.id);
    },
    adoptSpecies: (species, presetId = null) =>
      set((state) => ({
        ...remember(state, `adopt-${state.growthCycle}`),
        species,
        presetId,
        growthCycle: state.growthCycle + 1,
        generation: IDLE_GENERATION,
      })),
    setGrammar: (patch) => editGrammar(`grammar-${Object.keys(patch).join()}`, () => patch),
    setForm: (patch) => edit(`form-${Object.keys(patch).join()}`, (species) => ({ form: { ...species.form, ...patch } })),
    setPalette: (patch) => edit(`palette-${Object.keys(patch).join()}`, (species) => ({ palette: { ...species.palette, ...patch } }), true),
    setMood: (mood) => edit('mood', () => ({ mood }), true),
    setRule: (index, patch) =>
      editGrammar(`rule-${index}`, (grammar) => ({
        rules: grammar.rules.map((rule, position) => (position === index ? { ...rule, ...patch } : rule)),
      })),
    addRule: () =>
      editGrammar('add-rule', (grammar) => {
        if (grammar.rules.length >= MAX_RULES) return {};
        const taken = new Set(grammar.rules.map((rule) => rule.symbol));
        const symbol = [...'ABCDEGHIJMNOPQRSTUVWXYZ'].find((letter) => !taken.has(letter)) ?? 'A';
        return { rules: [...grammar.rules, { symbol, successor: 'F' }] };
      }),
    removeRule: (index) => editGrammar('remove-rule', (grammar) => ({ rules: grammar.rules.filter((_, position) => position !== index) })),
    reseed: () =>
      set((state) => ({
        ...remember(state, `reseed-${state.growthCycle}`),
        species: { ...state.species, seed: Math.floor(Math.random() * 0xffffffff) },
        growthCycle: state.growthCycle + 1,
      })),

    undo: () =>
      set((state) => {
        const entry = state.past.at(-1);
        if (!entry) return state;
        lastEdit = { tag: '', at: 0 };
        return { ...entry, past: state.past.slice(0, -1), future: [{ species: state.species, presetId: state.presetId }, ...state.future] };
      }),
    redo: () =>
      set((state) => {
        const [entry, ...future] = state.future;
        if (!entry) return state;
        lastEdit = { tag: '', at: 0 };
        return { ...entry, future, past: [...state.past, { species: state.species, presetId: state.presetId }] };
      }),

    growFromPrompt: async (prompt) => {
      const description = prompt.trim();
      if (!description || get().generation.status === 'working') return;
      set({ generation: { status: 'working', source: null, message: null } });
      try {
        const response = await fetch('/api/grammar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: description }),
        });
        if (!response.ok) throw new Error(`Grammar service responded with ${response.status}`);
        const payload = (await response.json()) as Partial<GrammarResponse>;
        get().adoptSpecies(speciesSchema.parse(payload.species));
        set({ generation: { status: 'done', source: payload.source ?? 'procedural', message: payload.notice ?? null } });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'The grammar could not be generated';
        set({ generation: { status: 'error', source: null, message } });
      }
    },
  };
};
