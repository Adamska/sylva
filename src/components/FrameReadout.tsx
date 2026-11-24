'use client';

import { frameProbeTargets } from '@/scene/frameProbe';
import { useBotanyStore } from '@/store/useBotanyStore';

const integer = new Intl.NumberFormat('en-US');

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-lichen">{label}</dt>
      <dd className="font-mono text-[11px] tabular-nums text-bone">{children}</dd>
    </div>
  );
}

export function FrameReadout() {
  const stats = useBotanyStore((state) => state.stats);

  return (
    <dl className="pointer-events-none hidden w-44 flex-col gap-1 md:flex">
      <Metric label="Frame rate">
        <span ref={(node) => void (frameProbeTargets.fps = node)}>—</span> fps
      </Metric>
      <Metric label="Frame time">
        <span ref={(node) => void (frameProbeTargets.frameTime = node)}>—</span> ms
      </Metric>
      <Metric label="Triangles">{stats ? integer.format(stats.triangles) : '—'}</Metric>
      <Metric label="Segments">{stats ? integer.format(stats.segments) : '—'}</Metric>
      <Metric label="Blades">{stats ? integer.format(stats.blades) : '—'}</Metric>
      <Metric label="Symbols">{stats ? integer.format(stats.symbols) : '—'}</Metric>
      <Metric label="Build">{stats ? `${stats.buildMs.toFixed(1)} ms` : '—'}</Metric>
      {stats?.truncated && <p className="pt-1 font-mono text-[10px] text-brass">Growth capped by safety limits</p>}
    </dl>
  );
}
