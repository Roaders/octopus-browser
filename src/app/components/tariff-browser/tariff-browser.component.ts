import { Component } from '@angular/core';
import { IProduct } from '../../contracts';
import { OctopusService } from '../../services';

const checkboxKeys = ['variable', 'green', 'tracker', 'prepay', 'business', 'restricted'] as const;

type CheckboxKey = typeof checkboxKeys[number];

@Component({
    selector: 'tariff-browser',
    templateUrl: './tariff-browser.component.html',
})
export class TariffBrowserComponent {
    private _filters: Partial<Record<CheckboxKey, boolean>> = {};

    private _checkboxes: ReadonlyArray<CheckboxKey> = checkboxKeys;
    private _products: IProduct[] | undefined;
    private _filteredProducts: IProduct[] | undefined;

    public get products(): IProduct[] | undefined {
        return this._filteredProducts;
    }

    public get checkboxes(): ReadonlyArray<CheckboxKey> {
        return this._checkboxes;
    }

    constructor(private octopus: OctopusService) {
        this.loadProducts();

        this.reset();
    }

    public toggleFilter(key: CheckboxKey) {
        this._filters[key] = !this.isChecked(key);

        this.filterProducts();
    }

    public isChecked(key: CheckboxKey): boolean {
        return this._filters[key] || false;
    }

    public reset(): void {
        this._filters = {
            business: true,
            green: true,
            prepay: true,
            tracker: true,
            variable: true,
        };
    }

    private async loadProducts(): Promise<void> {
        this._products = (await this.octopus.getProductsAsync()).results;

        this._checkboxes = checkboxKeys.filter((key) => this._products?.some((product) => product[`is_${key}`]));

        const prepay = this._products.find((product) => product.is_prepay);

        console.log(`prepay`, prepay);

        this.filterProducts();
    }

    private filterProducts() {
        this._filteredProducts = this._products?.filter(
            (product) =>
                (this.isChecked('business') && product.is_business) ||
                (this.isChecked('green') && product.is_green) ||
                (this.isChecked('prepay') && product.is_prepay) ||
                (this.isChecked('restricted') && product.is_restricted) ||
                (this.isChecked('tracker') && product.is_tracker) ||
                (this.isChecked('variable') && product.is_variable)
        );
    }
}
