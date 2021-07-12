import { PixiTiledMapOrthogonal } from './middleware/tiled/pixi-tiled-map-orthogonal';
import {
  Application,
  IApplicationOptions,
  Spritesheet,
  UPDATE_PRIORITY,
} from 'pixi.js';
import { getTitleScreen } from './scenes/title-screen';
import { Scene } from './scenes/scene';
import { SceneManager } from './managers/scene-manager';
import { AudioManager } from './managers/audio-manager';
import type { Size } from './types';
import { InputManager } from './managers/input-manager';
import { InputDevice } from './interfaces/game-input';
import {
  GamepadManagerButtonEvent,
  GamepadManagerEvent,
  GamepadManagerEventType,
} from './managers/gamepad-manager';

interface GameOptions extends IApplicationOptions {
}

export class Game extends Application {
  private static _game?: Game;
  public titlescreen: Scene;
  public spritesheet: Spritesheet;
  public static spritesheetFile = 'art/legendq.json';

  private constructor(options?: GameOptions) {
    super(options);
  }

  public static get game(): Game {
    if (!this._game) throw Error('Call init before accessing game');
    return this._game;
  }

  public get size(): Size {
    return [
      this.renderer.width / this.renderer.resolution,
      this.renderer.height / this.renderer.resolution,
    ];
  }

  private loadAssets(): Promise<void> {
    return new Promise((resolve) => {
      this.loader
        .add('art/tilesheet.png')
        .add(Game.spritesheetFile)
        .add('titlescreen', 'maps/title-screen.tiled.json')
        .use(PixiTiledMapOrthogonal.middleware)
        .add('Legend Q', 'assets/fonts/legendq.fnt')
        .load(() => resolve());
    });
  }

  public static async init(options?: GameOptions): Promise<Game> {
    let game = new Game(options);
    Game._game = game;
    await game.loadAssets();
    game.spritesheet = game.loader.resources[Game.spritesheetFile].spritesheet;
    game.sceneManager.game = game;
    game.titlescreen = getTitleScreen();
    game.sceneManager.currentScene = game.titlescreen;
    game.stage.addChild(game.sceneManager.stage);
    game.setupController();
    game.ticker.add(() => {
      game.render();
    }, UPDATE_PRIORITY.LOW);
    game.addToPage();
    game.inputManager.gamepadManager.start();
    return game;
  }

  private setupController() {
    this.inputManager.addEvents(
      {
        action: 'up-pressed',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'ArrowUp',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonDown,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 12;
            },
          },
        ],
      },
      {
        action: 'down-pressed',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'ArrowDown',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonDown,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 13;
            },
          },
        ],
      },
      {
        action: 'left-pressed',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'ArrowLeft',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonDown,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 14;
            },
          },
        ],
      },
      {
        action: 'right-pressed',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'ArrowRight',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonDown,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 15;
            },
          },
        ],
      },
      {
        action: 'a-pressed',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'Space',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonDown,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 0;
            },
          },
        ],
      },
      {
        action: 'b-pressed',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'Backspace',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonDown,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 1;
            },
          },
        ],
      },
      {
        action: 'up-released',
        aliases: ['previous-item'],
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keyup',
            key: 'ArrowUp',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 12;
            },
          },
        ],
      },
      {
        action: 'down-released',
        aliases: ['next-item'],
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keyup',
            key: 'ArrowDown',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 13;
            },
          },
        ],
      },
      {
        action: 'left-released',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keyup',
            key: 'ArrowLeft',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 14;
            },
          },
        ],
      },
      {
        action: 'right-released',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keyup',
            key: 'ArrowRight',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 15;
            },
          },
        ],
      },
      {
        action: 'a-released',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'z',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 0;
            },
          },
        ],
      },
      {
        action: 'b-released',
        aliases: ['back'],
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'x',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 1;
            },
          },
        ],
      },
      {
        action: 'start',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keyup',
            key: 'Enter',
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              return e?.button === 9;
            },
          },
        ],
      },
    );
  }

  public addToPage() {
    super.view.id = 'debug';
    const game = document.getElementById("game");
    game.append(super.view);
  }

  public get sceneManager(): SceneManager {
    return SceneManager.shared;
  }

  public get audioManager(): AudioManager {
    return AudioManager.shared;
  }

  public get inputManager(): InputManager {
    return InputManager.shared;
  }
}
