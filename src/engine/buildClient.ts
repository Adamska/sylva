import { buildSpecimen, type GrowthInputs, type SpecimenData } from './meshBuilder';
import type { BuildRequest, BuildResponse } from './specimen.worker';

type Settle = (data: SpecimenData) => void;

const pending = new Map<number, { inputs: GrowthInputs; settle: Settle }>();
let worker: Worker | null = null;
let workerUnavailable = false;
let nextId = 1;

function retire(): void {
  workerUnavailable = true;
  worker?.terminate();
  worker = null;
  for (const { inputs, settle } of pending.values()) settle(buildSpecimen(inputs));
  pending.clear();
}

function acquireWorker(): Worker | null {
  if (worker || workerUnavailable) return worker;
  if (typeof Worker === 'undefined') {
    workerUnavailable = true;
    return null;
  }
  try {
    worker = new Worker(new URL('./specimen.worker.ts', import.meta.url), { type: 'module' });
    worker.addEventListener('message', (event: MessageEvent<BuildResponse>) => {
      pending.get(event.data.id)?.settle(event.data.data);
      pending.delete(event.data.id);
    });
    worker.addEventListener('error', retire);
  } catch {
    workerUnavailable = true;
  }
  return worker;
}

export function requestBuild(inputs: GrowthInputs): Promise<SpecimenData> {
  return new Promise((settle) => {
    const active = acquireWorker();
    if (!active) {
      settle(buildSpecimen(inputs));
      return;
    }
    const request: BuildRequest = { id: nextId++, inputs };
    pending.set(request.id, { inputs, settle });
    active.postMessage(request);
  });
}
