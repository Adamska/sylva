'use client';

import type { CSSProperties } from 'react';
import type { NumericRange } from '@/types/botany';

interface RangeFieldProps {
  label: string;
  value: number;
  range: NumericRange;
  onChange: (value: number) => void;
  unit?: string;
}

function decimalsFor(step: number): number {
  const fraction = step.toString().split('.')[1];
  return fraction ? fraction.length : 0;
}

export function RangeField({ label, value, range, onChange, unit = '' }: RangeFieldProps) {
  const fill = ((value - range.min) / (range.max - range.min)) * 100;

  return (
    <label className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 gap-y-1">
      <span className="text-[11px] text-lichen">{label}</span>
      <output className="font-mono text-[11px] tabular-nums text-bone">
        {value.toFixed(decimalsFor(range.step))}
        {unit}
      </output>
      <input
        type="range"
        className="sylva-range col-span-2"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        style={{ '--fill': `${Math.min(100, Math.max(0, fill))}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
