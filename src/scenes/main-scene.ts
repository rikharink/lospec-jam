import { timerSystem } from '../ecs/systems';
import type { Scene } from '../interfaces/scene';
import { Container, Ticker } from 'pixi.js';
import { Palette } from '../palette';
import { createWorld } from 'bitecs';

export function getMainScene(): Scene {
  const id = 'main';
  let world = createWorld();
  const stage = new Container();
  const backgroundColor = Palette.background;
  stage.name = id;

  let ticker = new Ticker();
  ticker.add(() => {
    timerSystem(world);
  });

  return {
    id,
    world,
    stage,
    backgroundColor,
    ticker,
    canPause: true,
    selectableItems: [],
  };
}
