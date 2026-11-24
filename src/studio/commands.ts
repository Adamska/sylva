import { MOODS } from '@/scene/moods';
import { useBotanyStore } from '@/store/useBotanyStore';
import { LIGHTING_MOODS } from '@/types/botany';
import { SPECIES_PRESETS } from '@/types/presets';
import { copyShareLink, EXPORT_ACTIONS, saveToHerbarium } from './actions';
import { REFINEMENTS } from './refinements';

export interface Command {
  id: string;
  group: string;
  title: string;
  shortcut?: string;
  run: () => void;
}

const store = () => useBotanyStore.getState();
const SEASONS = [
  ['Spring', 0.12],
  ['Summer', 0.38],
  ['Autumn', 0.7],
  ['Winter', 0.98],
] as const;

export const COMMANDS: readonly Command[] = [
  ...SPECIES_PRESETS.map((preset, index) => ({
    id: `preset-${preset.id}`,
    group: 'Herbarium',
    title: preset.species.name,
    shortcut: String(index + 1),
    run: () => store().selectPreset(preset.id),
  })),
  { id: 'evolve', group: 'Grow', title: 'Evolve variants', shortcut: 'V', run: () => store().setEvolving(!store().evolving) },
  { id: 'reseed', group: 'Grow', title: 'Reseed', shortcut: 'R', run: () => store().reseed() },
  { id: 'undo', group: 'Grow', title: 'Undo', shortcut: 'Mod+Z', run: () => store().undo() },
  { id: 'redo', group: 'Grow', title: 'Redo', shortcut: 'Shift+Mod+Z', run: () => store().redo() },
  { id: 'save', group: 'Grow', title: 'Save to herbarium', shortcut: 'S', run: () => void saveToHerbarium() },
  { id: 'link', group: 'Grow', title: 'Copy share link', shortcut: 'L', run: () => void copyShareLink() },
  ...REFINEMENTS.map((refinement) => ({ id: `refine-${refinement.id}`, group: 'Refine', title: refinement.label, run: refinement.apply })),
  { id: 'orbit', group: 'Stage', title: 'Toggle orbit', shortcut: 'O', run: () => store().toggleAutoRotate() },
  { id: 'grove', group: 'Stage', title: 'Toggle grove', shortcut: 'G', run: () => store().toggleGrove() },
  { id: 'present', group: 'Stage', title: 'Presentation mode', shortcut: 'P', run: () => store().setPresenting(!store().presenting) },
  ...LIGHTING_MOODS.map((mood) => ({ id: `mood-${mood}`, group: 'Mood', title: `${MOODS[mood].label} light`, run: () => store().setMood(mood) })),
  ...SEASONS.map(([title, season]) => ({ id: `season-${title}`, group: 'Season', title, run: () => store().setLife({ season }) })),
  ...EXPORT_ACTIONS.map((action, index) => ({
    id: `export-${action.id}`,
    group: 'Export',
    title: action.label,
    shortcut: index === 0 ? 'E' : undefined,
    run: () => void action.run(),
  })),
];

const SINGLE_KEYS = new Map(COMMANDS.filter((command) => command.shortcut?.length === 1).map((command) => [command.shortcut?.toLowerCase(), command]));

export function commandForKey(key: string): Command | undefined {
  return SINGLE_KEYS.get(key.toLowerCase());
}
