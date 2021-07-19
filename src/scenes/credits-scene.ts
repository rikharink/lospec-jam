import { Position } from './../types';
import { StackLayout, StackLayoutOptions } from '../ui-components/stack-layout';
import { ScrollView } from '../ui-components/scroll-view';
import { Container, Ticker, UPDATE_PRIORITY } from 'pixi.js';
import { Label } from '../ui-components/label';
import { Palette } from '../palette';
import type { Scene } from '../interfaces/scene';
import { Game } from '../game';
import { createWorld, addEntity, addComponent } from 'bitecs';
import {
  Position as PositionComponent,
  Velocity,
  IsPlayerCharacter,
} from '../ecs/components';

interface Credit {
  title: string;
  description: string;
  link?: string;
}

class CreditComponent extends StackLayout {
  private _title: Label;
  private _description: Label;
  private _link?: string;

  constructor(
    title: Label,
    description: Label,
    link: string | undefined,
    options: Partial<StackLayoutOptions>,
  ) {
    super(options);
    this._title = title;
    this._description = description;
    this._link = link;
    this.setChildren(title, description);
  }
  public activate() {
    if (this._link) {
      window.open(this._link);
    }
  }

  public redraw() {
    if (this.isSelected) {
      this._title.tint = Palette.accent;
      this._description.tint = Palette.accent;
    } else {
      this._title.tint = Palette.text;
      this._description.tint = Palette.text;
    }
  }
}

function getCredit(c: Credit): CreditComponent {
  let title = new Label(c.title);
  let description = new Label(c.description, { align: 'center' });
  const layout = new CreditComponent(title, description, c.link, {
    spacing: 4,
  });
  return layout;
}

export function getCreditsScene(credits: Credit[]): Scene {
  const id = 'credits';
  const world = createWorld();
  const player = addEntity(world);

  addComponent(world, PositionComponent, player);
  addComponent(world, Velocity, player);
  addComponent(world, IsPlayerCharacter, player);

  const backgroundColor = Palette.background;
  const [width, height] = Game.game.size;
  const stage = new Container();
  stage.name = id;
  const text = new Label('CREDITS');
  text.position.set(width / 2, 20);
  stage.addChild(text);

  const layout = new StackLayout({ spacing: 12 });
  let creditItems = credits.map(getCredit);
  layout.setChildren(...creditItems);
  layout.position.set(width / 2, 38);
  const scroll = new ScrollView(0, layout.y, width, height);
  scroll.content = layout;
  stage.addChild(scroll);

  let ticker = new Ticker();
  setTimeout(
    (() =>
      ticker.add(
        ((delta: number) => {
          scroll.scroll(-1 / delta / 16);
          let bounds = scroll.content.getBounds();
          if (bounds.y < -bounds.height) {
            scroll.scroll(height + bounds.height);
          }
        }).bind(this),
        UPDATE_PRIORITY.LOW,
      )).bind(this),
    1000,
  );

  let selectableItems = creditItems.map((c, i) => {
    c.selectionIndex = i;
    return {
      selectionIndex: i,
      update: c.redraw.bind(c),
      activate: c.activate.bind(c),
    };
  });

  return {
    id,
    world,
    stage,
    backgroundColor,
    ticker,
    canPause: false,
    reset: () => scroll.reset(),
    selectableItems,
  };
}
