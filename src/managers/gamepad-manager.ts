import { Ticker } from 'pixi.js';
import { EventEmitter } from '../event-emitter';
import { Disposable } from '../interfaces/disposable';
import { GamepadButtonType, GamepadAxisType, GamepadEventType } from '../types';

export interface GamepadManagerEvent {
  type: GamepadEventType;
  gamepad: Gamepad;
}

export interface GamepadManagerButtonEvent extends GamepadManagerEvent {
  type: GamepadButtonType;
}

export interface GamepadManagerAxisEvent extends GamepadManagerEvent {
  type: GamepadAxisType;
  axis: number;
  value: number;
}

interface GamepadState {
  axesStatus: number[];
  buttons: GamepadButton[];
  buttonsStatus: GamepadButton[];
  axesCache: number[];
  buttonsCache: GamepadButton[];
  gamepad: Gamepad;
}

export class GamepadManager
  extends EventEmitter<GamepadManagerEvent>
  implements Disposable
{
  private static _shared: GamepadManager = new GamepadManager();
  private _ticker: Ticker = new Ticker();
  private _gamepads = new Map<number, GamepadState>();
  private _deadzoneTreshold: number;

  constructor() {
    super();
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
    this._ticker.start();
    this._ticker.add(this.updateLoop.bind(this));
    window.addEventListener('gamepadconnected', this.connect.bind(this));
    window.addEventListener('gamepaddisconnected', this.disconnect.bind(this));
    for (let gp of navigator.getGamepads()) {
      this.connectGamepad(gp);
    }
  }

  public stop() {
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
  }

  public dispose() {
    this.stop();
  }

  private getState(gamepad: Gamepad): GamepadState {
    return {
      gamepad: gamepad,
      buttons: [],
      buttonsCache: [],
      axesCache: [],
      axesStatus: [],
      buttonsStatus: [],
    };
  }

  private connect(ev: GamepadEvent) {
    this.connectGamepad(ev.gamepad);
  }

  private disconnect(ev: GamepadEvent) {
    this.disconnectGamepad(ev.gamepad);
  }

  private connectGamepad(gamepad: Gamepad) {
    this._gamepads.set(gamepad.index, this.getState(gamepad));
  }

  private disconnectGamepad(gamepad: Gamepad) {
    if (this._gamepads.has(gamepad.index)) {
      this._gamepads.delete(gamepad.index);
    }
  }

  private updateLoop() {
    if (this._gamepads.size === 0) return;
    for (let state of this._gamepads.values()) {
      this.updateGamepadState(state);
      this.emitEvents(state);
    }
  }

  private updateGamepadState(state: GamepadState) {
    // get the gamepad object
    const gamepad = state.gamepad;

    // clear the caches
    state.buttonsCache = [];
    state.axesCache = [];

    // move the status from the previous frame to the caches
    for (let k = 0; k < state.buttonsStatus.length; k++) {
      state.buttonsCache[k] = state.buttonsStatus[k];
    }

    for (let k = 0; k < state.axesStatus.length; k++) {
      state.axesCache[k] = state.axesStatus[k];
    }

    // clear the buttons status
    state.buttonsStatus = [];

    // loop through buttons and push the pressed ones to the array
    const pressed = [];
    if (gamepad.buttons) {
      for (let b = 0, t = gamepad.buttons.length; b < t; b++) {
        if (gamepad.buttons[b].pressed) {
          pressed.push(state.buttons[b]);
        }
      }
    }
    state.buttonsStatus = pressed;

    // clear the axes status
    state.axesStatus = [];

    // loop through axes and push their values to the array
    const axes: number[] = [];
    if (gamepad.axes) {
      for (let a = 0, x = gamepad.axes.length; a < x; a++) {
        axes.push(gamepad.axes[a]);
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

  private emitEvents(state: GamepadState) {
    console.debug(state);
    //TODO: emit relevant events if buttons/axes change
  }
}
