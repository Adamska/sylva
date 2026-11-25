import type { Species } from '@/types/botany';
import { createThumbnail } from './thumbnails';

type Listener = (thumbnail: string) => void;

interface Job {
  grow: () => Species;
  listeners: Set<Listener>;
}

const finished = new Map<string, string>();
const waiting = new Map<string, Job>();
let busy = false;

async function drain(): Promise<void> {
  if (busy) return;
  busy = true;
  for (let next = waiting.entries().next(); !next.done; next = waiting.entries().next()) {
    const [id, job] = next.value;
    try {
      const thumbnail = await createThumbnail(job.grow());
      finished.set(id, thumbnail);
      job.listeners.forEach((listener) => listener(thumbnail));
    } catch (error) {
      console.error(error);
    }
    waiting.delete(id);
  }
  busy = false;
}

export const cachedThumbnail = (id: string) => finished.get(id);

export function requestThumbnail(id: string, grow: () => Species, listener: Listener): () => void {
  const done = finished.get(id);
  if (done) {
    listener(done);
    return () => undefined;
  }
  const job = waiting.get(id) ?? { grow, listeners: new Set<Listener>() };
  job.listeners.add(listener);
  waiting.set(id, job);
  void drain();
  return () => {
    job.listeners.delete(listener);
    if (job.listeners.size === 0 && waiting.entries().next().value?.[0] !== id) waiting.delete(id);
  };
}
