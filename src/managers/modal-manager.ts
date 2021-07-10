import { ContentView } from "../components/content-view";
import { uuidv4 } from "../util";
import { NO_ITEM_SELECTED, SelectableItem, SelectionManager } from "./selection-manager";

export class Modal extends ContentView {
    public readonly id = uuidv4();
    private _previousSelection: number = NO_ITEM_SELECTED;
    private _previousSelectableItems: SelectableItem[] = [];
    private _selectableItems: SelectableItem[] = [];
    private _visible: boolean = false;

    constructor() {
        super({});
    }

    public get selectableItems(): SelectableItem[] {
        return this._selectableItems;
    }

    public set selectableItems(value: SelectableItem[]) {
        this._selectableItems = value;
    }

    public show() {
        this._previousSelection = SelectionManager.shared.selectedItem;
        this._previousSelectableItems = [...SelectionManager.shared.selectableItems];
        SelectionManager.shared.selectableItems = this._selectableItems;
        SelectionManager.shared.select(this._selectableItems[0]?.selectionIndex ?? NO_ITEM_SELECTED);
        this._visible = true;
    }

    public hide() {
        SelectionManager.shared.selectableItems = [...this._previousSelectableItems];
        SelectionManager.shared.select(this._previousSelection);
        this._previousSelectableItems = [];
        this._previousSelection = NO_ITEM_SELECTED;
        this._visible = false;
    }

    public get modalVisible() {
        return this._visible;
    }

    public redraw() { }
}

export class ModalManager {
    private _modals: Modal[] = [];
    public static shared: ModalManager = new ModalManager();

    public show(modal: Modal) {
        let found = this._modals.findIndex(m => m.id === modal.id);
        if (found === -1) {
            this._modals.unshift(modal);
        } else {
            let item = this._modals.splice(found, 1)[0];
            this._modals.unshift(item);
        }
        this._modals[0].show();
    }

    public hide() {
        let current = this._modals.shift();
        current?.hide();
    }

    public get modalVisible() {
        return this._modals?.length > 0;
    }
}