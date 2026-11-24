import type { StateCreator } from 'zustand';
import type { SpecimenStats } from '@/engine/meshBuilder';
import type { BotanyState } from './useBotanyStore';

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
  haze: number;
  depthOfField: number;
}

export interface LifeSettings {
  age: number;
  season: number;
}

export interface Activity {
  label: string;
  progress: number | null;
}

export interface StudioSlice {
  wind: WindSettings;
  shading: ShadingSettings;
  life: LifeSettings;
  autoRotate: boolean;
  grove: boolean;
  presenting: boolean;
  highlightRule: number | null;
  stats: SpecimenStats | null;
  activity: Activity | null;
  toast: string | null;
  setWind: (patch: Partial<WindSettings>) => void;
  setShading: (patch: Partial<ShadingSettings>) => void;
  setLife: (patch: Partial<LifeSettings>) => void;
  toggleAutoRotate: () => void;
  toggleGrove: () => void;
  setPresenting: (presenting: boolean) => void;
  setHighlightRule: (rule: number | null) => void;
  reportStats: (stats: SpecimenStats) => void;
  setActivity: (activity: Activity | null) => void;
  announce: (message: string) => void;
}

const TOAST_MS = 2600;
let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const createStudioSlice: StateCreator<BotanyState, [], [], StudioSlice> = (set) => ({
  wind: { strength: 0.55, speed: 1, turbulence: 1, headingDeg: 35 },
  shading: { translucency: 1, barkRelief: 1, flutter: 1, bloom: 0.6, haze: 0.6, depthOfField: 0 },
  life: { age: 1, season: 0.3 },
  autoRotate: true,
  grove: false,
  presenting: false,
  highlightRule: null,
  stats: null,
  activity: null,
  toast: null,

  setWind: (patch) => set((state) => ({ wind: { ...state.wind, ...patch } })),
  setShading: (patch) => set((state) => ({ shading: { ...state.shading, ...patch } })),
  setLife: (patch) => set((state) => ({ life: { ...state.life, ...patch } })),
  toggleAutoRotate: () => set((state) => ({ autoRotate: !state.autoRotate })),
  toggleGrove: () => set((state) => ({ grove: !state.grove })),
  setPresenting: (presenting) => set({ presenting }),
  setHighlightRule: (highlightRule) => set({ highlightRule }),
  reportStats: (stats) => set({ stats }),
  setActivity: (activity) => set({ activity }),
  announce: (message) => {
    clearTimeout(toastTimer);
    set({ toast: message });
    toastTimer = setTimeout(() => set({ toast: null }), TOAST_MS);
  },
});
