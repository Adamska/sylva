import { create } from 'zustand';
import type { SpecimenStats } from '@/engine/meshBuilder';
import {
  DEFAULT_PRESET,
  MAX_RULES,
  SPECIES_PRESETS,
  speciesSchema,
  type Grammar,
  type LightingMood,
  type Palette,
  type PlantForm,
  type ProductionRule,
  type Species,
} from '@/types/botany';
import type { GrammarResponse, GrammarSource } from '@/types/grammarApi';

export interface WindSettings {
  strength: number;
  speed: number;
  turbulence: number;
  headingDeg: number;
}

export interface ShadingSettings {
  translucency: number;
  barkRelief: number;
  flutter: number;
  bloom: number;
}

export type TaskStatus = 'idle' | 'working' | 'done' | 'error';

interface GenerationState {
  status: TaskStatus;
  source: GrammarSource | null;
  message: string | null;
}

interface BotanyState {
  species: Species;
  presetId: string | null;
  growthCycle: number;
  wind: WindSettings;
  shading: ShadingSettings;
  autoRotate: boolean;
  stats: SpecimenStats | null;
  exportRequest: number;
  exportStatus: TaskStatus;
  generation: GenerationState;
  selectPreset: (id: string) => void;
  setGrammar: (patch: Partial<Grammar>) => void;
  setForm: (patch: Partial<PlantForm>) => void;
  setPalette: (patch: Partial<Palette>) => void;
  setMood: (mood: LightingMood) => void;
  setRule: (index: number, patch: Partial<ProductionRule>) => void;
  addRule: () => void;
  removeRule: (index: number) => void;
  reseed: () => void;
  setWind: (patch: Partial<WindSettings>) => void;
  setShading: (patch: Partial<ShadingSettings>) => void;
  toggleAutoRotate: () => void;
  reportStats: (stats: SpecimenStats) => void;
  requestExport: () => void;
  setExportStatus: (status: TaskStatus) => void;
  growFromPrompt: (prompt: string) => Promise<void>;
}

const UNSAFE_SENTENCE_CHARACTERS = /[^A-Za-z0-9+\-&^\\/|[\]!().]/g;
export const cleanSentence = (text: string) => text.replace(UNSAFE_SENTENCE_CHARACTERS, '');

const editSpecies = (state: BotanyState, patch: Partial<Species>) => ({
  species: { ...state.species, ...patch },
  presetId: null,
});

export const useBotanyStore = create<BotanyState>((set, get) => ({
  species: DEFAULT_PRESET.species,
  presetId: DEFAULT_PRESET.id,
  growthCycle: 0,
  wind: { strength: 0.55, speed: 1, turbulence: 1, headingDeg: 35 },
  shading: { translucency: 1, barkRelief: 1, flutter: 1, bloom: 0.6 },
  autoRotate: true,
  stats: null,
  exportRequest: 0,
  exportStatus: 'idle',
  generation: { status: 'idle', source: null, message: null },

  selectPreset: (id) => {
    const preset = SPECIES_PRESETS.find((candidate) => candidate.id === id);
    if (!preset) return;
    set((state) => ({
      species: preset.species,
      presetId: preset.id,
      growthCycle: state.growthCycle + 1,
      generation: { status: 'idle', source: null, message: null },
    }));
  },
  setGrammar: (patch) => set((state) => editSpecies(state, { grammar: { ...state.species.grammar, ...patch } })),
  setForm: (patch) => set((state) => editSpecies(state, { form: { ...state.species.form, ...patch } })),
  setPalette: (patch) => set((state) => ({ species: { ...state.species, palette: { ...state.species.palette, ...patch } } })),
  setMood: (mood) => set((state) => ({ species: { ...state.species, mood } })),
  setRule: (index, patch) =>
    set((state) => {
      const rules = state.species.grammar.rules.map((rule, position) => (position === index ? { ...rule, ...patch } : rule));
      return editSpecies(state, { grammar: { ...state.species.grammar, rules } });
    }),
  addRule: () =>
    set((state) => {
      const { rules } = state.species.grammar;
      if (rules.length >= MAX_RULES) return state;
      const taken = new Set(rules.map((rule) => rule.symbol));
      const symbol = [...'ABCDEGHIJKMNOPQRSTUVWXYZ'].find((letter) => !taken.has(letter)) ?? 'A';
      return editSpecies(state, { grammar: { ...state.species.grammar, rules: [...rules, { symbol, successor: 'F' }] } });
    }),
  removeRule: (index) =>
    set((state) => {
      const rules = state.species.grammar.rules.filter((_, position) => position !== index);
      return editSpecies(state, { grammar: { ...state.species.grammar, rules } });
    }),
  reseed: () =>
    set((state) => ({
      species: { ...state.species, seed: Math.floor(Math.random() * 0xffffffff) },
      growthCycle: state.growthCycle + 1,
    })),
  setWind: (patch) => set((state) => ({ wind: { ...state.wind, ...patch } })),
  setShading: (patch) => set((state) => ({ shading: { ...state.shading, ...patch } })),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  reportStats: (stats) => set({ stats }),
  requestExport: () => set((state) => ({ exportRequest: state.exportRequest + 1 })),
  setExportStatus: (exportStatus) => set({ exportStatus }),

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
      const species = speciesSchema.parse(payload.species);
      set((state) => ({
        species,
        presetId: null,
        growthCycle: state.growthCycle + 1,
        generation: { status: 'done', source: payload.source ?? 'procedural', message: payload.notice ?? null },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The grammar could not be generated';
      set({ generation: { status: 'error', source: null, message } });
    }
  },
}));
