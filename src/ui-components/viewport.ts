// ADAPTED FROM pixi-viewport https://github.com/davidfig/pixi-viewport
// The MIT License (MIT)
// Copyright (c) 2017 YOPEY YOPEY LLC

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import { Container, IDestroyOptions, Point, Rectangle, Ticker } from 'pixi.js';

interface IViewportOptions {
  width: number;
  height: number;
  worldWidth: number;
  worldHeight: number;
  ticker: Ticker;
}

interface IViewportTransformState {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
}

const DEFAULT_VIEWPORT_OPTIONS: IViewportOptions = {
  width: window.innerWidth,
  height: window.innerHeight,
  worldWidth: null,
  worldHeight: null,
  ticker: Ticker.shared,
};

export class Viewport extends Container {
  private _pause: boolean = false;
  private options: IViewportOptions;
  private _updateFunction: () => void;
  private _dirty: boolean;

  public lastViewport?: IViewportTransformState | null;
  public moving?: boolean;
  public zooming?: boolean;

  public screenWidth: number;
  public screenHeight: number;

  private _worldWidth?: number | null;
  private _worldHeight?: number | null;

  constructor(options?: IViewportOptions) {
    super();
    this.options = Object.assign({}, DEFAULT_VIEWPORT_OPTIONS, options);

    this.screenWidth = this.options.width;
    this.screenHeight = this.options.height;

    this._worldWidth = this.options.worldWidth;
    this._worldHeight = this.options.worldHeight;
    this._updateFunction = (() =>
      this.update(this.options.ticker.elapsedMS)).bind(this);
  }

  destroy(options?: IDestroyOptions): void {
    this.options.ticker.remove(this._updateFunction);
    super.destroy(options);
  }

  update(elapsed: number): void {
    if (this._pause) return;

    if (this.lastViewport) {
      if (this.lastViewport.x !== this.x || this.lastViewport.y !== this.y) {
        this.moving = true;
      } else if (this.moving) {
        this.moving = false;
      }
      if (
        this.lastViewport.scaleX !== this.scale.x ||
        this.lastViewport.scaleY !== this.scale.y
      ) {
        this.zooming = true;
      } else if (this.zooming) {
        this.zooming = false;
      }

      this.hitArea = new Rectangle(
        this.left,
        this.top,
        this.worldScreenWidth,
        this.worldScreenHeight,
      );

      this._dirty =
        this._dirty ||
        !this.lastViewport ||
        this.lastViewport.x !== this.x ||
        this.lastViewport.y !== this.y ||
        this.lastViewport.scaleX !== this.scale.x ||
        this.lastViewport.scaleY !== this.scale.y;

      this.lastViewport = {
        x: this.x,
        y: this.y,
        scaleX: this.scale.x,
        scaleY: this.scale.y,
        rotation: this.rotation,
      };
    }
  }

  /** World width, in pixels */
  get worldWidth(): number {
    if (this._worldWidth) {
      return this._worldWidth;
    }

    return this.width / this.scale.x;
  }

  set worldWidth(value: number) {
    this._worldWidth = value;
  }

  /** World height, in pixels */
  get worldHeight(): number {
    if (this._worldHeight) {
      return this._worldHeight;
    }

    return this.height / this.scale.y;
  }

  set worldHeight(value: number) {
    this._worldHeight = value;
  }

  /** Get visible world bounds of viewport */
  public getVisibleBounds(): Rectangle {
    return new Rectangle(
      this.left,
      this.top,
      this.worldScreenWidth,
      this.worldScreenHeight,
    );
  }

  /** Change coordinates from screen to world */
  public toWorld(x: number, y: number): Point;
  /** Change coordinates from screen to world */
  public toWorld(screenPoint: Point): Point;

  public toWorld(x: number | Point, y?: number): Point {
    if (arguments.length === 2) {
      return this.toLocal(new Point(x as number, y));
    }

    return this.toLocal(x as Point);
  }

  /** Change coordinates from world to screen */
  public toScreen(x: number, y: number): Point;
  /** Change coordinates from world to screen */
  public toScreen(worldPoint: Point): Point;

  public toScreen(x: number | Point, y?: number): Point {
    if (arguments.length === 2) {
      return this.toGlobal(new Point(x as number, y));
    }

    return this.toGlobal(x as Point);
  }

  /** Center of screen in world coordinates */
  get center(): Point {
    return new Point(
      this.worldScreenWidth / 2 - this.x / this.scale.x,
      this.worldScreenHeight / 2 - this.y / this.scale.y,
    );
  }
  set center(value: Point) {
    this.moveCenter(value);
  }

  /** Move center of viewport to (x, y) */
  public moveCenter(x: number, y: number): Viewport;

  /** Move center of viewport to {@code center}. */
  public moveCenter(center: Point): Viewport;

