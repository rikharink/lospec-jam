export const EPSILON = 0.000001;
export const DEGREE_TO_RADIAN = Math.PI / 180;
export const RADIAN_TO_DEGREE = 180 / Math.PI;
export const TAU = Math.PI * 2;

export type Radian = number;
export type Degree = number;

export function range(start: number, end: number) {
  return Array.from("x".repeat(end - start), (_, i) => start + i);
}

export function lerp(v0: number, v1: number, t: number) {
  return v0 + t * (v1 - v0);
}

export function clamp(min: number, max: number, n: number) {
  return Math.max(min, Math.min(max, n));
}

export function normalize(value: number, min: number, max: number): number {
  return (value - min) / (max - min);
}
