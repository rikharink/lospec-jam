import { Container, DisplayObject } from "pixi.js";
import { Game } from "../game";
import { SelectionManager } from "../managers/selection-manager";
import { Size } from "../types";
import { calculateCenter, getSize } from "../util";

export interface ContentViewOptions {
    selectable: boolean;
    selectionIndex: number;
    activation: () => void | undefined;
}

export abstract class ContentView extends Container {
    protected _selectable: boolean;
    protected _selectionIndex: number;
    protected _activation: () => void | undefined;

    constructor({ selectable = false, selectionIndex = -1, activation = undefined }: Partial<ContentViewOptions>) {
        super();
        this._selectable = selectable;
        this._selectionIndex = selectionIndex;
        this._activation = activation;
        this.subscribeIfSelectable();
    }

    private subscribeIfSelectable() {
        if (this._selectable) {
            this.interactive = true;
            this.on('mouseover', this.notifyItemSelected.bind(this));
            this.on('mouseout', this.notifyItemDeselected.bind(this));
        } else {
            this.off('mouseover', this.notifyItemSelected.bind(this));
            this.off('mouseout', this.notifyItemDeselected.bind(this));
        }
    }

    private notifyItemSelected() {
        this.select();
    }

    private notifyItemDeselected() {
        this.deselect();
    }

    public abstract redraw(): void;

    public get selectable() {
        return this._selectable;
    }

    public set selectable(value: boolean) {
        this._selectable = value;
        this.subscribeIfSelectable();
    }

    public get selectionIndex() {
        return this._selectionIndex;
    }

    public set selectionIndex(index: number) {
        this._selectionIndex = index;
    }

    public get isSelected() {
        return this.selectable && SelectionManager.shared.isSelected(this._selectionIndex);
    }

    public select() {
        if (this.selectable && !SelectionManager.shared.isSelected(this._selectionIndex)) {
            SelectionManager.shared.select(this._selectionIndex);
        }
    }

    public deselect() {
        if (this.isSelected) {
            SelectionManager.shared.deselect(this._selectionIndex);
        }
    }

    public activate() {
        this._activation?.();
    }

    public set activation(func: () => void) {
        this._activation = func;
    }

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