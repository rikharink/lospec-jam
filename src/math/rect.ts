import type { DisplayObject } from 'pixi.js';
import type { Identifiable } from '../interfaces/identifiable';
import { uuidv4 } from '../util';

export function getRect(object: DisplayObject): Rect {
  let bound = object.getBounds();
  return new Rect(bound.x, bound.y, bound.width, bound.height);
}

export class Rect implements Identifiable {
  private _id: string = uuidv4();

  public constructor(
    protected _minX: number,
    protected _minY: number,
    protected _maxX: number,
    protected _maxY: number,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get minX(): number {
    return this._minX;
  }

  public get minY(): number {
    return this._minY;
  }

  public get maxX(): number {
    return this._maxX;
  }

  public get maxY(): number {
    return this._maxY;
  }
}
