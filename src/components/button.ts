import { Label } from './label';
import { Graphics, IBitmapTextStyle } from 'pixi.js';
import { Palette } from '../palette';
import { ContentView, ContentViewOptions } from './content-view';

export interface ButtonOptions extends ContentViewOptions {
  width: number;
  height: number;
  color: number;
  activeColor: number;
  border: number;
  borderColor: number;
  borderRadius: number;
  text: string;
  textOptions: Partial<IBitmapTextStyle>;
}

const defaultButtonOptions: ButtonOptions = {
  width: 100,
  height: 20,
  border: 0,
  borderColor: Palette.accent,
  borderRadius: 0,
  color: Palette.foreground,
  activeColor: Palette.accent,
  text: '',
  textOptions: {
    fontSize: 14,
    tint: Palette.text,
  },
  selectable: false,
  selectionIndex: -1,
  activation: undefined,
};

export class Button extends ContentView {
  private _options: ButtonOptions;

  constructor(options?: Partial<ButtonOptions>) {
    super(options);
    this._options = {
      ...defaultButtonOptions,
      ...options,
    };
    this.redraw();
  }

  public get color() {
    return this.isSelected ? this._options.activeColor : this._options.color;
  }

  public redraw() {
    const graphics = new Graphics();
    graphics.beginFill(this.color);
    graphics.drawRoundedRect(
      0,
      0,
      this._options.width,
      this._options.height,
      this._options.borderRadius,
    );
    graphics.endFill();

    if (this._options.border > 0) {
      graphics.beginFill(this._options.borderColor);
      graphics.drawRoundedRect(
        0,
        0,
        this._options.width,
        this._options.height,
        this._options.borderRadius,
      );
      graphics.endFill();
      graphics.beginHole();
      graphics.drawRoundedRect(
        this._options.border,
        this._options.border,
        this._options.width - this._options.border * 2,
        this._options.height - this._options.border * 2,
        this._options.borderRadius,
      );
      graphics.endHole();
    }

    const text = new Label(this._options.text, this._options.textOptions);
    text.anchor.set(0.5, 0.35);
    text.position.set(this._options.width / 2, this._options.height / 2);
    graphics.addChild(text);
    this.content = graphics;
  }
}
