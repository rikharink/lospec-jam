import { EventEmitter } from '../util/event-emitter';
import {
  GamepadManager,
  GamepadManagerButtonEvent,
  GamepadManagerEvent,
  GamepadManagerEventType,
} from './gamepad-manager';

type Action = string;
type KeyboardEventType = 'keyup' | 'keydown' | 'keypress';

type EventTypes =
  | KeyboardEventType
  | GamepadManagerEventType;

export enum InputDevice {
  Keyboard,
  Pointer,
  Mouse,
  Gamepad,
}

interface GameInput {
  type: InputDevice;
}
interface KeyboardInput extends GameInput {
  type: InputDevice.Keyboard;
  key?: string;
  predicate?: (ev: KeyboardEvent) => boolean;
}
interface GamepadInput extends GameInput {
  type: InputDevice.Gamepad;
  button?: number;
  predicate?: (ev: GamepadManagerEvent) => boolean;
}

type Input = KeyboardInput | GamepadInput;

type ActionType = 'pressed' | 'released' | 'changed';

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
  private _keyboardActionMappings = new Set<Action>();
  private _gamepadActionMappings = new Set<Action>();

  private _actionState = new Set<Action>();

  constructor() {
    super();
    window.addEventListener(
      'keydown',
      this.emitIfSubcribedKeyboard.bind(this),
    );

    window.addEventListener(
      'keyup',
      this.emitIfSubcribedKeyboard.bind(this),
    );

    window.addEventListener(
      'blur',
      this.clearActionState.bind(this),
    )

    this._gamepadManager.start();
    this._gamepadManager.on(this.emitIfSubscribedGamepad.bind(this));
  }

  public get gamepadManager(): GamepadManager {
    return this._gamepadManager;
  }

  public hasAction(action: Action): boolean {
    return this._actionState.has(action);
  }

  private clearActionState() {
    this._actionState.clear();
  }

  private emitIfSubcribedKeyboard(ev: KeyboardEvent) {
    for (let action of this._keyboardActionMappings) {
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
          let actionType: ActionType = ev.type === 'keydown' ? 'pressed' : 'released';
          this.emitAction(action, actionType);
          ev.preventDefault();
        }
      }
    }
  }

  private emitIfSubscribedGamepad(ev: GamepadManagerEvent) {
    for (let action of this._gamepadActionMappings) {
      if (!this._actionMappings.has(action)) continue;
      let inputs = this._actionMappings
        .get(action)
        .filter((i) => i.type == InputDevice.Gamepad)
        .map((i) => i as GamepadInput);
      let button: number | undefined = undefined;
      if (ev.type === GamepadManagerEventType.GamepadButtonDown || ev.type === GamepadManagerEventType.GamepadButtonUp) {
        button = (<GamepadManagerButtonEvent>ev).button
      }
      for (let input of inputs) {
        if ((input.button !== undefined && input.button === button) || (input.predicate?.(ev) ?? false)) {
          let actionType: ActionType;
          switch (ev.type) {
            case GamepadManagerEventType.GamepadButtonDown:
              actionType = 'pressed';
              break;
            case GamepadManagerEventType.GamepadButtonUp:
              actionType = 'released';
              break;
            case GamepadManagerEventType.GamepadAxisChanged:
              actionType = 'changed';
              break;
          }
          this.emitAction(action, actionType);
        }
      }
    }
  }

  private formatActionString(action: string, actionType: ActionType): string[] {
    let result: string[] = [];
    let actionString = `${action}-${actionType}`;
    result.push(actionString);
    if (actionType === 'released') {
      result.push(action);
    }
    return result;
  }

  private emitAction(action: string, actionType: ActionType) {
    if (actionType === 'pressed') {
      this._actionState.add(action);
    } else if (actionType === 'released') {
      this._actionState.delete(action);
    }
    let actions = this.formatActionString(action, actionType);
    let aliases = this._aliasMappings.get(action)?.flatMap((a) => this.formatActionString(a, actionType)) ?? [];
    actions.push(...aliases)
    for (let a of actions) {
      this.emit(a);
    }
  }

  public addEvent(event: GameInputEvent) {
    if (event.aliases) {
      this._aliasMappings.set(event.action, event.aliases);
    }
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
        return this.subscribeKeyboard(action);
      case InputDevice.Gamepad:
        return this.subscribeGamepad(action);
    }
  }

  private subscribeKeyboard(action: Action) {
    this._keyboardActionMappings.add(action);
  }

  private subscribeGamepad(action: Action) {
    this._gamepadActionMappings.add(action);
  }
}
