import { Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { EventEmitter } from './../event-emitter';
import {
  GamepadManager,
  GamepadManagerEvent,
  GamepadManagerEventType,
} from './gamepad-manager';

type Action = string;
type KeyboardEventType = 'keyup' | 'keydown' | 'keypress';
type MouseEventType =
  | 'mousedown'
  | 'mouseenter'
  | 'mouseleave'
  | 'mousemove'
  | 'mouseup'
  | 'mouseover'
  | 'mouseout'
  | 'mousewheel';
type PointerEventType =
  | 'pointercancel'
  | 'pointerdown'
  | 'pointerenter'
  | 'pointerleave'
  | 'pointermove'
  | 'pointerout'
  | 'pointerover'
  | 'pointerup';
type EventTypes =
  | KeyboardEventType
  | MouseEventType
  | PointerEventType
  | GamepadManagerEventType;

export enum InputDevice {
  Keyboard,
  Pointer,
  Mouse,
  Gamepad,
}

interface GameInput {
  type: InputDevice;
  eventType: EventTypes;
}

interface KeyboardInput extends GameInput {
  type: InputDevice.Keyboard;
  eventType: KeyboardEventType;
  key?: string;
  predicate?: (ev: KeyboardEvent) => boolean;
}

interface PointerInput extends GameInput {
  type: InputDevice.Pointer;
  eventType: PointerEventType;
  predicate: (ev: PointerEvent) => boolean;
}

interface MouseInput extends GameInput {
  type: InputDevice.Mouse;
  eventType: MouseEventType;
  predicate: (ev: MouseEvent) => boolean;
}

interface GamepadInput extends GameInput {
  type: InputDevice.Gamepad;
  eventType: GamepadManagerEventType;
  predicate: (ev: GamepadManagerEvent) => boolean;
}

type Input = KeyboardInput | PointerInput | MouseInput | GamepadInput;

interface GameInputEvent {
  action: Action;
  aliases?: Action[];
  inputs: Input[];
}

export class InputManager extends EventEmitter<Action> {
  private static _shared: InputManager = new InputManager();
  private _gamepadManager = GamepadManager.shared;

  private _actionMappings = new Map<Action, Input[]>();
  private _aliasMappings = new Map<Action, Action[]>();
  private _keyboardEventMappings = new Map<KeyboardEventType, Action[]>();
  private _mouseEventMappings = new Map<MouseEventType, Action[]>();
  private _pointerEventMappings = new Map<PointerEventType, Action[]>();
  private _gamepadEventMappings = new Map<GamepadManagerEventType, Action[]>();

  private _saveStateActions: Action[] = [];
  private _actionState = new Map<Action, boolean>();

  constructor() {
    super();
    this.on(this.saveActionState.bind(this));
  }

  public get gamepadManager(): GamepadManager {
    return this._gamepadManager;
  }

  public hasAction(action: Action): boolean {
    return this._actionState.get(action) ?? false;
  }

  private saveActionState(action: Action) {
    if (this._saveStateActions.indexOf(action) === -1) return;
    this._actionState.set(action, true);
  }

  public clearState(...actions: Action[]) {
    for (let action of actions) {
      this._actionState.set(action, false);
    }
  }

  private emitIfSubcribedKeyboard(ev: KeyboardEvent) {
    if (!this._keyboardEventMappings.has(<KeyboardEventType>ev.type)) return;
    let actions: Action[] = this._keyboardEventMappings.get(
      <KeyboardEventType>ev.type,
    );
    for (let action of actions) {
      if (!this._actionMappings.has(action)) continue;
      let inputs = this._actionMappings
        .get(action)
        .filter((i) => i.type == InputDevice.Keyboard)
        .map((i) => i as KeyboardInput);
      for (let input of inputs) {
        if (
          (!input.key || input.key == ev.key) &&
          (!input.predicate || input.predicate(ev))
        ) {
          this.emitAction(action);
          ev.preventDefault();
        }
      }
    }
  }

  private emitIfSubscribedMouse(ev: MouseEvent) {
    if (!this._mouseEventMappings.has(<MouseEventType>ev.type)) return;
    let actions: Action[] = this._mouseEventMappings.get(
      <MouseEventType>ev.type,
    );
    for (let action of actions) {
      if (!this._actionMappings.has(action)) continue;
      let inputs = this._actionMappings
        .get(action)
        .filter((i) => i.type == InputDevice.Mouse)
        .map((i) => i as MouseInput);
      for (let input of inputs) {
        if (input.predicate(ev)) {
          this.emitAction(action);
          ev.preventDefault();
        }
      }
    }
  }

  private emitIfSubscribedPointer(ev: PointerEvent) {
    if (!this._pointerEventMappings.has(<PointerEventType>ev.type)) return;
    let actions: Action[] = this._pointerEventMappings.get(
      <PointerEventType>ev.type,
    );
    for (let action of actions) {
      if (!this._actionMappings.has(action)) continue;
      let inputs = this._actionMappings
        .get(action)
        .filter((i) => i.type == InputDevice.Pointer)
        .map((i) => i as PointerInput);
      for (let input of inputs) {
        if (input.predicate(ev)) {
          this.emitAction(action);
          ev.preventDefault();
        }
      }
    }
  }

  private emitIfSubscribedGamepad(ev: GamepadManagerEvent) {
    if (!this._gamepadEventMappings.has(ev.type)) return;
    let actions: Action[] = this._gamepadEventMappings.get(ev.type);
    for (let action of actions) {
      if (!this._actionMappings.has(action)) continue;
      let inputs = this._actionMappings
        .get(action)
        .filter((i) => i.type == InputDevice.Gamepad)
        .map((i) => i as GamepadInput);
      for (let input of inputs) {
        if (input.predicate(ev)) {
          this.emitAction(action);
        }
      }
    }
  }

  private emitAction(action: string) {
    let actions = [action];
    actions.push(...(this._aliasMappings.get(action) ?? []));
    for (let a of actions) {
      this.emit(a);
    }
  }

  public addEvent(event: GameInputEvent) {
    if (event.aliases) {
      this._aliasMappings.set(event.action, event.aliases);
    }
    this._saveStateActions.push(event.action);
    for (let input of event.inputs) {
      this.subscribe(event.action, input);
    }
  }

  public addEvents(...events: GameInputEvent[]) {
    for (let event of events) {
      this.addEvent(event);
    }
  }

  public static get shared() {
    return InputManager._shared;
  }

  private addAction(action: Action, input: Input) {
    if (this._actionMappings.has(action)) {
      this._actionMappings.get(action).push(input);
    } else {
      this._actionMappings.set(action, [input]);
    }
  }

  private subscribe(action: Action, input: Input) {
    this.addAction(action, input);
    switch (input.type) {
      case InputDevice.Keyboard:
        return this.subscribeKeyboard(action, input);
      case InputDevice.Gamepad:
        return this.subscribeGamepad(action, input);
      case InputDevice.Mouse:
        return this.subscribeMouse(action, input);
      case InputDevice.Pointer:
        return this.subscribePointer(action, input);
    }
  }

  private subscribeKeyboard(action: Action, input: KeyboardInput) {
    if (this._keyboardEventMappings.has(input.eventType)) {
      this._keyboardEventMappings.get(input.eventType).push(action);
    } else {
      window.addEventListener(
        input.eventType,
        this.emitIfSubcribedKeyboard.bind(this),
      );
      this._keyboardEventMappings.set(input.eventType, [action]);
    }
  }

  private subscribeMouse(action: Action, input: MouseInput) {
    if (this._mouseEventMappings.has(input.eventType)) {
      this._mouseEventMappings.get(input.eventType).push(action);
    } else {
      window.addEventListener(
        input.eventType,
        this.emitIfSubscribedMouse.bind(this),
      );
      this._mouseEventMappings.set(input.eventType, [action]);
    }
  }

  private subscribePointer(action: Action, input: PointerInput) {
    if (this._pointerEventMappings.has(input.eventType)) {
      this._pointerEventMappings.get(input.eventType).push(action);
    } else {
      window.addEventListener(
        input.eventType,
        this.emitIfSubscribedPointer.bind(this),
      );
      this._pointerEventMappings.set(input.eventType, [action]);
    }
  }

  private subscribeGamepad(action: Action, input: GamepadInput) {
    if (this._gamepadEventMappings.has(input.eventType)) {
      this._gamepadEventMappings.get(input.eventType).push(action);
    } else {
      this._gamepadManager.start();
      this._gamepadManager.on(this.emitIfSubscribedGamepad.bind(this));
      this._gamepadEventMappings.set(input.eventType, [action]);
    }
  }
}
