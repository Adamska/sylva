import type { Grammar, PlantForm } from '@/types/botany';
import { createRng } from './random';

export const TURTLE_LIMITS = {
  maxSegments: 26_000,
  maxLeaves: 14_000,
  maxDepth: 48,
} as const;

export interface Skeleton {
  segmentCount: number;
  starts: Float32Array;
  ends: Float32Array;
  frames: Float32Array;
  parents: Int32Array;
  leafCount: number;
  leafOrigins: Float32Array;
  leafHeadings: Float32Array;
  leafNormals: Float32Array;
  leafScales: Float32Array;
  leafSegments: Int32Array;
  truncated: boolean;
}

const DEG_TO_RAD = Math.PI / 180;
const TROPISM_GAIN = 1.6;
const STATE_SIZE = 14;
const HEADING = 3;
const LEFT = 6;
const UP = 9;
const PARENT = 12;
const DEPTH = 13;

function rotate(state: Float64Array, a: number, b: number, angle: number): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  for (let axis = 0; axis < 3; axis++) {
    const va = state[a + axis];
    const vb = state[b + axis];
    state[a + axis] = va * cos + vb * sin;
    state[b + axis] = vb * cos - va * sin;
  }
}

function bendTowardGravity(state: Float64Array, pull: number): void {
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

function readArgument(sentence: string, index: number): { value: number | null; next: number } {
  if (sentence[index + 1] !== '(') return { value: null, next: index + 1 };
  const close = sentence.indexOf(')', index + 2);
  if (close === -1) return { value: null, next: sentence.length };
  const value = Number.parseFloat(sentence.slice(index + 2, close));
  return { value: Number.isFinite(value) ? value : null, next: close + 1 };
}

export function interpretSentence(sentence: string, grammar: Grammar, form: PlantForm, seed: number): Skeleton {
  const { maxSegments, maxLeaves, maxDepth } = TURTLE_LIMITS;
  const rng = createRng(seed ^ 0x9e3779b9);
  const starts = new Float32Array(maxSegments * 3);
  const ends = new Float32Array(maxSegments * 3);
  const frames = new Float32Array(maxSegments * 3);
  const parents = new Int32Array(maxSegments);
  const leafOrigins = new Float32Array(maxLeaves * 3);
  const leafHeadings = new Float32Array(maxLeaves * 3);
  const leafNormals = new Float32Array(maxLeaves * 3);
  const leafScales = new Float32Array(maxLeaves);
  const leafSegments = new Int32Array(maxLeaves);

  const state = new Float64Array(STATE_SIZE);
  state.set([0, 0, 0, 0, 1, 0, -1, 0, 0, 0, 0, 1, -1, 0]);
  const stack = new Float64Array(STATE_SIZE * maxDepth);
  let stackSize = 0;
  let skippedBrackets = 0;
  let segmentCount = 0;
  let leafCount = 0;
  let truncated = false;

  const defaultAngle = grammar.angleDeg;
  const jitter = form.angleJitter;
  const turn = (a: number, b: number, degrees: number | null, sign: number) => {
    const wobble = 1 + jitter * (rng() * 2 - 1);
    rotate(state, a, b, sign * (degrees ?? defaultAngle) * wobble * DEG_TO_RAD);
  };

  let index = 0;
  while (index < sentence.length) {
    const symbol = sentence[index];
    const { value, next } = readArgument(sentence, index);
    index = next;

    switch (symbol) {
      case 'F':
      case 'f': {
        const depth = state[DEPTH];
        const stretch = 1 + jitter * 0.5 * (rng() - 0.5);
        const length = grammar.stepLength * Math.min(8, Math.abs(value ?? 1)) * form.lengthDecay ** depth * stretch;
        const offset = segmentCount * 3;
        if (symbol === 'F') {
          if (segmentCount >= maxSegments) {
            truncated = true;
            index = sentence.length;
            break;
          }
          starts.set([state[0], state[1], state[2]], offset);
          frames.set([state[UP], state[UP + 1], state[UP + 2]], offset);
          parents[segmentCount] = state[PARENT];
        }
        state[0] += state[HEADING] * length;
        state[1] += state[HEADING + 1] * length;
        state[2] += state[HEADING + 2] * length;
        if (symbol === 'F') {
          ends.set([state[0], state[1], state[2]], offset);
          state[PARENT] = segmentCount++;
        }
        const suppleness = Math.min(1, 0.1 * 2.2 ** depth);
        bendTowardGravity(state, grammar.tropismGravity * length * TROPISM_GAIN * suppleness);
        break;
      }
      case '+':
        turn(HEADING, LEFT, value, 1);
        break;
      case '-':
        turn(HEADING, LEFT, value, -1);
        break;
      case '&':
        turn(HEADING, UP, value, -1);
        break;
      case '^':
        turn(HEADING, UP, value, 1);
        break;
      case '\\':
        turn(LEFT, UP, value, 1);
        break;
      case '/':
        turn(LEFT, UP, value, -1);
        break;
      case '|':
        rotate(state, HEADING, LEFT, Math.PI);
        break;
      case '[':
        if (stackSize >= maxDepth) {
          skippedBrackets++;
          truncated = true;
          break;
        }
        stack.set(state, stackSize * STATE_SIZE);
        stackSize++;
        state[DEPTH]++;
        break;
      case ']':
        if (skippedBrackets > 0) skippedBrackets--;
        else if (stackSize > 0) {
          stackSize--;
          state.set(stack.subarray(stackSize * STATE_SIZE, (stackSize + 1) * STATE_SIZE));
        }
        break;
      case 'L': {
        if (leafCount >= maxLeaves) {
          truncated = true;
          break;
        }
        const offset = leafCount * 3;
        leafOrigins.set([state[0], state[1], state[2]], offset);
        leafHeadings.set([state[HEADING], state[HEADING + 1], state[HEADING + 2]], offset);
        leafNormals.set([state[UP], state[UP + 1], state[UP + 2]], offset);
        leafScales[leafCount] = Math.min(4, Math.abs(value ?? 1));
        leafSegments[leafCount] = state[PARENT];
        leafCount++;
        break;
      }
      default:
        break;
    }
  }

  return {
    segmentCount,
    starts: starts.slice(0, segmentCount * 3),
    ends: ends.slice(0, segmentCount * 3),
    frames: frames.slice(0, segmentCount * 3),
    parents: parents.slice(0, segmentCount),
    leafCount,
    leafOrigins: leafOrigins.slice(0, leafCount * 3),
    leafHeadings: leafHeadings.slice(0, leafCount * 3),
    leafNormals: leafNormals.slice(0, leafCount * 3),
    leafScales: leafScales.slice(0, leafCount),
    leafSegments: leafSegments.slice(0, leafCount),
    truncated,
  };
}
