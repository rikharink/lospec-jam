import { Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { EventEmitter } from '../util/event-emitter';
import { Disposable } from '../interfaces/disposable';
import { GamepadEffect, RawGamepad } from '../interfaces/raw-gamepad';

export enum GamepadManagerEventType {
  GamepadAxisChanged,
  GamepadButtonDown,
  GamepadButtonUp,
}

export interface GamepadManagerEvent {
  type: GamepadManagerEventType;
  gamepadIndex: number;
}

export interface GamepadManagerButtonEvent extends GamepadManagerEvent {
  type:
  | GamepadManagerEventType.GamepadButtonDown
  | GamepadManagerEventType.GamepadButtonUp;
  button: number;
  value?: number;
}

export interface GamepadManagerAxisEvent extends GamepadManagerEvent {
  type: GamepadManagerEventType.GamepadAxisChanged;
  axis: number;
  currentValue: number;
  oldValue: number;
  change: number;
}

interface GamepadState {
  axesStatus: number[];
  buttonsStatus: GamepadButton[];
  axesCache: number[];
  buttonsCache: GamepadButton[];
}

export class GamepadManager
  extends EventEmitter<GamepadManagerEvent>
  implements Disposable {
  private static _shared: GamepadManager = new GamepadManager();
  private _ticker: Ticker = new Ticker();
  private _gamepads = new Map<number, GamepadState>();
  private _deadzoneTreshold: number = 0.01;
  private _started: boolean;

  constructor() {
    super();
  }

  public get started() {
    return this._started;
  }

  public get deadzoneTreshold() {
    return this._deadzoneTreshold;
  }

  public set deadzoneTreshold(treshold: number) {
    this._deadzoneTreshold = treshold;
  }

  public static get shared(): GamepadManager {
    return GamepadManager._shared;
  }

  public start() {
    if (this._started) return;
    this._ticker.start();
    this._ticker.add(this.updateLoop.bind(this), UPDATE_PRIORITY.INTERACTION);
    window.addEventListener('gamepadconnected', this.connect.bind(this));
    window.addEventListener('gamepaddisconnected', this.disconnect.bind(this));
    for (let gp of navigator.getGamepads()) {
      if (gp == null) continue;
      this.connectGamepad(gp);
    }
    this._started = true;
  }

  public stop() {
    if (!this._started) return;
    this._ticker.stop();
    this._ticker.remove(this.updateLoop.bind(this));
    window.removeEventListener('gamepadconnected', this.connect.bind(this));
    window.removeEventListener(
      'gamepaddisconnected',
      this.disconnect.bind(this),
    );
    for (let gp of navigator.getGamepads()) {
      this.disconnectGamepad(gp);
    }
    this._started = false;
  }

  public dispose() {
    this.stop();
  }

  public vibrate(gamepadIndex: number, effect: GamepadEffect): RawGamepad {
    const gamepad = GamepadManager.getGamepadByIndex(gamepadIndex);
    if (!gamepad || !gamepad.vibrationActuator) return;
    gamepad.vibrationActuator.playEffect('dual-rumble', effect);
  }

  public static getGamepadByIndex(index: number): RawGamepad | null {
    return navigator.getGamepads()[index];
  }

  private connect(ev: GamepadEvent) {
    this.connectGamepad(ev.gamepad);
  }

  private disconnect(ev: GamepadEvent) {
    this.disconnectGamepad(ev.gamepad);
  }

  private connectGamepad(gamepad: Gamepad) {
    this._gamepads.set(gamepad.index, {
      buttonsCache: [],
      axesCache: [],
      axesStatus: [],
      buttonsStatus: [],
    });
  }

  private disconnectGamepad(gamepad: Gamepad) {
    if (this._gamepads.has(gamepad.index)) {
      this._gamepads.delete(gamepad.index);
    }
  }

  private updateLoop() {
    if (this._gamepads.size === 0) return;
    for (let [index, state] of this._gamepads) {
      this.updateGamepadState(index, state);
      this.emitEvents(index, state);
    }
  }

  private updateGamepadState(index: number, state: GamepadState) {
    let gamepad = navigator.getGamepads()[index];
    if (!gamepad) return;

    // clear the caches
    state.buttonsCache = new Array<GamepadButton>(gamepad.buttons.length);
    state.axesCache = new Array<number>(gamepad.axes.length);

    // move the status from the previous frame to the caches
    for (let k = 0; k < state.buttonsStatus.length; k++) {
      state.buttonsCache[k] = state.buttonsStatus[k];
    }

    for (let k = 0; k < state.axesStatus.length; k++) {
      state.axesCache[k] = state.axesStatus[k];
    }

    // clear the buttons status
    state.buttonsStatus.length = 0;

    // loop through buttons and push the pressed ones to the array
    let pressed: GamepadButton[] = [];
    if (gamepad.buttons) {
      for (let b = 0, t = gamepad.buttons.length; b < t; b++) {
        if (gamepad.buttons[b].pressed) {
          pressed[b] = gamepad.buttons[b];
        } else {
          pressed[b] = undefined;
        }
      }
    }
    state.buttonsStatus = pressed;

    // clear the axes status
    state.axesStatus = [];

    // loop through axes and push their values to the array
    let axes: number[] = [];
    if (gamepad.axes) {
      for (let a = 0, x = gamepad.axes.length; a < x; a++) {
        axes[a] = this.applyDeadzone(gamepad.axes[a]);
      }
    }
    state.axesStatus = axes;
  }

  private applyDeadzone(value: number) {
    let percentage =
      (Math.abs(value) - this._deadzoneTreshold) / (1 - this._deadzoneTreshold);
    if (percentage < 0) percentage = 0;
    return percentage * (value > 0 ? 1 : -1);
  }

  private emitEvents(gamepadIndex: number, state: GamepadState) {
    let buttonsPrevious = state.buttonsCache;
    let buttonsCurrent = state.buttonsStatus;

    for (let i = 0; i < buttonsCurrent.length; i++) {
      let previous = buttonsPrevious[i];
      let current = buttonsCurrent[i];

      //BUTTON DOWN
      if (current) {
        let event: GamepadManagerButtonEvent = {
          type: GamepadManagerEventType.GamepadButtonDown,
          gamepadIndex: gamepadIndex,
          button: i,
          value: current.value,
        };
        this.emit(event);
      }

      //BUTTON UP
      if (previous && !current) {
        let event: GamepadManagerButtonEvent = {
          type: GamepadManagerEventType.GamepadButtonUp,
          gamepadIndex: gamepadIndex,
          button: i,
        };
        this.emit(event);
      }
    }

    let axesChange = state.axesStatus.map(
      (value, index) => value - (state.axesCache[index] ?? 0),
    );
    for (let i = 0; i < axesChange.length; i++) {
      if (axesChange[i] !== 0) {
        let event: GamepadManagerAxisEvent = {
          type: GamepadManagerEventType.GamepadAxisChanged,
          gamepadIndex: gamepadIndex,
          axis: i,
          currentValue: state.axesStatus[i],
          oldValue: state.axesCache[i],
          change: axesChange[i],
        };
        this.emit(event);
      }
    }
  }
}
