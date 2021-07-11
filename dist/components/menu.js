import {Button} from "./button.js";
import {ContentView} from "./content-view.js";
import {StackLayout} from "./stack-layout.js";
export class Menu extends ContentView {
  constructor({items = [], selectionIndex = 0}) {
    super({selectionIndex});
    this._selectable = false;
    this._items = items;
    this._buttons = items.map((item, index) => {
      const button = new Button({
        text: item.label,
        selectable: true,
        selectionIndex: selectionIndex + index,
        activation: item.activate.bind(item)
      });
      return button;
    });
    let menu = new StackLayout({});
    menu.setChildren(...this._buttons);
    this.content = menu;
  }
  get items() {
    return this._items;
  }
  get buttons() {
    return this._buttons;
  }
  redraw() {
  }
}
