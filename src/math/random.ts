import { swap } from '../util';
import type { Random } from '../types';
import { mergeRgb } from './color';

//FROM: https://github.com/straker/kontra/blob/main/src/helpers.js
/*
The MIT License (MIT)
Copyright (c) 2015 Steven Lambert

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
export function seedRand(str: string) {
  // first create a suitable hash of the seed string using xfnv1a
  // @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
  for (var i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  h += h << 13;
  h ^= h >>> 7;
  h += h << 3;
  h ^= h >>> 17;
  let seed = (h += h << 5) >>> 0;

  // then return the seed function and discard the first result
  // @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#lcg-lehmer-rng
  let rand = () => ((2 ** 31 - 1) & (seed = Math.imul(48271, seed))) / 2 ** 31;
  rand();
  return rand;
}

export function getRandom(rand: Random, min: number, max: number): number {
  return rand() * (max - min + 1) + min;
}

export function getRandomInt(rand: Random, min: number, max: number): number {
  return Math.floor(getRandom(rand, Math.ceil(min), Math.floor(max)));
}

export function getDie(rand: Random, max: number): Random {
  return () => getRandomInt(rand, 1, max);
}

export function shuffle<T>(rand: Random, arr: Array<T>): void {
  for (let i = 0; i < arr.length - 2; i++) {
    swap(arr, i, getRandomInt(rand, i, arr.length - 1));
  }
}

export function getRandomElement<T>(rand: Random, arr: Array<T>): T {
  return arr[getRandomInt(rand, 0, arr.length)];
}

export function getRandomColor(rand: Random = Math.random): number {
  const r = getRandomInt(rand, 0, 255);
  const g = getRandomInt(rand, 0, 255);
  const b = getRandomInt(rand, 0, 255);
  return mergeRgb([r, g, b]);
}
