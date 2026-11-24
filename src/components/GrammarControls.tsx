'use client';

import { useBotanyStore } from '@/store/useBotanyStore';
import { LEAF_SHAPES, PARAMETER_RANGES, SPECIES_PRESETS, type LeafShape } from '@/types/botany';
import { AtmosphereControls } from './AtmosphereControls';
import { RuleEditor } from './RuleEditor';
import { RangeField } from './ui/RangeField';
import { Section } from './ui/Section';
import { Segmented } from './ui/Segmented';

const LEAF_LABELS: Record<LeafShape, string> = { lanceolate: 'Lance', needle: 'Needle', sword: 'Sword', ovate: 'Ovate', polyp: 'Polyp' };
const leafOptions = LEAF_SHAPES.map((shape) => ({ value: shape, label: LEAF_LABELS[shape] }));

const actionClass =
  'rounded-md border border-hairline px-2.5 py-1.5 text-[10px] uppercase tracking-[0.14em] text-bone/85 transition-colors hover:border-brass/50 hover:text-brass';

const EXPORT_LABELS = { idle: 'Export .glb', working: 'Exporting', done: 'Exported', error: 'Export failed' } as const;

export function GrammarControls() {
  const grammar = useBotanyStore((state) => state.species.grammar);
  const form = useBotanyStore((state) => state.species.form);
  const presetId = useBotanyStore((state) => state.presetId);
  const autoRotate = useBotanyStore((state) => state.autoRotate);
  const exportStatus = useBotanyStore((state) => state.exportStatus);
  const selectPreset = useBotanyStore((state) => state.selectPreset);
  const setGrammar = useBotanyStore((state) => state.setGrammar);
  const setForm = useBotanyStore((state) => state.setForm);
  const reseed = useBotanyStore((state) => state.reseed);
  const toggleAutoRotate = useBotanyStore((state) => state.toggleAutoRotate);
  const requestExport = useBotanyStore((state) => state.requestExport);

  return (
    <aside className="pointer-events-auto flex max-h-full w-[19.5rem] flex-col overflow-hidden rounded-2xl border border-hairline bg-[#0b0c0f]/55 shadow-[0_32px_90px_-36px_rgba(0,0,0,0.95)] backdrop-blur-md">
      <header className="flex flex-col gap-2.5 px-4 pb-3.5 pt-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[10px] font-medium uppercase tracking-[0.18em] text-bone/80">Herbarium</h2>
          <span className="font-mono text-[10px] tabular-nums text-lichen">{SPECIES_PRESETS.length} species</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {SPECIES_PRESETS.map((preset, index) => (
            <button
              key={preset.id}
              type="button"
              aria-pressed={preset.id === presetId}
              onClick={() => selectPreset(preset.id)}
              className={`flex flex-col gap-0.5 rounded-lg border px-2.5 py-2 text-left transition-colors ${
                preset.id === presetId ? 'border-brass/60 bg-brass/10' : 'border-hairline hover:border-white/25'
              }`}
            >
              <span className="font-mono text-[9px] tabular-nums text-lichen">No. {String(index + 1).padStart(2, '0')}</span>
              <span className="truncate text-[11px] leading-tight text-bone">{preset.species.name}</span>
            </button>
          ))}
        </div>
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
          <RangeField label="Leaf size" value={form.leafSize} range={PARAMETER_RANGES.leafSize} onChange={(leafSize) => setForm({ leafSize })} />
          <Segmented label="Leaf shape" value={form.leafShape} options={leafOptions} onChange={(leafShape) => setForm({ leafShape })} />
        </Section>

        <AtmosphereControls />
      </div>

      <footer className="flex items-center gap-1.5 border-t border-hairline px-4 py-3">
        <button type="button" onClick={reseed} className={actionClass}>
          Reseed
        </button>
        <button type="button" onClick={toggleAutoRotate} aria-pressed={autoRotate} className={`${actionClass} ${autoRotate ? 'border-brass/40 text-brass' : ''}`}>
          Orbit
        </button>
        <button
          type="button"
          onClick={requestExport}
          disabled={exportStatus === 'working'}
          className="ml-auto rounded-md bg-brass px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-obsidian transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {EXPORT_LABELS[exportStatus]}
        </button>
      </footer>
    </aside>
  );
}
