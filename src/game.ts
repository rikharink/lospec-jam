import {
  Application,
  IApplicationOptions,
  Loader,
  Resource,
  Spritesheet,
  UPDATE_PRIORITY
} from 'pixi.js';
import { setupController } from './controller';
import { TiaSound } from './loaders/tiatracker/tia-sound';
import { PixiTiledMapOrthogonal } from './loaders/tiled/pixi-tiled-map-orthogonal';
import { AudioManager } from './managers/audio-manager';
import { InputManager } from './managers/input-manager';
import { SceneManager } from './managers/scene-manager';
import { Scene } from './scenes/scene';
import { getTitleScreen } from './scenes/title-screen';
import type { Size } from './types';

interface GameOptions extends IApplicationOptions { }

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

  public progress(loader: Loader, _resource: Resource): void {
    console.info(`LOADING PROGRESS ${loader.progress}%`);
  }

  private loadAssets(): Promise<void> {
    this.loader.onProgress.add(this.progress.bind(this));
    return new Promise((resolve) => {
      this.loader
        .use(PixiTiledMapOrthogonal.middleware)
        .use(TiaSound.middleware)
        .add('art/tilesheet.png')
        .add(Game.spritesheetFile)
        .add('titlescreen', 'maps/title-screen.tiled.json')
        .add('Legend Q', 'assets/fonts/legendq.fnt')
        .add('audio/glafouk - Miniblast.ttt')
        .add('audio/fff.ttt')
        .load(() => resolve());
    });
  }

  private async setupAudio(): Promise<void> {
    let s = new TiaSound();
    s.loadSong('audio/fff.ttt');
    s.play();
  }

  public static async init(options?: GameOptions): Promise<Game> {
    let game = new Game(options);
    Game._game = game;
    await game.loadAssets();
    await game.setupAudio();
    game.spritesheet = game.loader.resources[Game.spritesheetFile].spritesheet;
    game.sceneManager.game = game;
    game.titlescreen = getTitleScreen();
    game.sceneManager.currentScene = game.titlescreen;
    game.stage.addChild(game.sceneManager.stage);
    setupController();
    game.ticker.add(() => {
      game.render();
    }, UPDATE_PRIORITY.LOW);
    game.addToPage();
    game.inputManager.gamepadManager.start();
    return game;
  }

  public addToPage() {
    super.view.id = 'debug';
    const game = document.getElementById('game');
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
