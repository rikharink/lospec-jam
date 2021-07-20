import { EventEmitter } from '../util/event-emitter';
import { InputManager } from './input-manager';

export enum ItemSelectionType {
  SELECTED,
  DESELECTED,
}

export interface SelectionEvent {
  type: ItemSelectionType;
  index: number;
}

export interface SelectableItem {
  selectionIndex: number;
  update: () => void;
  activate?: () => void;
}

export const NO_ITEM_SELECTED = -1;
export class SelectionManager extends EventEmitter<SelectionEvent> {
  private _selectedItem: number = NO_ITEM_SELECTED;
  private _previousItem: number = NO_ITEM_SELECTED;
  private _selectableItems: SelectableItem[] = [];
  public static shared: SelectionManager = new SelectionManager();

  constructor() {
    super();
    InputManager.shared.on(
      ((ev: string) => {
        switch (ev) {
          case 'next-item':
            this.selectNextItem();
            break;
          case 'previous-item':
            this.selectPreviousItem();
            break;
          case 'start':
            this.activateSelectedItem();
        }
      }).bind(this),
    );
  }

  public get selectableItems() {
    return this._selectableItems;
  }

  public set selectableItems(value: SelectableItem[]) {
    this._selectableItems = value;
    this.select(0);
  }

  public addSelectableItem(...items: SelectableItem[]) {
    for (let item of items) {
      this._selectableItems.push(item);
    }
  }

  public get selectedItem() {
    return this._selectedItem;
  }

  private set selectedItem(index: number) {
    this._previousItem = this.selectedItem;
    this._selectedItem = index;
  }

  public selectNextItem() {
    this.selectedItem = (this.selectedItem + 1) % this._selectableItems.length;
    this.processChange();
  }

  public selectPreviousItem() {
    let index = this.selectedItem - 1;
    if (index < 0) {
      index = this._selectableItems.length - 1;
    }
    this.selectedItem = index;
    this.processChange();
  }

  public isSelected(index: number): boolean {
    return (
      this.selectedItem !== NO_ITEM_SELECTED && this.selectedItem === index
    );
  }

  public select(index: number) {
    if (index >= 0 && index < this._selectableItems.length) {
      this.selectedItem = index;
      this.processChange();
    }
  }

  public deselect(index: number) {
    if (this.selectedItem !== index) return;
    this.selectedItem = NO_ITEM_SELECTED;
    let deselectionEvent: SelectionEvent = {
      type: ItemSelectionType.DESELECTED,
      index: index,
    };
    this.emit(deselectionEvent);
    this.selectableItems[this._previousItem]?.update();
  }

  private processChange() {
    if (this._previousItem !== NO_ITEM_SELECTED) {
      let deselectionEvent: SelectionEvent = {
        type: ItemSelectionType.DESELECTED,
        index: this._previousItem,
      };
      this.emit(deselectionEvent);
      this.selectableItems[this._previousItem]?.update();
    }

    let selectionEvent: SelectionEvent = {
      type: ItemSelectionType.SELECTED,
      index: this.selectedItem,
    };
    this.emit(selectionEvent);
    this.selectableItems[this.selectedItem]?.update();
  }

  private activateSelectedItem() {
    this.selectableItems[this.selectedItem]?.activate?.();
  }
}
