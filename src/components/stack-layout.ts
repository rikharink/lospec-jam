import { Container, DisplayObject, ObservablePoint } from 'pixi.js';
import { Game } from '../game';
import { Size } from '../types';
import { calculateCenter, getSize } from '../util';
import { ContentView } from './content-view';

export enum StackDirection {
  Horizontal,
  Vertical,
}

interface StackLayoutOptions {
  direction: StackDirection;
  spacing: number;
}

export class StackLayout extends ContentView {
  private _container: Container = new Container();
  private _direction: StackDirection;
  private _spacing: number;
  private _offset: number;

  public constructor({
    direction = StackDirection.Vertical,
    spacing = 4,
  }: Partial<StackLayoutOptions>) {
    super();
    this._direction = direction;
    this._spacing = spacing;
    this._offset = 0;
    this.content = this._container;
  }

  private getOffset(object: DisplayObject): number {
    let bounds = object.getBounds();
    if (this._direction === StackDirection.Vertical) {
      return bounds.height + this._spacing;
    } else {
      return bounds.width + this._spacing;
    }
  }

  public addChild<T extends DisplayObject[]>(...children: T): T[0] {
    for (let c of children) {
      if (this._direction === StackDirection.Vertical) {
        c.position.set(c.position.x, c.position.y + this._offset);
      } else {
        c.position.set(c.position.x + this._offset, c.position.y);
      }
      this._offset += this.getOffset(c);
    }
    return this._container.addChild(...children);
  }

  public setChildren<T extends DisplayObject[]>(...children: T) {
    this._container.removeChildren();
    this.addChild(...children);
  }

  public get width(): number {
    return this._container.width;
  }

  public get height(): number {
    return this._container.height;
  }

  public get position() {
    return this._container.position;
  }
}