  public moveCenter(...args: [number, number] | [Point]): Viewport {
    let x: number;
    let y: number;

    if (typeof args[0] === 'number') {
      x = args[0];
      y = args[1] as number;
    } else {
      x = args[0].x;
      y = args[0].y;
    }

    const newX = (this.worldScreenWidth / 2 - x) * this.scale.x;
    const newY = (this.worldScreenHeight / 2 - y) * this.scale.y;

    if (this.x !== newX || this.y !== newY) {
      this.position.set(newX, newY);
      this.dirty = true;
    }

    return this;
  }

  /** Top-left corner of Viewport */
  get corner(): Point {
    return new Point(-this.x / this.scale.x, -this.y / this.scale.y);
  }
  set corner(value: Point) {
    this.moveCorner(value);
  }

  /** Move Viewport's top-left corner; also clamps and resets decelerate and bounce (as needed) */
  public moveCorner(x: number, y: number): Viewport;

  /** move Viewport's top-left corner; also clamps and resets decelerate and bounce (as needed) */
  public moveCorner(center: Point): Viewport;

  public moveCorner(...args: [number, number] | [Point]): Viewport {
    let x;
    let y;

    if (args.length === 1) {
      x = -args[0].x * this.scale.x;
      y = -args[0].y * this.scale.y;
    } else {
      x = -args[0] * this.scale.x;
      y = -args[1] * this.scale.y;
    }

    if (x !== this.x || y !== this.y) {
      this.position.set(x, y);
      this.dirty = true;
    }

    return this;
  }

  /** Get how many world pixels fit in screen's width */
  get screenWidthInWorldPixels(): number {
    return this.screenWidth / this.scale.x;
  }

  /** Get how many world pixels fit on screen's height */
  get screenHeightInWorldPixels(): number {
    return this.screenHeight / this.scale.y;
  }

  /**
   * Find the scale value that fits a world width on the screen
   * does not change the viewport (use fit... to change)
   *
   * @param width - Width in world pixels
   * @return - scale
   */
  findFitWidth(width: number): number {
    return this.screenWidth / width;
  }

  /**
   * Finds the scale value that fits a world height on the screens
   * does not change the viewport (use fit... to change)
   *
   * @param height - Height in world pixels
   * @return - scale
   */
  findFitHeight(height: number): number {
    return this.screenHeight / height;
  }

  /**
   * Finds the scale value that fits the smaller of a world width and world height on the screen
   * does not change the viewport (use fit... to change)
   *
   * @param {number} width in world pixels
   * @param {number} height in world pixels
   * @returns {number} scale
   */
  findFit(width: number, height: number): number {
    const scaleX = this.screenWidth / width;
    const scaleY = this.screenHeight / height;

    return Math.min(scaleX, scaleY);
  }

  /**
   * Finds the scale value that fits the larger of a world width and world height on the screen
   * does not change the viewport (use fit... to change)
   *
   * @param {number} width in world pixels
   * @param {number} height in world pixels
   * @returns {number} scale
   */
  findCover(width: number, height: number): number {
    const scaleX = this.screenWidth / width;
    const scaleY = this.screenHeight / height;

    return Math.max(scaleX, scaleY);
  }

  /**
   * Change zoom so the width fits in the viewport
   *
   * @param width - width in world coordinates
   * @param center - maintain the same center
   * @param scaleY - whether to set scaleY=scaleX
   * @param noClamp - whether to disable clamp-zoom
   * @returns {Viewport} this
   */
  fitWidth(width = this.worldWidth, center?: boolean, scaleY = true): Viewport {
    let save: Point | undefined;

    if (center) {
      save = this.center;
    }
    this.scale.x = this.screenWidth / width;

    if (scaleY) {
      this.scale.y = this.scale.x;
    }

    if (center && save) {
      this.moveCenter(save);
    }

    return this;
  }

  /**
   * Change zoom so the height fits in the viewport
   *
   * @param {number} [height=this.worldHeight] in world coordinates
   * @param {boolean} [center] maintain the same center of the screen after zoom
   * @param {boolean} [scaleX=true] whether to set scaleX = scaleY
   * @param {boolean} [noClamp] whether to disable clamp-zoom
   * @returns {Viewport} this
   */
  fitHeight(
    height = this.worldHeight,
    center?: boolean,
    scaleX = true,
  ): Viewport {
    let save: Point | undefined;

    if (center) {
      save = this.center;
    }
    this.scale.y = this.screenHeight / height;

    if (scaleX) {
      this.scale.x = this.scale.y;
    }

    if (center && save) {
      this.moveCenter(save);
    }

    return this;
  }

  /**
   * Change zoom so it fits the entire world in the viewport
   *
   * @param {boolean} center maintain the same center of the screen after zoom
   * @returns {Viewport} this
   */
  fitWorld(center?: boolean): Viewport {
    let save: Point | undefined;

    if (center) {
      save = this.center;
    }

    this.scale.x = this.screenWidth / this.worldWidth;
    this.scale.y = this.screenHeight / this.worldHeight;

    if (this.scale.x < this.scale.y) {
      this.scale.y = this.scale.x;
    } else {
      this.scale.x = this.scale.y;
    }

    if (center && save) {
      this.moveCenter(save);
    }

    return this;
  }

