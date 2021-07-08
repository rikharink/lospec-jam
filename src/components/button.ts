import { Label } from './label';
import {
  Graphics,
  IBitmapTextStyle,
  InteractionEvent,
} from 'pixi.js';
import { Palette } from '../palette';
import { SceneManager } from '../managers/scene-manager';
import { middle } from '../util';
import { Game } from '../game';
import { ContentView } from './content-view';

export interface ButtonOptions {
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
  width: 200,
  height: 42,
  border: 0,
  borderColor: Palette.accent,
  borderRadius: 5,
  color: Palette.foreground,
  activeColor: Palette.accent,
  text: '',
  textOptions: {
    tint: Palette.text,
  },
};

class Button extends ContentView {
  private _options: ButtonOptions;
  private _color: number;
  private _active: boolean;

  constructor(options?: Partial<ButtonOptions>) {
    super();
    super.interactive = true;
    this._options = {
      ...defaultButtonOptions,
      ...options,
    };
    this._color = this._options.color;
    this.draw();
  }

  public get active() {
    return this._active;
  }

  public set active(value: boolean) {
    this._active = value;
    value ? this.setActive() : this.setInactive();
  }

  private setActive() {
    this._color = this._options.activeColor;
    this.draw();
  }

  private setInactive() {
    this._color = this._options.color;
    this.draw();
  }

  private draw() {
    const graphics = new Graphics();
    graphics.beginFill(this._color);
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

function getBackButton() {
  const backButton = new Button({ text: 'BACK' });
  const [width, height] = Game.game.size;
  backButton.position.set(
    middle(width, backButton.width),
    height - backButton.height - 4,
  );
  backButton.on('pointerup', (ev: InteractionEvent) => {
    if (ev.data.button === 0) {
      SceneManager.shared.back();
    }
  });
  return backButton;
}

export { getBackButton, Button };
