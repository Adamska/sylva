'use client';

interface ToggleProps {
  label: string;
  pressed: boolean;
  onToggle: () => void;
  hint?: string;
}

export function Toggle({ label, pressed, onToggle, hint }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      title={hint}
      onClick={onToggle}
      className={`flex-1 rounded-md border px-2 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-colors ${
        pressed ? 'border-brass/50 bg-brass/10 text-brass' : 'border-hairline text-bone/80 hover:border-white/25'
      }`}
    >
      {label}
    </button>
  );
}
