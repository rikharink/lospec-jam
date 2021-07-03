import { DisplayObject } from 'pixi.js';
import { getMask } from '../util';
import { ContentView } from './content-view';

export class ScrollView extends ContentView {
  private _startX: number;
  private _startY: number;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    this.mask = getMask(x, y, width, height);
  }

  public scroll(offset: number) {
    this.content.position.set(
      this.content.position.x,
      this.content.position.y + offset,
    );
  }

  public reset() {
    this.content.position.set(this._startX, this._startY);
  }

  public get content() {
    return super.content;
  }

  public set content(value: DisplayObject) {
    super.content = value;
    this._startX = value.position.x;
    this._startY = value.position.y;
  }

  public setMask(x: number, y: number, width: number, height: number) {
    this.mask = getMask(x, y, width, height);
  }
}
