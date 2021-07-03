import { StackLayout } from './../components/stack-layout';
import { SceneManager } from '../managers/scene-manager';
import { Button } from './../components/button';
import type { Scene } from './scene';
import { Container, InteractionEvent } from 'pixi.js';
import { Label } from '../components/label';
import { Palette } from '../palette';
import { Game } from '../game';

interface MenuItem {
  label: string;
  scene: () => Scene;
}

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

  const buttons = menuItems.map((item, index) => {
    const button = new Button({
      text: item.label,
    });
    button.on('pointerup', (ev: InteractionEvent) => {
      if (ev.data.button == 0) {
        SceneManager.shared.currentScene = item.scene();
      }
    });

    return button;
  });

  const menu = new StackLayout({});
  menu.setChildren(...buttons);
  menu.centerInScreen();
  stage.addChild(menu);
  return { id, stage, backgroundColor, canPause: false };
}
