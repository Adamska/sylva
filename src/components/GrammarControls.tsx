'use client';

import { useBotanyStore } from '@/store/useBotanyStore';
import { copyShareLink } from '@/studio/actions';
import { LEAF_SHAPES, ORGAN_SHAPES, PARAMETER_RANGES, type LeafShape, type OrganShape } from '@/types/botany';
import { AtmosphereControls } from './AtmosphereControls';
import { ExportMenu } from './ExportMenu';
import { HerbariumShelf } from './HerbariumShelf';
import { RuleEditor } from './RuleEditor';
import { RangeField } from './ui/RangeField';
import { Section } from './ui/Section';
import { Segmented } from './ui/Segmented';

const LEAF_LABELS: Record<LeafShape, string> = { lanceolate: 'Lance', needle: 'Needle', sword: 'Sword', ovate: 'Ovate', polyp: 'Polyp' };
const ORGAN_LABELS: Record<OrganShape, string> = { blossom: 'Blossom', berry: 'Berry' };
const leafOptions = LEAF_SHAPES.map((shape) => ({ value: shape, label: LEAF_LABELS[shape] }));
const organOptions = ORGAN_SHAPES.map((shape) => ({ value: shape, label: ORGAN_LABELS[shape] }));

const quietAction = 'text-[10px] uppercase tracking-[0.14em] text-bone/75 transition-colors hover:text-brass disabled:text-bone/25';
const footerAction =
  'rounded-md border border-hairline px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-bone/85 transition-colors hover:border-brass/50 hover:text-brass';

export function GrammarControls({ onEvolve }: { onEvolve: () => void }) {
  const grammar = useBotanyStore((state) => state.species.grammar);
  const form = useBotanyStore((state) => state.species.form);
  const canUndo = useBotanyStore((state) => state.past.length > 0);
  const canRedo = useBotanyStore((state) => state.future.length > 0);
  const setGrammar = useBotanyStore((state) => state.setGrammar);
  const setForm = useBotanyStore((state) => state.setForm);
  const reseed = useBotanyStore((state) => state.reseed);
  const undo = useBotanyStore((state) => state.undo);
  const redo = useBotanyStore((state) => state.redo);

  return (
    <aside className="pointer-events-auto flex max-h-full w-full flex-col overflow-hidden rounded-2xl border border-hairline bg-[#0b0c0f]/55 shadow-[0_32px_90px_-36px_rgba(0,0,0,0.95)] backdrop-blur-md lg:w-[19.5rem]">
      <header className="flex flex-col gap-3 px-4 pb-3 pt-3.5">
        <div className="flex items-center gap-3">
          <h2 className="mr-auto text-[10px] font-medium uppercase tracking-[0.18em] text-bone/80">Herbarium</h2>
          <button type="button" onClick={undo} disabled={!canUndo} className={quietAction}>
            Undo
          </button>
          <button type="button" onClick={redo} disabled={!canRedo} className={quietAction}>
            Redo
          </button>
          <button type="button" onClick={() => void copyShareLink()} className={quietAction}>
            Link
          </button>
        </div>
        <HerbariumShelf />
      </header>

      <div className="sylva-scroll min-h-0 flex-1 overflow-y-auto">
        <Section title="Grammar">
          <RuleEditor />
          <RangeField label="Iterations" value={grammar.iterations} range={PARAMETER_RANGES.iterations} onChange={(iterations) => setGrammar({ iterations })} />
          <RangeField label="Branch angle" value={grammar.angleDeg} range={PARAMETER_RANGES.angleDeg} unit="°" onChange={(angleDeg) => setGrammar({ angleDeg })} />
          <RangeField label="Step length" value={grammar.stepLength} range={PARAMETER_RANGES.stepLength} onChange={(stepLength) => setGrammar({ stepLength })} />
          <RangeField label="Radius ratio" value={grammar.radiusScale} range={PARAMETER_RANGES.radiusScale} onChange={(radiusScale) => setGrammar({ radiusScale })} />
          <RangeField
            label="Gravity tropism"
            value={grammar.tropismGravity}
            range={PARAMETER_RANGES.tropismGravity}
            onChange={(tropismGravity) => setGrammar({ tropismGravity })}
          />
        </Section>

        <Section title="Form" defaultOpen={false}>
          <RangeField label="Trunk radius" value={form.trunkRadius} range={PARAMETER_RANGES.trunkRadius} onChange={(trunkRadius) => setForm({ trunkRadius })} />
          <RangeField label="Length decay" value={form.lengthDecay} range={PARAMETER_RANGES.lengthDecay} onChange={(lengthDecay) => setForm({ lengthDecay })} />
          <RangeField label="Angular jitter" value={form.angleJitter} range={PARAMETER_RANGES.angleJitter} onChange={(angleJitter) => setForm({ angleJitter })} />
          <Segmented label="Leaf shape" value={form.leafShape} options={leafOptions} onChange={(leafShape) => setForm({ leafShape })} />
          <RangeField label="Leaf size" value={form.leafSize} range={PARAMETER_RANGES.leafSize} onChange={(leafSize) => setForm({ leafSize })} />
          <Segmented label="Flower or fruit (K)" value={form.organShape} options={organOptions} onChange={(organShape) => setForm({ organShape })} />
          <RangeField label="Flower or fruit size" value={form.organSize} range={PARAMETER_RANGES.organSize} onChange={(organSize) => setForm({ organSize })} />
        </Section>

        <AtmosphereControls />
      </div>

      <footer className="flex items-center gap-1.5 border-t border-hairline px-4 py-3">
        <button type="button" onClick={reseed} className={footerAction}>
          Reseed
        </button>
        <button type="button" onClick={onEvolve} className={footerAction}>
          Evolve
        </button>
        <ExportMenu />
      </footer>
    </aside>
  );
}
