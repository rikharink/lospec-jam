import { Game } from "../game";
import { Button } from "./button";
import { ContentView } from "./content-view";
import { StackLayout } from "./stack-layout";

export interface MenuItem {
    label: string;
    activate: () => void;
}

interface MenuOptions {
    items: MenuItem[]
    selectionIndex: number;
}

export class Menu extends ContentView {
    private _items: MenuItem[];
    private _buttons: Button[];

    constructor({ items = [], selectionIndex = 0 }: Partial<MenuOptions>) {
        super({ selectionIndex });
        this._selectable = false;
        this._items = items;
        this._buttons = items.map((item, index) => {
            const button = new Button({
                text: item.label,
                selectable: true,
                selectionIndex: selectionIndex + index,
                activation: () => item.activate()
            });
            return button;
        });
        let menu = new StackLayout({});
        menu.setChildren(...this._buttons);
        this.content = menu;
    }

    public get items() {
        return this._items;
    }

    public get buttons() {
        return this._buttons;
    }

    redraw() { }
}