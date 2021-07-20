import type { DisplayObject } from 'pixi.js';
import { Graphics } from 'pixi.js';
import type { UUIDV4, Random, Size, Position } from '../types';

export function swap<T>(arr: T[], i: number, j: number): void {
  [arr[j], arr[i]] = [arr[i], arr[j]];
}

export function uuidv4(random: Random = Math.random): UUIDV4 {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getSize(item: DisplayObject): Size {
  let { width, height } = item.getBounds();
  return [width, height];
}

export function middle(parent: number, child: number): number {
  return (parent - child) / 2;
}

export function calculateCenter(parentSize: Size, childSize: Size): Position {
  return [
    middle(parentSize[0], childSize[0]),
    middle(parentSize[1], childSize[1]),
  ];
}

export function getMask(
  x: number,
  y: number,
  width: number,
  height: number,
): Graphics {
  const mask = new Graphics();
  mask.beginFill(0xff3300);
  mask.drawRect(x, y, width, height);
  mask.endFill();
  return mask;
}
