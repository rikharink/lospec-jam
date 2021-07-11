import {
  Graphics,
  LINE_CAP
} from "../../_snowpack/pkg/pixijs.js";
import {clamp, normalize} from "../math/math.js";
import {Palette} from "../palette.js";
import {ContentView} from "./content-view.js";
export class Slider extends ContentView {
  constructor({
    min = 0,
    max = 1,
    value = 0,
    width = 200,
    height = 32,
    trackColor = Palette.foreground,
    trackColorDisabled = Palette[8],
    trackWidth = 2,
    thumbColor = Palette.accent,
    thumbColorDisabled = Palette[8],
    thumbWidth = 12,
    thumbHeight = 16
  }) {
    super({});
    this._isDragging = false;
    this._disabled = false;
    this._min = min;
    this._max = max;
    this._value = value;
    this._sliderWidth = width;
    this._sliderHeight = height;
    this._trackColor = trackColor;
    this._trackColorDisabled = trackColorDisabled;
    this._trackWidth = trackWidth;
    this._thumbColor = thumbColor;
    this._thumbColorDisabled = thumbColorDisabled;
    this._thumbWidth = thumbWidth;
    this._thumbHeight = thumbHeight;
    this.redraw();
  }
  redraw() {
    let slider = new Graphics();
    let track = new Graphics();
    track.interactive = false;
    track.lineStyle({
      color: !this.disabled ? this._trackColor : this._trackColorDisabled,
      width: this._trackWidth,
      cap: LINE_CAP.BUTT
    });
    let startY = this._sliderHeight / 2;
    let startX = 0;
    let endX = startX + this._sliderWidth;
    track.moveTo(startX, startY);
    track.lineTo(endX, startY);
    let thumb = new Graphics();
    let nv = normalize(this._value, this._min, this._max);
    let thumbX = endX * nv - this._thumbWidth / 2;
    let startThumbY = startY - this._thumbHeight / 2;
    thumb.beginFill(!this.disabled ? this._thumbColor : this._thumbColorDisabled);
    thumb.drawRoundedRect(thumbX, startThumbY, this._thumbWidth, this._thumbHeight, 4);
    thumb.endFill();
    thumb.interactive = !this.disabled;
    thumb.on("pointerdown", this.startMove.bind(this));
    thumb.on("pointerup", this.stopMove.bind(this));
    slider.interactive = !this.disabled;
    slider.on("pointermove", this.move.bind(this));
    slider.on("pointerup", this.stopMove.bind(this));
    this.on("pointerup", this.stopMove.bind(this));
    slider.addChild(track, thumb);
    this.content = slider;
  }
  move(ev) {
    if (this._isDragging) {
      let pos = ev.data.global.clone();
      let dx = pos.x - this._lastPos.x;
      let movement = dx / this.width;
      this.value = clamp(this._min, this._max, this._value + movement);
      this._lastPos = pos;
    }
  }
  startMove(ev) {
    if (ev.data.button === 0) {
      this._lastPos = ev.data.global.clone();
      this._isDragging = true;
    }
  }
  stopMove() {
    this._lastPos = void 0;
    this._isDragging = false;
  }
  get value() {
    return this._value;
  }
  get min() {
    return this._min;
  }
  get max() {
    return this._max;
  }
  set value(value) {
    if (value == this._value)
      return;
    if (value < this._min || value > this._max) {
      throw Error(`Value ${value} must be between ${this._min} and ${this._max}`);
    }
    this._value = value;
    this.emit("slidervaluechanged", this._value);
    this.redraw();
  }
  scaleWidthToParent() {
    this.width = this.parent.width;
  }
  get disabled() {
    return this._disabled;
  }
  set disabled(value) {
    this._disabled = value;
    this.redraw();
  }
}
