import {Container} from "../../_snowpack/pkg/pixijs.js";
import {getMask, uuidv4} from "../util.js";
import {ContentView} from "./content-view.js";
export class RectLayout extends ContentView {
  constructor(x, y, width, height) {
    super();
    this._id = uuidv4();
    this._minX = x;
    this._minY = y;
    this._maxX = this._minX + width;
    this._maxY = this._minY + height;
    this.content = new Container();
    this.content.mask = this.mask;
  }
  get id() {
    return this._id;
  }
  get minX() {
    return this._minX;
  }
  get minY() {
    return this._minY;
  }
  get maxX() {
    return this._maxX;
  }
  get maxY() {
    return this._maxY;
  }
  cutLeft(size) {
    let minX = this.minX;
    this._minX = Math.min(this.maxX, this.minX + size);
    this.content.mask = this.mask;
    return new RectLayout(minX, this.minY, this.minX, this.maxY);
  }
  cutRight(size) {
    let maxX = this.maxX;
    this._maxX = Math.max(this.minX, this.maxX - size);
    this.content.mask = this.mask;
    return new RectLayout(this.maxX, this.minY, maxX, this.maxY);
  }
  cutTop(size) {
    let minY = this.minY;
    this._minY = Math.min(this.maxY, this.minY + size);
    this.content.mask = this.mask;
    return new RectLayout(this.minX, minY, this.maxX, this.minY);
  }
  cutBottom(size) {
    let maxY = this.maxY;
    this._maxY = Math.max(this.minY, this.maxY - size);
    this.content.mask = this.mask;
    return new RectLayout(this.minX, this.maxY, this.maxX, maxY);
  }
  get mask() {
    return getMask(this.minX, this.minY, this.maxX - this.minX, this.maxY - this.minY);
  }
}
