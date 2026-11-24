import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Species } from '@/types/botany';

export interface SavedSpecimen {
  id: string;
  species: Species;
  thumbnail: string;
  savedAt: number;
}

interface HerbariumState {
  saved: SavedSpecimen[];
  presetThumbnails: Record<string, string>;
  prompts: string[];
  save: (species: Species, thumbnail: string) => void;
  remove: (id: string) => void;
  setPresetThumbnail: (id: string, thumbnail: string) => void;
  rememberPrompt: (prompt: string) => void;
}

const SAVED_LIMIT = 24;
const PROMPT_LIMIT = 8;

export const useHerbariumStore = create<HerbariumState>()(
  persist(
    (set) => ({
      saved: [],
      presetThumbnails: {},
      prompts: [],
      save: (species, thumbnail) =>
        set((state) => ({
          saved: [{ id: `${Date.now().toString(36)}-${species.seed.toString(36)}`, species, thumbnail, savedAt: Date.now() }, ...state.saved].slice(0, SAVED_LIMIT),
        })),
      remove: (id) => set((state) => ({ saved: state.saved.filter((specimen) => specimen.id !== id) })),
      setPresetThumbnail: (id, thumbnail) => set((state) => ({ presetThumbnails: { ...state.presetThumbnails, [id]: thumbnail } })),
      rememberPrompt: (prompt) => set((state) => ({ prompts: [prompt, ...state.prompts.filter((entry) => entry !== prompt)].slice(0, PROMPT_LIMIT) })),
    }),
    {
      name: 'sylva-herbarium',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ saved: state.saved, prompts: state.prompts }),
      skipHydration: true,
    },
  ),
);
