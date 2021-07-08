import { InteractionEvent } from "pixi.js";
import { InputManager } from "../managers/input-manager";
import { Button } from "./button";
import { ContentView } from "./content-view";
import { StackLayout } from "./stack-layout";

export interface MenuItem {
    label: string;
    activate: () => void;
}

export class Menu extends ContentView {
    private _items: MenuItem[];
    private _selectedItem: number = -1;
    private _buttons: Button[];

    constructor(items: MenuItem[]) {
        super();
        this._items = items;

        this._buttons = items.map((item, index) => {
            const button = new Button({
                text: item.label,
            });
            button.on('mouseover', () => {
                this.selectItem(index);
            });
            button.on('mouseout', () => {
                this.selectItem(-1);
            })
            button.on('pointerup', (ev: InteractionEvent) => {
                if (ev.data.button == 0) {
                    this.activateItem();
                }
            });
            return button;
        });
        let menu = new StackLayout({});
        menu.setChildren(...this._buttons);
        this.content = menu;

        InputManager.shared.on(ev => {
            switch (ev) {
                case 'confirm':
                    this.activateItem();
                    break;
            }
        })
    }

    public activateItem() {
        if (this._selectedItem >= 0 && this._selectedItem < this._items.length)
            this._items[this._selectedItem].activate();
    }

    public selectItem(index: number) {
        this._selectedItem = index;
        this.selectButton(index);
    }

    public selectNextItem() {
        this._selectedItem = (this._selectedItem + 1) % this._items.length;
        this.selectButton(this._selectedItem);
    }

    public selectPreviousItem() {
        this._selectedItem--;
        if (this._selectedItem < 0) {
            this._selectedItem = this._items.length - 1;
        }
        this.selectButton(this._selectedItem);
    }

    private selectButton(index: number) {
        this._buttons.forEach(button => button.active = false);
        if (index >= 0 && index < this._buttons.length)
            this._buttons[index].active = true;
    }
}