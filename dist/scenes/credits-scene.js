import {StackLayout} from "../components/stack-layout.js";
import {ScrollView} from "../components/scroll-view.js";
import {Container, Ticker, UPDATE_PRIORITY} from "../../_snowpack/pkg/pixijs.js";
import {Label} from "../components/label.js";
import {Palette} from "../palette.js";
import {Game} from "../game.js";
class CreditComponent extends StackLayout {
  constructor(title, description, link, options) {
    super(options);
    this._title = title;
    this._description = description;
    this._link = link;
    this.setChildren(title, description);
  }
  activate() {
    if (this._link) {
      window.open(this._link);
    }
  }
  redraw() {
    if (this.isSelected) {
      this._title.tint = Palette.accent;
      this._description.tint = Palette.accent;
    } else {
      this._title.tint = Palette.text;
      this._description.tint = Palette.text;
    }
  }
}
function getCredit(c) {
  let title = new Label(c.title);
  let description = new Label(c.description, {align: "center"});
  const layout = new CreditComponent(title, description, c.link, {
    spacing: 4
  });
  return layout;
}
export function getCreditsScene(credits) {
  const id = "credits";
  const backgroundColor = Palette.background;
  const [width, height] = Game.game.size;
  const stage = new Container();
  stage.name = id;
  const text = new Label("CREDITS");
  text.position.set(width / 2, 20);
  stage.addChild(text);
  const layout = new StackLayout({spacing: 12});
  let creditItems = credits.map(getCredit);
  layout.setChildren(...creditItems);
  layout.position.set(width / 2, 38);
  const scroll = new ScrollView(0, layout.y, width, height);
  scroll.content = layout;
  stage.addChild(scroll);
  let ticker = new Ticker();
  setTimeout((() => ticker.add(((delta) => {
    scroll.scroll(-1 / delta / 16);
    let bounds = scroll.content.getBounds();
    if (bounds.y < -bounds.height) {
      scroll.scroll(height + bounds.height);
    }
  }).bind(this), UPDATE_PRIORITY.LOW)).bind(this), 1e3);
  let selectableItems = creditItems.map((c, i) => {
    c.selectionIndex = i;
    return {
      selectionIndex: i,
      update: c.redraw.bind(c),
      activate: c.activate.bind(c)
    };
  });
  return {
    id,
    stage,
    backgroundColor,
    ticker,
    canPause: false,
    reset: () => scroll.reset(),
    selectableItems
  };
}
