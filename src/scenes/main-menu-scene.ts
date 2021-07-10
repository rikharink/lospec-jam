import type { Scene } from './scene';
import { Container } from 'pixi.js';
import { Label } from '../components/label';
import { Palette } from '../palette';
import { Game } from '../game';
import { Menu, MenuItem } from '../components/menu';
import {
  SelectableItem,
  SelectionManager,
} from '../managers/selection-manager';

export function getMainMenuScene(
  menuTitle: string,
  menuItems: MenuItem[],
): Scene {
  const id = 'menu';
  const stage = new Container();
  stage.name = id;
  const backgroundColor = Palette.background;
  const text = new Label(menuTitle, {
    fontSize: 14,
  });

  text.anchor.set(0.5, 0);
  text.position.set(Game.game.size[0] / 2, 15);

  stage.addChild(text);

  let menu = new Menu({ items: menuItems });
  menu.centerInScreen();

  let selectableItems = menu.buttons.map<SelectableItem>((b) => {
    return {
      selectionIndex: b.selectionIndex,
      update: b.redraw.bind(b),
      activate: b.activate.bind(b),
    };
  });
  stage.addChild(menu);
  return { id, stage, backgroundColor, canPause: false, selectableItems };
}
