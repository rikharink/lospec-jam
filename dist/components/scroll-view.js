import {getMask} from "../util.js";
import {ContentView} from "./content-view.js";
export class ScrollView extends ContentView {
  constructor(x, y, width, height) {
    super({});
    this.mask = getMask(x, y, width, height);
  }
  scroll(offset) {
    this.content.position.set(this.content.position.x, this.content.position.y + offset);
  }
  reset() {
    this.content.position.set(this._startX, this._startY);
  }
  get content() {
    return super.content;
  }
  set content(value) {
    super.content = value;
    this._startX = value.position.x;
    this._startY = value.position.y;
  }
  setMask(x, y, width, height) {
    this.mask = getMask(x, y, width, height);
  }
  redraw() {
  }
}
