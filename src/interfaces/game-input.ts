import {
  Action,
  GamepadEventType,
  Input,
  MouseEventType,
  PointerEventType,
} from '../types';
import { EventTypes, KeyboardEventType } from '../types';
import { GamepadManagerEvent } from '../managers/gamepad-manager';

export enum InputDevice {
  Keyboard,
  Pointer,
  Mouse,
  Gamepad,
}

export interface ActionState {}

export interface GameInput {
  type: InputDevice;
  eventType: EventTypes;
}

export interface KeyboardInput extends GameInput {
  type: InputDevice.Keyboard;
  eventType: KeyboardEventType;
  key?: string;
  predicate?: (ev: KeyboardEvent) => boolean;
}

export interface PointerInput extends GameInput {
  type: InputDevice.Pointer;
  eventType: PointerEventType;
  predicate: (ev: PointerEvent) => boolean;
}

export interface MouseInput extends GameInput {
  type: InputDevice.Mouse;
  eventType: MouseEventType;
  predicate: (ev: MouseEvent) => boolean;
}

export interface GamepadInput extends GameInput {
  type: InputDevice.Gamepad;
  eventType: GamepadEventType;
  predicate: (ev: GamepadManagerEvent) => boolean;
}

export interface GameInputEvent {
  action: Action;
  inputs: Input[];
}
