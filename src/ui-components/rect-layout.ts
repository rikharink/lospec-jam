import { Graphics, Container } from 'pixi.js';
import { getMask, uuidv4 } from '../util';
import { ContentView } from './content-view';

export class RectLayout extends ContentView {
  private _id: string = uuidv4();
  private _minX: number;
  private _minY: number;
  private _maxX: number;
  private _maxY: number;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this._minX = x;
    this._minY = y;
    this._maxX = this._minX + width;
    this._maxY = this._minY + height;
    this.content = new Container();
    this.content.mask = this.mask;
  }

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

  public cutLeft(size: number): RectLayout {
    let minX = this.minX;
    this._minX = Math.min(this.maxX, this.minX + size);
    this.content.mask = this.mask;
    return new RectLayout(minX, this.minY, this.minX, this.maxY);
  }

  public cutRight(size: number): RectLayout {
    let maxX = this.maxX;
    this._maxX = Math.max(this.minX, this.maxX - size);
    this.content.mask = this.mask;
    return new RectLayout(this.maxX, this.minY, maxX, this.maxY);
  }

  public cutTop(size: number): RectLayout {
    let minY = this.minY;
    this._minY = Math.min(this.maxY, this.minY + size);
    this.content.mask = this.mask;
    return new RectLayout(this.minX, minY, this.maxX, this.minY);
  }

  public cutBottom(size: number): RectLayout {
    let maxY = this.maxY;
    this._maxY = Math.max(this.minY, this.maxY - size);
    this.content.mask = this.mask;
    return new RectLayout(this.minX, this.maxY, this.maxX, maxY);
  }

  public get mask(): Graphics {
    return getMask(this.minX,
      this.minY,
      this.maxX - this.minX,
      this.maxY - this.minY);
  }
}
