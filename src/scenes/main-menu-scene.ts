import type { Scene } from './scene';
import { Container } from 'pixi.js';
import { Label } from '../components/label';
import { Palette } from '../palette';
import { Game } from '../game';
import { Menu, MenuItem } from '../components/menu';

export function getMainMenuScene(
  menuTitle: string,
  menuItems: MenuItem[],
): Scene {
  const id = 'menu';
  const stage = new Container();
  stage.name = id;
  const backgroundColor = Palette.background;
  const text = new Label(menuTitle);

  text.anchor.set(0.5, 0);
  text.position.set(Game.game.size[0] / 2, 20);

  stage.addChild(text);

  let menu = new Menu(menuItems);
  menu.centerInScreen();
  stage.addChild(menu);
  return { id, stage, backgroundColor, canPause: false, selectNext: () => menu.selectNextItem(), selectPrevious: () => menu.selectPreviousItem() };
}
