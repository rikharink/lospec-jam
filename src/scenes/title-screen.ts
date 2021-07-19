import { Label } from '../ui-components/label';
import type { Scene } from '../interfaces/scene';
import { Palette } from '../palette';
import { PixiTiledMapOrthogonal } from '../loaders/tiled/pixi-tiled-map-orthogonal';
import { AnimatedSprite, Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { Game } from '../game';
import { getMainScene } from './main-scene';
import { Viewport } from '../ui-components/viewport';
import { createWorld } from 'bitecs';

export function getTitleScreen(): Scene {
  let game = Game.shared;
  let world = createWorld();
  let stage = new Viewport();

  let titlemap = new PixiTiledMapOrthogonal('titlescreen');
  stage.addChild(titlemap);
  let [width, height] = game.size;
  let label = new Label('PRESS START');
  label.x = (width - label.width) / 2;
  label.y = (height - label.height) / 2 + 7.5;
  stage.addChild(label);

  let ghostyIdleAnim = game.spritesheet.animations['ghosty-idle'];
  let ghostyIdle = new AnimatedSprite(ghostyIdleAnim, true);
  ghostyIdle.animationSpeed = 0.025;
  ghostyIdle.x = 85;
  ghostyIdle.y = 105;
  ghostyIdle.gotoAndPlay(0);
  stage.addChild(ghostyIdle);
  let ticker = new Ticker();

  game.inputManager.on((ev) => {
    if (ev === 'start') {
      game.sceneManager.currentScene = getMainScene();
    }
  });

  ticker.add(() => {}, UPDATE_PRIORITY.NORMAL);
  return {
    id: 'titlescreen',
    world,
    stage,
    backgroundColor: Palette.background,
    canPause: false,
    selectableItems: [],
    ticker,
  };
}
