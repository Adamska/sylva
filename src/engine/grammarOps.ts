import { PARAMETER_RANGES } from '@/types/botany';
import type { Rng } from './random';

const ROTATION_MODULE = /([+\-&^\\/])\((\d+(?:\.\d+)?)\)/g;
const GOLDEN_ANGLE_DEG = 137.5;

export const vary = (rng: Rng, amount: number) => 1 + amount * (rng() * 2 - 1);

export function clampParameter(key: keyof typeof PARAMETER_RANGES, value: number): number {
  const { min, max } = PARAMETER_RANGES[key];
  return Math.round(Math.min(max, Math.max(min, value)) * 1000) / 1000;
}

export function perturbAngles(sentence: string, rng: Rng, amount: number): string {
  return sentence.replace(ROTATION_MODULE, (module, symbol: string, argument: string) => {
    const degrees = Number.parseFloat(argument);
    if (Math.abs(degrees - GOLDEN_ANGLE_DEG) < 0.01) return module;
    return `${symbol}(${(degrees * vary(rng, amount)).toFixed(1)})`;
  });
}
