import { Container, DisplayObject, MaskData, Renderer } from "pixi.js";
import { Game } from "../game";
import { Size } from "../types";
import { calculateCenter, getSize } from "../util";

export class ContentView extends Container {
    protected _selectable: boolean;
    protected _selectionIndex: number;

    public get content() {
        return super.getChildAt(0);
    }

    public set content(content: DisplayObject) {
        super.removeChildren();
        super.addChildAt(content, 0);
    }

    public addChild<T extends DisplayObject[]>(..._children: T): T[0] {
        throw Error("ContentView uses the content property");
    }

    public addChildAt<T extends DisplayObject>(_child: T, _index: number): T {
        throw Error("ContentView uses the content property");
    }

    public removeChild<T extends DisplayObject[]>(..._children: T): T[0] {
        throw Error("ContentView uses the content property");
    }

    public removeChildAt<T extends DisplayObject>(_index: number): T {
        throw Error("ContentView uses the content property");
    }

    public removeChildren(_beginIndex?: number, _endIndex?: number): DisplayObject[] {
        throw Error("ContentView uses the content property");
    }

    public centerInParent() {
        let parentSize: Size = [this.parent.width, this.parent.height];
        let [x, y] = calculateCenter(parentSize, getSize(this.content));
        this.position.set(x, y);
    }

    public centerInScreen() {
        let [x, y] = calculateCenter(Game.game.size, getSize(this.content));
        this.position.set(x, y);
    }

}