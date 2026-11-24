'use client';

import { useBotanyStore } from '@/store/useBotanyStore';

export function StatusToast() {
  const toast = useBotanyStore((state) => state.toast);
  const activity = useBotanyStore((state) => state.activity);
  const message = activity ? activity.label : toast;
  if (!message) return null;

  return (
    <div
      role="status"
      className="pointer-events-none absolute left-1/2 top-5 z-30 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-hairline bg-[#0b0c0f]/75 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-bone backdrop-blur-md"
    >
      {activity && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass" />}
      {message}
      {activity?.progress != null && <span className="tabular-nums text-brass">{Math.round(activity.progress * 100)}%</span>}
    </div>
  );
}
