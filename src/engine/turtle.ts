import type { Grammar, PlantForm } from '@/types/botany';
import type { Expansion } from './lsystem';
import { createRng } from './random';
import { bendTowardGravity, createTurtleState, DEPTH, HEADING, LEFT, PARENT, readArgument, rotate, STATE_SIZE, UP } from './turtleFrame';

export const TURTLE_LIMITS = {
  maxSegments: 26_000,
  maxLeaves: 14_000,
  maxDepth: 48,
} as const;

export const LEAF_NODE = 0;
export const ORGAN_NODE = 1;

export interface Skeleton {
  segmentCount: number;
  starts: Float32Array;
  ends: Float32Array;
  frames: Float32Array;
  parents: Int32Array;
  segmentRules: Uint8Array;
  leafCount: number;
  leafOrigins: Float32Array;
  leafHeadings: Float32Array;
  leafNormals: Float32Array;
  leafScales: Float32Array;
  leafSegments: Int32Array;
  leafRules: Uint8Array;
  leafKinds: Uint8Array;
  truncated: boolean;
}

const DEG_TO_RAD = Math.PI / 180;
const TROPISM_GAIN = 1.6;

export function interpretSentence(expansion: Expansion, grammar: Grammar, form: PlantForm, seed: number): Skeleton {
  const { sentence, origins } = expansion;
  const { maxSegments, maxLeaves, maxDepth } = TURTLE_LIMITS;
  const rng = createRng(seed ^ 0x9e3779b9);
  const starts = new Float32Array(maxSegments * 3);
  const ends = new Float32Array(maxSegments * 3);
  const frames = new Float32Array(maxSegments * 3);
  const parents = new Int32Array(maxSegments);
  const segmentRules = new Uint8Array(maxSegments);
  const leafOrigins = new Float32Array(maxLeaves * 3);
  const leafHeadings = new Float32Array(maxLeaves * 3);
  const leafNormals = new Float32Array(maxLeaves * 3);
  const leafScales = new Float32Array(maxLeaves);
  const leafSegments = new Int32Array(maxLeaves);
  const leafRules = new Uint8Array(maxLeaves);
  const leafKinds = new Uint8Array(maxLeaves);

  const state = createTurtleState();
  const stack = new Float64Array(STATE_SIZE * maxDepth);
  let stackSize = 0;
  let skippedBrackets = 0;
  let segmentCount = 0;
  let leafCount = 0;
  let truncated = false;

  const jitter = form.angleJitter;
  const turn = (a: number, b: number, degrees: number | null, sign: number) => {
    const wobble = 1 + jitter * (rng() * 2 - 1);
    rotate(state, a, b, sign * (degrees ?? grammar.angleDeg) * wobble * DEG_TO_RAD);
  };
  const attach = (kind: number, scale: number | null, rule: number) => {
    if (leafCount >= maxLeaves) {
      truncated = true;
      return;
    }
    const offset = leafCount * 3;
    leafOrigins.set([state[0], state[1], state[2]], offset);
    leafHeadings.set([state[HEADING], state[HEADING + 1], state[HEADING + 2]], offset);
    leafNormals.set([state[UP], state[UP + 1], state[UP + 2]], offset);
    leafScales[leafCount] = Math.min(4, Math.abs(scale ?? 1));
    leafSegments[leafCount] = state[PARENT];
    leafRules[leafCount] = rule;
    leafKinds[leafCount] = kind;
    leafCount++;
  };

  let index = 0;
  while (index < sentence.length) {
    const symbol = sentence[index];
    const rule = origins[index];
    const { value, next } = readArgument(sentence, index);
    index = next;

    switch (symbol) {
      case 'F':
      case 'f': {
        const depth = state[DEPTH];
        const stretch = 1 + jitter * 0.5 * (rng() - 0.5);
        const length = grammar.stepLength * Math.min(8, Math.abs(value ?? 1)) * form.lengthDecay ** depth * stretch;
        const offset = segmentCount * 3;
        const draws = symbol === 'F';
        if (draws && segmentCount >= maxSegments) {
          truncated = true;
          index = sentence.length;
          break;
        }
        if (draws) {
          starts.set([state[0], state[1], state[2]], offset);
          frames.set([state[UP], state[UP + 1], state[UP + 2]], offset);
          parents[segmentCount] = state[PARENT];
          segmentRules[segmentCount] = rule;
        }
        state[0] += state[HEADING] * length;
        state[1] += state[HEADING + 1] * length;
        state[2] += state[HEADING + 2] * length;
        if (draws) {
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
      case 'L':
        attach(LEAF_NODE, value, rule);
        break;
      case 'K':
        attach(ORGAN_NODE, value, rule);
        break;
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
    segmentRules: segmentRules.slice(0, segmentCount),
    leafCount,
    leafOrigins: leafOrigins.slice(0, leafCount * 3),
    leafHeadings: leafHeadings.slice(0, leafCount * 3),
    leafNormals: leafNormals.slice(0, leafCount * 3),
    leafScales: leafScales.slice(0, leafCount),
    leafSegments: leafSegments.slice(0, leafCount),
    leafRules: leafRules.slice(0, leafCount),
    leafKinds: leafKinds.slice(0, leafCount),
    truncated,
  };
}
