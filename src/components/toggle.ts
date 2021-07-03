import { Graphics, LINE_CAP } from 'pixi.js';
import { Palette } from '../palette';
import { ContentView } from './content-view';

interface ToggleOptions {
  size: number;
  backgroundColor: number;
  disabledBackgroundColor: number;
  lineColor: number;
  disabledLineColor: number;
  borderRadius: number;
  lineWidth: number;
  state: boolean;
  disabled: boolean;
}

export class Toggle extends ContentView {
  private _options: ToggleOptions;
  constructor(options?: Partial<ToggleOptions>) {
    super();
    this._options = {
      size: options?.size ?? 32,
      backgroundColor: options?.backgroundColor ?? Palette.foreground,
      disabledBackgroundColor: options?.disabledBackgroundColor ?? Palette[8],
      lineColor: options?.lineColor ?? Palette.accent,
      disabledLineColor: options?.disabledLineColor ?? Palette[7],
      borderRadius: options?.borderRadius ?? 4,
      lineWidth: options?.lineWidth ?? 4,
      state: options?.state ?? false,
      disabled: options?.disabled ?? false,
    };
    this.interactive = !this.disabled;
    this.on('click', this.toggle.bind(this));
    this.draw();
  }

  public toggle() {
    this._options.state = !this._options.state;
    this.emit('toggle', this._options.state);
    this.draw();
  }

  public get disabled() {
    return this._options.disabled;
  }

  public set disabled(state: boolean) {
    this._options.disabled = state;
    this.interactive = !state;
    this.draw();
  }

  private get disabledLineColor(): number {
    return this._options.disabledLineColor;
  }

  private get disabledBackgroundColor(): number {
    return this._options.disabledBackgroundColor;
  }

  private draw() {
    const t = new Graphics();
    t.beginFill(
      this.disabled
        ? this.disabledBackgroundColor
        : this._options.backgroundColor,
    );
    t.drawRoundedRect(
      0,
      0,
      this._options.size,
      this._options.size,
      this._options.borderRadius,
    );
    t.endFill();

    if (this._options.state) {
      t.lineStyle({
        color: this.disabled ? this.disabledLineColor : this._options.lineColor,
        width: this._options.lineWidth,
        cap: LINE_CAP.ROUND,
      });
      t.moveTo(this._options.lineWidth, this._options.lineWidth);
      t.lineTo(
        this._options.size - this._options.lineWidth,
        this._options.size - this._options.lineWidth,
      );
      t.moveTo(
        this._options.lineWidth,
        this._options.size - this._options.lineWidth,
      );
      t.lineTo(
        this._options.size - this._options.lineWidth,
        this._options.lineWidth,
      );
    }
    this.content = t;
  }
}
