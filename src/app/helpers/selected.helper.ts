import { EventEmitter } from '@angular/core';
import { Injectable } from '@morgan-stanley/needle';

type ItemDisplayFunctionFunction<T> = (item: T | undefined) => string;

export type SelectedItemHelperConfig<T> = {
    displayFunction: ItemDisplayFunctionFunction<T>;
};

@Injectable()
export class SelectedItemHelperFactory {
    public create<T>(config: SelectedItemHelperConfig<T>): SelectedItemHelper<T> {
        return new SelectedItemHelper<T>(config);
    }
}

export class SelectedItemHelper<T> {
    constructor(private config: SelectedItemHelperConfig<T>) {}

    public readonly itemChange = new EventEmitter<T | undefined>();

    private _items: T[] | undefined;

    public get items(): T[] | undefined {
        return this._items;
    }

    public set items(value: T[] | undefined) {
        this._items = value;

        if (this._items?.length === 1) {
            this.selectItem(this._items[0]);
        } else if (this._selectedItem != null && this._items?.includes(this._selectedItem) === false) {
            this.selectItem(undefined);
        }
    }

    public getDisplayString(item?: T): string {
        return this.config.displayFunction(item);
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
        this.selectItem(undefined);
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
        return this.config.displayFunction(this._selectedItem);
    }
}
