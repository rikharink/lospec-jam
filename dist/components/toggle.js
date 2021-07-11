import {Graphics, LINE_CAP} from "../../_snowpack/pkg/pixijs.js";
import {Palette} from "../palette.js";
import {ContentView} from "./content-view.js";
export class Toggle extends ContentView {
  constructor(options) {
    super({});
    this._options = {
      size: options?.size ?? 32,
      backgroundColor: options?.backgroundColor ?? Palette.foreground,
      disabledBackgroundColor: options?.disabledBackgroundColor ?? Palette[8],
      lineColor: options?.lineColor ?? Palette.accent,
      disabledLineColor: options?.disabledLineColor ?? Palette[7],
      borderRadius: options?.borderRadius ?? 4,
      lineWidth: options?.lineWidth ?? 4,
      state: options?.state ?? false,
      disabled: options?.disabled ?? false
    };
    this.interactive = !this.disabled;
    this.redraw();
  }
  toggle() {
    this._options.state = !this._options.state;
    this.emit("toggle", this._options.state);
    this.redraw();
  }
  get disabled() {
    return this._options.disabled;
  }
  set disabled(state) {
    this._options.disabled = state;
    this.interactive = !state;
    this.redraw();
  }
  get disabledLineColor() {
    return this._options.disabledLineColor;
  }
  get disabledBackgroundColor() {
    return this._options.disabledBackgroundColor;
  }
  redraw() {
    const t = new Graphics();
    t.beginFill(this.disabled ? this.disabledBackgroundColor : this._options.backgroundColor);
    t.drawRoundedRect(0, 0, this._options.size, this._options.size, this._options.borderRadius);
    t.endFill();
    if (this._options.state) {
      t.lineStyle({
        color: this.disabled ? this.disabledLineColor : this._options.lineColor,
        width: this._options.lineWidth,
        cap: LINE_CAP.ROUND
      });
      t.moveTo(this._options.lineWidth, this._options.lineWidth);
      t.lineTo(this._options.size - this._options.lineWidth, this._options.size - this._options.lineWidth);
      t.moveTo(this._options.lineWidth, this._options.size - this._options.lineWidth);
      t.lineTo(this._options.size - this._options.lineWidth, this._options.lineWidth);
    }
    this.content = t;
  }
}
