import {uuidv4} from "../util.js";
export function getRect(object) {
  let bound = object.getBounds();
  return new Rect(bound.x, bound.y, bound.width, bound.height);
}
export class Rect {
  constructor(_minX, _minY, _maxX, _maxY) {
    this._minX = _minX;
    this._minY = _minY;
    this._maxX = _maxX;
    this._maxY = _maxY;
    this._id = uuidv4();
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
}
