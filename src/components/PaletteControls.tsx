'use client';

import { useBotanyStore } from '@/store/useBotanyStore';
import type { Palette } from '@/types/botany';

type ColorKey = Exclude<keyof Palette, 'glow'>;

const SWATCHES: readonly { key: ColorKey; label: string }[] = [
  { key: 'barkDark', label: 'Bark' },
  { key: 'barkLight', label: 'Grain' },
  { key: 'leafDeep', label: 'Leaf' },
  { key: 'leafBright', label: 'Tip' },
  { key: 'subsurface', label: 'Glow' },
  { key: 'organ', label: 'Bloom' },
  { key: 'organCore', label: 'Heart' },
];

export function PaletteControls() {
  const palette = useBotanyStore((state) => state.species.palette);
  const setPalette = useBotanyStore((state) => state.setPalette);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {SWATCHES.map(({ key, label }) => (
        <label key={key} className="group flex cursor-pointer flex-col items-center gap-1.5">
          <span
            className="relative h-8 w-full overflow-hidden rounded-md border border-hairline transition-colors group-hover:border-white/40 group-focus-within:border-brass"
            style={{ backgroundColor: palette[key] }}
          >
            <input
              type="color"
              value={palette[key]}
              aria-label={`${label} colour`}
              onChange={(event) => setPalette({ [key]: event.target.value })}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
          </span>
          <span className="text-[9px] uppercase tracking-[0.12em] text-lichen">{label}</span>
        </label>
      ))}
    </div>
  );
}
