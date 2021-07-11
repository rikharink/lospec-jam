import { SelectionManager } from './selection-manager';
import { Modal, ModalManager } from './modal-manager';
import { InputManager } from './input-manager';
import { Container, Ticker } from 'pixi.js';
import type { Milliseconds, CameraTransition } from '../types';
import { Camera } from 'pixi-game-camera';
import type { Game } from '../game';
import type { Scene } from '../scenes/scene';
import { Dialog } from '../components/dialog';

export class SceneManager {
  private _game?: Game;
  private _root: Container = new Container();
  private _sceneStack = new Array<Scene>();
  private _camera: Camera;
  private _transition?: CameraTransition;
  private _transitionDuration: Milliseconds = 200;
  private static _sceneManager = new SceneManager();
  private _paused: boolean = false;
  private _pauseScreen?: Modal;
  private _modalManager: ModalManager = ModalManager.shared;

  constructor() {
    this._camera = new Camera({
      ticker: Ticker.shared,
    });
    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    InputManager.shared.on(
      ((ev: string) => {
        switch (ev) {
          case 'start':
            this.togglePause();
            break;
          case 'back':
            this.back();
            break;
        }
      }).bind(this),
    );
  }

  public static get shared(): SceneManager {
    return this._sceneManager;
  }

  public get game() {
    if (!this._game) {
      throw Error('No game set on scene manager');
    }
    return this._game;
  }

  public set game(value: Game) {
    this._game = value;
  }

  public get stage() {
    return this._root;
  }

  public get currentScene() {
    return this._sceneStack[0];
  }

  public togglePause() {
    if (!this.currentScene.canPause) return;
    this._paused = !this._paused;
    this._paused ? this.pause() : this.resume();
  }

  public pause() {
    if (!this.currentScene.canPause) return;
    this._paused = true;
    this.currentScene?.ticker?.stop();
    if (!this._pauseScreen) {
      this._pauseScreen = new Dialog({
        title: 'PAUSED',
        ok: this.mainMenu.bind(this),
        okLabel: 'HOME',
        cancel: this.resume.bind(this),
        cancelLabel: 'RESUME',
      });
    }
    this._modalManager.show(this._pauseScreen);
  }

  private mainMenu() {
    this.resume();
    this.currentScene = this.game.mainMenu;
  }

  public resume() {
    if (!this.currentScene.canPause) return;
    this._paused = false;
    this.currentScene?.ticker?.start();
    this._modalManager.hide();
  }

  public set currentScene(scene: Scene) {
    if (scene.id == this.currentScene?.id) return;
    let duration = this._transition ? this._transitionDuration : 0;
    setTimeout(() => this.setScene.bind(this)(scene), duration);
  }

  public back() {
    if (this._sceneStack.length > 1) {
      let current = this._sceneStack.shift();
      current?.ticker?.stop();
      current.selectedItem = SelectionManager.shared.selectedItem;
      let selection = this._sceneStack[0].selectedItem;
      this.setScene(this._sceneStack[0]);
      SelectionManager.shared.select(selection ?? 0);
    }
  }

  private setScene(scene: Scene) {
    if (this._sceneStack[0]) {
      this._sceneStack[0].ticker?.stop();
      console.log('set scene selection', SelectionManager.shared.selectedItem);
      this._sceneStack[0].selectedItem = SelectionManager.shared.selectedItem;
    }
    this._sceneStack.unshift(scene);
    if (this._root.children.length > 0) this._root.removeChildAt(0);
    this._root.addChild(scene.stage);
    if (this._game) {
      this._game.renderer.backgroundColor = scene.backgroundColor;
    }
    this.game.audioManager.playTrack(scene.track);
    scene.ticker?.start();
    scene.reset?.();

    SelectionManager.shared.select(scene.selectedItem ?? 0);
    SelectionManager.shared.selectableItems = scene.selectableItems;
  }

  public get transitionDuration(): Milliseconds {
    return this._transitionDuration;
  }

  public set transitionDuration(duration: Milliseconds) {
    this._transitionDuration = duration;
  }
}
