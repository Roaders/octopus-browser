import { Injectable } from '@morgan-stanley/needle';
import { filter, from, map, Observable, ReplaySubject, shareReplay, tap } from 'rxjs';

import { CheckboxKey, checkboxKeys } from '../constants';
import { IProduct } from '../contracts';
import { OctopusService } from './octopus-service';

@Injectable()
export class ProductFilterService {
    private _productsStream: Observable<IProduct[]> | undefined;

    private _filters: Partial<Record<CheckboxKey, boolean>> = {};
    private _checkedBrands: Partial<Record<string, boolean>> = {};

    private _checkboxes: ReadonlyArray<CheckboxKey> = [];
    private _brands: ReadonlyArray<string> = [];

    private _products: IProduct[] | undefined;
    private _filteredProducts: IProduct[] | undefined;

    public get products(): IProduct[] | undefined {
        return this._filteredProducts;
    }

    public get checkboxes(): ReadonlyArray<CheckboxKey> {
        return this._checkboxes;
    }

    public get brands(): ReadonlyArray<string> {
        return this._brands;
    }

    private _productsSubject = new ReplaySubject<IProduct[] | undefined>(1);

    constructor(private octopusService: OctopusService) {
        this.reset();
    }

    public get productsUpdates(): Observable<IProduct[] | undefined> {
        return this._productsSubject.asObservable();
    }

    public initialise(): Observable<IProduct[]> {
        if (this._productsStream != null) {
            return this._productsStream;
        }

        return this.loadProducts();
    }

    public toggleFilter(key: CheckboxKey) {
        this._filters[key] = !this.isChecked(key);

        this.filterProducts();
    }

    public isChecked(key: CheckboxKey): boolean {
        return this._filters[key] || false;
    }

    public toggleBrand(brand: string) {
        this._checkedBrands[brand] = !this.isBrandChecked(brand);

        this.filterProducts();
    }

    public isBrandChecked(brand: string): boolean {
        return this._checkedBrands[brand] || false;
    }

    private loadProducts(): Observable<IProduct[]> {
        this.reset();
        const stream = (this._productsStream = from(this.octopusService.getProductsAsync()).pipe(
            map((products) => {
                this._products = products;

                this.updateBrands(products);
                this.updateCheckboxes(products);

                return this.filterProducts();
            }),
            shareReplay()
        ));

        stream.subscribe();

        return stream;
    }

    public reset(): void {
        this._filters = {};
        this._checkedBrands = { OCTOPUS_ENERGY: true };

        this.filterProducts();
    }

    private updateBrands(products: IProduct[]) {
        const brands = products.reduce((set, product) => set.add(product.brand), new Set<string>());
        this._brands = Array.from(brands).sort();
    }

    private updateCheckboxes(products: IProduct[]) {
        this._checkboxes = checkboxKeys.filter((key) =>
            products.some((product) => {
                switch (key) {
                    case 'import':
                        return (product.direction = 'IMPORT');
                    case 'export':
                        return (product.direction = 'EXPORT');
                    default:
                        return product[`is_${key}`];
                }
            })
        );
    }

    private filterProducts(): IProduct[] {
        const selectedBrands = Object.entries(this._checkedBrands)
            .filter((values) => values[1] === true)
            .map(([key]) => key);

        const products = this._products ?? [];

        const filtered = products
            .filter(
                (product) =>
                    (Object.values(this._filters).every((filterValue) => !filterValue) ||
                        (this.isChecked('business') && product.is_business) ||
                        (this.isChecked('green') && product.is_green) ||
                        (this.isChecked('prepay') && product.is_prepay) ||
                        (this.isChecked('restricted') && product.is_restricted) ||
                        (this.isChecked('tracker') && product.is_tracker) ||
                        (this.isChecked('variable') && product.is_variable) ||
                        (this.isChecked('import') && product.direction === 'IMPORT') ||
                        (this.isChecked('export') && product.direction === 'EXPORT')) &&
                    (selectedBrands.length === 0 || selectedBrands.includes(product.brand))
            )
            .sort((a, b) => a.full_name.localeCompare(b.full_name));

        this._filteredProducts = filtered;
        this._productsSubject.next(filtered);

        return filtered;
    }
}
