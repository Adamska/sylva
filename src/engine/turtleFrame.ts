export const STATE_SIZE = 14;
export const HEADING = 3;
export const LEFT = 6;
export const UP = 9;
export const PARENT = 12;
export const DEPTH = 13;

export function createTurtleState(): Float64Array {
  const state = new Float64Array(STATE_SIZE);
  state.set([0, 0, 0, 0, 1, 0, -1, 0, 0, 0, 0, 1, -1, 0]);
  return state;
}

export function rotate(state: Float64Array, a: number, b: number, angle: number): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let axis = 0; axis < 3; axis++) {
    const va = state[a + axis];
    const vb = state[b + axis];
    state[a + axis] = va * cos + vb * sin;
    state[b + axis] = vb * cos - va * sin;
  }
}

export function bendTowardGravity(state: Float64Array, pull: number): void {
  if (pull === 0) return;
  state[HEADING + 1] -= pull;
  let hx = state[HEADING];
  let hy = state[HEADING + 1];
  let hz = state[HEADING + 2];
  const headingLength = Math.hypot(hx, hy, hz) || 1;
  hx /= headingLength;
  hy /= headingLength;
  hz /= headingLength;
  const along = state[LEFT] * hx + state[LEFT + 1] * hy + state[LEFT + 2] * hz;
  let lx = state[LEFT] - hx * along;
  let ly = state[LEFT + 1] - hy * along;
  let lz = state[LEFT + 2] - hz * along;
  const leftLength = Math.hypot(lx, ly, lz);
  if (leftLength < 1e-5) return;
  lx /= leftLength;
  ly /= leftLength;
  lz /= leftLength;
  state.set([hx, hy, hz, lx, ly, lz, hy * lz - hz * ly, hz * lx - hx * lz, hx * ly - hy * lx], HEADING);
}

export function readArgument(sentence: string, index: number): { value: number | null; next: number } {
  if (sentence[index + 1] !== '(') return { value: null, next: index + 1 };
  const close = sentence.indexOf(')', index + 2);
  if (close === -1) return { value: null, next: sentence.length };
  const value = Number.parseFloat(sentence.slice(index + 2, close));
  return { value: Number.isFinite(value) ? value : null, next: close + 1 };
}
