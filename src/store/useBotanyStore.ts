import { create } from 'zustand';
import { createSpeciesSlice, type SpeciesSlice } from './speciesSlice';
import { createStudioSlice, type StudioSlice } from './studioSlice';

export type BotanyState = SpeciesSlice & StudioSlice;

export const useBotanyStore = create<BotanyState>()((...args) => ({
  ...createSpeciesSlice(...args),
  ...createStudioSlice(...args),
}));

export { cleanSentence } from './speciesSlice';
