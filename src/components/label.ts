import { BitmapText, IBitmapTextStyle } from 'pixi.js';
import { Palette } from '../palette';

const defaultStyle: Partial<IBitmapTextStyle> = {
  fontName: 'Press Start 2P',
  fontSize: 12,
  align: 'center',
  tint: Palette.text,
};

export class Label extends BitmapText {
  constructor(text: string, style = defaultStyle) {
    style = {
      ...defaultStyle,
      ...style,
    };
    super(text, style);
  }
}
