import { Container, DisplayObject, MaskData, Renderer } from "pixi.js";

export class ContentView extends Container {

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

}