import type { Container } from 'pixi.js';
import {
  KeyboardInput,
  PointerInput,
  MouseInput,
  GamepadInput,
} from './interfaces/game-input';

export type Constructor = new (...args: any[]) => {};
export type GConstructor<T = {}> = new (...args: any[]) => T;

export type Milliseconds = number;

export type UUIDV4 = string;
export type Random = () => number;
export type Size = [width: number, height: number];
export type Position = [x: number, y: number];

export type RgbColor = [r: number, g: number, b: number];
export type HslColor = [h: number, s: number, l: number];
export type Percentage = number;

export type GamepadButtonType = 'gamepadbuttondown' | 'gamepadbuttonup';
export type GamepadAxisType = 'gamepadaxischanged';
export type GamepadEventType = GamepadButtonType | GamepadAxisType;
export type Action = string;
export type KeyboardEventType = 'keyup' | 'keydown' | 'keypress';
export type MouseEventType =
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseup'
  | 'mouseover'
  | 'mouseout'
  | 'mousewheel';
export type PointerEventType =
  | 'pointercancel'
  | 'pointerdown'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointermove'
  | 'pointerout'
  | 'pointerover'
  | 'pointerup';
export type EventTypes =
  | KeyboardEventType
  | MouseEventType
  | PointerEventType
  | GamepadEventType;
export type Input = KeyboardInput | PointerInput | MouseInput | GamepadInput;
