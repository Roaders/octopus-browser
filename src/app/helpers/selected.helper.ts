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
        private selectedText: ItemSelectedButtonTextFunction<T>,
        private nonSelectedText: NoSelectionButtonTextFunction<T>
    ) {}

    public readonly itemChange = new EventEmitter<T | undefined>();

    public items: T[] | undefined;

    private _loading = false;

    public get loading() {
        return this._loading;
    }

    private _selectedItem: T | undefined;

    public get selectedItem(): T | undefined {
        return this._selectedItem;
    }

    public get selectionDisabled(): boolean {
        return false;
    }

    public async loadItems(promise: Promise<T[]>): Promise<T[]> {
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
