import { ScrollView } from './../components/scroll-view';
import { StackLayout } from '../components/stack-layout';
import { Container, InteractionEvent, Ticker } from 'pixi.js';
import { Label } from '../components/label';
import { Palette } from '../palette';
import type { Scene } from './scene';
import { Game } from '../game';
import { getBackButton } from '../components/button';

interface Credit {
  title: string;
  description: string;
  link?: string;
}

function getCredit(c: Credit): Container[] {
  const layout = new StackLayout({
    spacing: 4,
  });
  let title = new Label(c.title);
  title.anchor.set(0.5, 0);
  let description = new Label(c.description, { align: 'center' });
  description.anchor.set(0.5, 0);
  layout.setChildren(title, description);

  let setActive = () => {
    title.tint = Palette.foreground;
    description.tint = Palette.foreground;
  };

  let setInactive = () => {
    title.tint = Palette.text;
    description.tint = Palette.text;
  };

  layout.interactive = true;
  layout.on('mouseover', setActive);
  layout.on('mouseout', setInactive);
  layout.on('pointerdown', setActive);
  layout.on('pointerup', setInactive);
  layout.on('pointerup', (ev: InteractionEvent) => {
    if (ev.data.button == 0 && c.link) {
      window.open(c.link);
    }
  });
  return [layout];
}

export function getCreditsScene(credits: Credit[]): Scene {
  const id = 'credits';
  const backgroundColor = Palette.background;
  const [width, height] = Game.game.size;
  const stage = new Container();
  stage.name = id;
  const text = new Label('CREDITS');
  text.anchor.set(0.5, 0);
  text.position.set(width / 2, 20);
  stage.addChild(text);

  const layout = new StackLayout({ spacing: 42 });
  layout.setChildren(...credits.flatMap(getCredit));
  layout.position.set(width / 2, 75);
  const scroll = new ScrollView(0, layout.y, width, height);
  scroll.content = layout;
  stage.addChild(scroll);
  stage.addChild(getBackButton());

  let ticker = new Ticker();
  let time = 0;
  setTimeout(
    (() =>
      ticker.add(
        ((delta: number) => {
          time += delta;
          if (time > 1) {
            time = 0;
            scroll.scroll(-1);
            let bounds = scroll.content.getBounds();
            if (bounds.y < -bounds.height) {
              scroll.scroll(height + bounds.height);
            }
          }
        }).bind(this),
      )).bind(this),
    1000,
  );

  return {
    id,
    stage,
    backgroundColor,
    ticker,
    canPause: false,
    reset: () => scroll.reset(),
  };
}
