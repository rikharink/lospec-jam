export const EPSILON = 1e-6;
export const DEGREE_TO_RADIAN = Math.PI / 180;
export const RADIAN_TO_DEGREE = 180 / Math.PI;
export const TAU = Math.PI * 2;
export function range(start, end) {
  return Array.from("x".repeat(end - start), (_, i) => start + i);
}
export function lerp(v0, v1, t) {
  return v0 + t * (v1 - v0);
}
export function clamp(min, max, n) {
  return Math.max(min, Math.min(max, n));
}
export function normalize(value, min, max) {
  return (value - min) / (max - min);
}