  /**
   * Change zoom so it fits the size or the entire world in the viewport
   *
   * @param {boolean} [center] maintain the same center of the screen after zoom
   * @param {number} [width=this.worldWidth] desired width
   * @param {number} [height=this.worldHeight] desired height
   * @returns {Viewport} this
   */
  fit(
    center?: boolean,
    width = this.worldWidth,
    height = this.worldHeight,
  ): Viewport {
    let save: Point | undefined;

    if (center) {
      save = this.center;
    }

    this.scale.x = this.width / width;
    this.scale.y = this.height / height;

    if (this.scale.x < this.scale.y) {
      this.scale.y = this.scale.x;
    } else {
      this.scale.x = this.scale.y;
    }

    if (center && save) {
      this.moveCenter(save);
    }

    return this;
  }

  /**
   * Zoom viewport to specific value.
   *
   * @param {number} scale value (e.g., 1 would be 100%, 0.25 would be 25%)
   * @param {boolean} [center] maintain the same center of the screen after zoom
   * @return {Viewport} this
   */
  setZoom(scale: number, center?: boolean): Viewport {
    let save;

    if (center) {
      save = this.center;
    }
    this.scale.set(scale);
    if (center && save) {
      this.moveCenter(save);
    }
    return this;
  }

  /**
   * Zoom viewport by a certain percent (in both x and y direction).
   *
   * @param {number} percent change (e.g., 0.25 would increase a starting scale of 1.0 to 1.25)
   * @param {boolean} [center] maintain the same center of the screen after zoom
   * @return {Viewport} this
   */
  zoomPercent(percent: number, center?: boolean): Viewport {
    return this.setZoom(this.scale.x + this.scale.x * percent, center);
  }

  /**
   * Zoom viewport by increasing/decreasing width by a certain number of pixels.
   *
   * @param {number} change in pixels
   * @param {boolean} [center] maintain the same center of the screen after zoom
   * @return {Viewport} this
   */
  zoom(change: number, center?: boolean): Viewport {
    this.fitWidth(change + this.worldScreenWidth, center);

    return this;
  }

  /** Changes scale of viewport and maintains center of viewport */
  get scaled(): number {
    return this.scale.x;
  }

  set scaled(scale: number) {
    this.setZoom(scale, true);
  }

  /** Is container out of world bounds */
  OOB(): {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
    cornerPoint: Point;
  } {
    return {
      left: this.left < 0,
      right: this.right > this.worldWidth,
      top: this.top < 0,
      bottom: this.bottom > this.worldHeight,
      cornerPoint: new Point(
        this.worldWidth * this.scale.x - this.screenWidth,
        this.worldHeight * this.scale.y - this.screenHeight,
      ),
    };
  }

  get worldScreenWidth(): number {
    return this.width / this.scale.x;
  }

  /** Screen height in world coordinates */
  get worldScreenHeight(): number {
    return this.height / this.scale.y;
  }

  /** World coordinates of the right edge of the screen */
  get right(): number {
    return -this.x / this.scale.x + this.worldScreenWidth;
  }
  set right(value: number) {
    this.x = -value * this.scale.x + this.width;
  }

  /** World coordinates of the left edge of the screen */
  get left(): number {
    return -this.x / this.scale.x;
  }
  set left(value: number) {
    this.x = -value * this.scale.x;
  }

  /** World coordinates of the top edge of the screen */
  get top(): number {
    return -this.y / this.scale.y;
  }

  set top(value: number) {
    this.y = -value * this.scale.y;
  }

  /** World coordinates of the bottom edge of the screen */
  get bottom(): number {
    return -this.y / this.scale.y + this.worldScreenHeight;
  }

  set bottom(value: number) {
    this.y = -value * this.scale.y + this.height;
  }

  /**
   * Determines whether the viewport is dirty (i.e., needs to be rendered to the screen because of a change)
   */
  get dirty(): boolean {
    return !!this._dirty;
  }

  set dirty(value: boolean) {
    this._dirty = value;
  }

  /** Pause viewport (including animation updates such as decelerate) */
  get pause(): boolean {
    return !!this._pause;
  }

  set pause(value: boolean) {
    this._pause = value;

    this.lastViewport = null;
    this.moving = false;
    this.zooming = false;
  }

  /**
   * Move the viewport so the bounding box is visible
   *
   * @param x - left
   * @param y - top
   * @param width
   * @param height
   * @param resizeToFit - Resize the viewport so the box fits within the viewport
   */
  public ensureVisible(
    x: number,
    y: number,
    width: number,
    height: number,
    resizeToFit?: boolean,
  ): void {
    if (
      resizeToFit &&
      (width > this.worldScreenWidth || height > this.worldScreenHeight)
    ) {
      this.fit(true, width, height);
    }
  }
}
