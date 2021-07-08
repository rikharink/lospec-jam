import { Application, IApplicationOptions, UPDATE_PRIORITY } from 'pixi.js';
import { getCreditsScene } from './scenes/credits-scene';
import { getMainMenuScene } from './scenes/main-menu-scene';
import { getMainScene } from './scenes/main-scene';
import { Scene } from './scenes/scene';
import { SceneManager } from './managers/scene-manager';
import { getSettingsScene } from './scenes/settings-scene';
import { AudioManager } from './managers/audio-manager';
import type { Size } from './types';
import { InputManager } from './managers/input-manager';
import { InputDevice } from './interfaces/game-input';
import { GamepadManagerButtonEvent, GamepadManagerEvent, GamepadManagerEventType } from './managers/gamepad-manager';

export class Game extends Application {
  private static _game?: Game;
  public mainMenu: Scene;

  private constructor(options?: IApplicationOptions) {
    super(options);
  }

  public static get game(): Game {
    if (!this._game) throw Error('Call init before accessing game');
    return this._game;
  }

  public get size(): Size {
    return [this.renderer.width, this.renderer.height];
  }

  private loadAssets(): Promise<void> {
    return new Promise((resolve) => {
      this.loader
        .add('Press Start 2P', '/assets/fonts/pressstart.fnt')
        .load(() => resolve());
    });
  }

  public static async init(options?: IApplicationOptions): Promise<Game> {
    let game = new Game(options);
    Game._game = game;
    await game.loadAssets();
    game.sceneManager.game = game;
    game.mainMenu = getMainMenuScene('LOSPEC JAM\nCOME ON AND SLAM', [
      { label: 'START', activate: () => SceneManager.shared.currentScene = getMainScene() },
      { label: 'SETTINGS', activate: () => SceneManager.shared.currentScene = getSettingsScene() },
      {
        label: 'CREDITS',
        activate: () =>
          SceneManager.shared.currentScene =
          getCreditsScene([
            {
              title: 'CODE ART MUSIC',
              description: 'rik harink',
              link: 'https://github.com/rikharink',
            },
            {
              title: 'WEBGL RENDERER',
              description: 'pixi.js',
              link: 'https://www.pixijs.com/',
            },
            {
              title: 'MUSIC LIBRARY',
              description: 'tone.js',
              link: 'https://tonejs.github.io/',
            },
            {
              title: 'FONT',
              description: 'press start 2p',
              link: 'https://fonts.google.com/specimen/Press+Start+2P',
            },
          ]),
      },
    ]);
    game.sceneManager.currentScene = game.mainMenu;
    game.stage.addChild(game.sceneManager.stage);
    game.setupDefaultInputEvents();
    game.ticker.add(() => {
      game.render();
    }, UPDATE_PRIORITY.LOW);
    game.addToPage();
    game.inputManager.gamepadManager.start();
    return game;
  }

  private setupDefaultInputEvents() {
    this.inputManager.addEvents({
      action: 'menu',
      inputs: [
        {
          type: InputDevice.Keyboard,
          eventType: 'keyup',
          key: 'Escape',
        },
        {
          type: InputDevice.Gamepad,
          eventType: GamepadManagerEventType.GamepadButtonUp,
          predicate: (ev: GamepadManagerEvent) => {
            let e = ev as GamepadManagerButtonEvent;
            if (!e || e.type != GamepadManagerEventType.GamepadButtonUp)
              return false;
            return e.button === 9;
          }
        }
      ],
    },
      {
        action: 'confirm',
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
              if (!e || e.type != GamepadManagerEventType.GamepadButtonUp)
                return false;
              return e.button === 0;
            }
          }
        ],
      },
      {
        action: 'cancel',
        inputs: [
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              if (!e || e.type != GamepadManagerEventType.GamepadButtonUp)
                return false;
              return e.button === 1;
            }
          }
        ],
      },
      {
        action: 'next-item',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'Tab',
            predicate: (ev: KeyboardEvent) => !ev.shiftKey
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              if (!e || e.type != GamepadManagerEventType.GamepadButtonUp)
                return false;
              return e.button === 13;
            }
          }
        ]
      },
      {
        action: 'previous-item',
        inputs: [
          {
            type: InputDevice.Keyboard,
            eventType: 'keydown',
            key: 'Tab',
            predicate: (ev: KeyboardEvent) => ev.shiftKey
          },
          {
            type: InputDevice.Gamepad,
            eventType: GamepadManagerEventType.GamepadButtonUp,
            predicate: (ev: GamepadManagerEvent) => {
              let e = ev as GamepadManagerButtonEvent;
              if (!e || e.type != GamepadManagerEventType.GamepadButtonUp)
                return false;
              return e.button === 12;
            }
          }
        ]
      }
    );
  }

  public addToPage() {
    document.body.appendChild(super.view);
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
