import { clampParameter } from '@/engine/grammarOps';
import { fitIterations } from '@/engine/speciesNormalizer';
import { useBotanyStore } from '@/store/useBotanyStore';

export interface Refinement {
  id: string;
  label: string;
  apply: () => void;
}

const store = () => useBotanyStore.getState();

function stepIterations(step: number): void {
  const { species, setGrammar } = store();
  const wanted = clampParameter('iterations', species.grammar.iterations + step);
  setGrammar({ iterations: fitIterations({ ...species.grammar, iterations: wanted }, species.seed).iterations });
}

export const REFINEMENTS: readonly Refinement[] = [
  { id: 'weeping', label: 'More weeping', apply: () => store().setGrammar({ tropismGravity: clampParameter('tropismGravity', store().species.grammar.tropismGravity + 0.2) }) },
  { id: 'upright', label: 'More upright', apply: () => store().setGrammar({ tropismGravity: clampParameter('tropismGravity', store().species.grammar.tropismGravity - 0.2) }) },
  { id: 'denser', label: 'Denser', apply: () => stepIterations(1) },
  { id: 'sparser', label: 'Sparser', apply: () => stepIterations(-1) },
  { id: 'taller', label: 'Taller', apply: () => store().setGrammar({ stepLength: clampParameter('stepLength', store().species.grammar.stepLength * 1.15) }) },
  { id: 'compact', label: 'More compact', apply: () => store().setGrammar({ stepLength: clampParameter('stepLength', store().species.grammar.stepLength * 0.87) }) },
  { id: 'wilder', label: 'Wilder', apply: () => store().setForm({ angleJitter: clampParameter('angleJitter', store().species.form.angleJitter + 0.1) }) },
  { id: 'leafier', label: 'Larger leaves', apply: () => store().setForm({ leafSize: clampParameter('leafSize', store().species.form.leafSize * 1.2) }) },
  { id: 'glow', label: 'Luminous', apply: () => store().setPalette({ glow: clampParameter('glow', store().species.palette.glow + 0.35) }) },
];
