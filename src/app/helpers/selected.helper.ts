import { EventEmitter } from '@angular/core';
import { Injectable } from '@morgan-stanley/needle';

@Injectable()
export class SelectedItemHelperFactory {
    public create<T>(
        selectedText: ItemSelectedButtonTextFunction<T>,
        nonSelectedText: NoSelectionButtonTextFunction<T>
    ): SelectedItemHelper<T> {
        return new SelectedItemHelper<T>(selectedText, nonSelectedText);
    }
}

type ItemSelectedButtonTextFunction<T> = (item: T, helper: SelectedItemHelper<T>) => string;
type NoSelectionButtonTextFunction<T> = (helper: SelectedItemHelper<T>) => string;

export class SelectedItemHelper<T> {
    constructor(
        public readonly selectedText: ItemSelectedButtonTextFunction<T>,
        public readonly nonSelectedText: NoSelectionButtonTextFunction<T>
    ) {}

    public readonly itemChange = new EventEmitter<T | undefined>();

    private _items: T[] | undefined;

    public get items(): T[] | undefined {
        return this._items;
    }

    public set items(value: T[] | undefined) {
        this._items = value;

        if (this._items?.length === 1) {
            this._selectedItem = this._items[0];
        } else if (this._items != null && this._selectedItem != null) {
            this._selectedItem = this._items.includes(this._selectedItem) ? this._selectedItem : undefined;
        } else {
            this._selectedItem = undefined;
        }
    }

    private _loading = false;

    public get loading() {
        return this._loading;
    }

    private _selectedItem: T | undefined;

    public get selectedItem(): T | undefined {
        return this._selectedItem;
    }

    public get selectionDisabled(): boolean {
        return this._items?.length === 1 && this.selectItem != null;
    }

    public async loadItems(promise: Promise<T[]>): Promise<T[]> {
        this._selectedItem = undefined;
        this._loading = true;

        this.items = await promise;

        this._loading = false;

        return this.items;
    }

    public selectItem(item: T | undefined) {
        this._selectedItem = item;

        this.itemChange.emit(item);
    }

    public get buttonText(): string {
        return this._selectedItem != null ? this.selectedText(this._selectedItem, this) : this.nonSelectedText(this);
    }
}
