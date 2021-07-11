import {swap} from "../util.js";
import {mergeRgb} from "./color.js";
export function seedRand(str) {
  for (var i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  h += h << 13;
  h ^= h >>> 7;
  h += h << 3;
  h ^= h >>> 17;
  let seed = (h += h << 5) >>> 0;
  let rand = () => (2 ** 31 - 1 & (seed = Math.imul(48271, seed))) / 2 ** 31;
  rand();
  return rand;
}
export function getRandom(rand, min, max) {
  return rand() * (max - min + 1) + min;
}
export function getRandomInt(rand, min, max) {
  return Math.floor(getRandom(rand, Math.ceil(min), Math.floor(max)));
}
export function getDie(rand, max) {
  return () => getRandomInt(rand, 1, max);
}
export function shuffle(rand, arr) {
  for (let i = 0; i < arr.length - 2; i++) {
    swap(arr, i, getRandomInt(rand, i, arr.length - 1));
  }
}
export function getRandomElement(rand, arr) {
  return arr[getRandomInt(rand, 0, arr.length)];
}
export function getRandomColor(rand = Math.random) {
  const r = getRandomInt(rand, 0, 255);
  const g = getRandomInt(rand, 0, 255);
  const b = getRandomInt(rand, 0, 255);
  return mergeRgb([r, g, b]);
}
