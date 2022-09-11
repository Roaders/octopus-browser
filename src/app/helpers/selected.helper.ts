import { EventEmitter } from '@angular/core';
import { Injectable } from '@morgan-stanley/needle';

import { UrlHelper } from './url.helper';

type ItemDisplayFunctionFunction<T> = (item: T | undefined) => string;

export type SelectedItemHelperConfig<T> = {
    displayFunction: ItemDisplayFunctionFunction<T>;
    /** The index of the tariff in the url. Multiple tariffs in url are supported */
    tariffIndex?: number;
    /**
     * The index of the value in the tariff string
     * e.g. index.html?tariff=productId|registerId|regionId|paymentId
     * product has index 0, register has index 1
     */
    valueIndex?: number;
    propertyKey?: keyof T;
};

@Injectable()
export class SelectedItemHelperFactory {
    constructor(private urlHelper: UrlHelper) {}

    public create<T>(config: SelectedItemHelperConfig<T>): SelectedItemHelper<T> {
        return new SelectedItemHelper<T>(config, this.urlHelper);
    }
}

export class SelectedItemHelper<T> {
    constructor(private config: SelectedItemHelperConfig<T>, private urlHelper: UrlHelper) {
        this._deeplinkValue = this.getDeeplinkValue();
    }

    public readonly itemChange = new EventEmitter<T | undefined>();

    private _deepLinkApplied = false;
    private _deeplinkValue: string | undefined;

    public get deeplinkValue(): string | undefined {
        const value = this.config.propertyKey != null ? this.selectedItem?.[this.config.propertyKey] : undefined;
        return value != null ? String(value) : undefined;
    }

    private _items: T[] | undefined;

    public get items(): T[] | undefined {
        return this._items;
    }

    public set items(value: T[] | undefined) {
        this._items = value;

        if (this._items?.length === 1) {
            this.selectItem(this._items[0]);
        } else if (this._items == null) {
            this.selectItem(undefined);
        } else {
            this.selectItem(this.getSelectionFromUrlParams());
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
        if (item === this._selectedItem) {
            return;
        }

        this._selectedItem = item;

        this.itemChange.emit(item);
    }

    public get buttonText(): string {
        return this.config.displayFunction(this._selectedItem);
    }

    private getDeeplinkValue(): string | undefined {
        const tariffIndex = this.config.tariffIndex || 0;
        const valueIndex = this.config.valueIndex;

        const value = this.urlHelper.getMultipleParams('tariff');
        const selectedTariff: string | undefined = value[tariffIndex];
        return valueIndex != null ? selectedTariff?.split('|')?.[valueIndex] : undefined;
    }

    private getSelectionFromUrlParams(): T | undefined {
        const propertyKey = this.config.propertyKey;

        if (
            this._deepLinkApplied ||
            this._items == null ||
            this._items.length === 0 ||
            this._deeplinkValue == null ||
            propertyKey == null
        ) {
            return this._selectedItem;
        }

        this._deepLinkApplied = true;

        return this._items?.find((item) => String(item[propertyKey]) === this._deeplinkValue);
    }
}
