import type { Scene } from './scene';
import { Container, Ticker } from 'pixi.js';
import { Palette } from '../palette';

export function getMainScene(): Scene {
  const id = 'main';
  const stage = new Container();
  const backgroundColor = Palette.background;
  stage.name = id;

  let ticker = new Ticker();
  ticker.add(() => {});

  return {
    id,
    stage,
    backgroundColor,
    ticker,
    canPause: true,
    selectableItems: [],
  };
}
