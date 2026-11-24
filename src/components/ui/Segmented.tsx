'use client';

interface SegmentedProps<Value extends string> {
  label: string;
  value: Value;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
}

export function Segmented<Value extends string>({ label, value, options, onChange }: SegmentedProps<Value>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] text-lichen">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex rounded-md border border-hairline p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            onClick={() => onChange(option.value)}
            className={`flex-1 rounded-[5px] px-1 py-1 text-[10px] tracking-wide transition-colors ${
              option.value === value ? 'bg-brass/15 text-brass' : 'text-lichen hover:text-bone'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
