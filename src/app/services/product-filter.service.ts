import { Injectable } from '@morgan-stanley/needle';
import { firstValueFrom } from 'rxjs';
import { CheckboxKey, checkboxKeys } from '../constants';
import { IProduct } from '../contracts';
import { OctopusService } from './octopus-service';

@Injectable()
export class ProductFilterService {
    private initialised = false;

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

    constructor(private octopusService: OctopusService) {
        this.reset();
    }

    public filterDisplayString(key: CheckboxKey): string {
        switch (key) {
            case 'business':
                return 'Business';
            case 'export':
                return 'Export';
            case 'green':
                return 'Green';
            case 'import':
                return 'Import';
            case 'prepay':
                return 'Pre Pay';
            case 'restricted':
                return 'Restricted';
            case 'tracker':
                return 'Tracker';
            case 'variable':
                return 'Variable';
            default:
                return key;
        }
    }

    public initialise() {
        if (this.initialised) {
            return;
        }

        this.initialised = true;
        this.loadProducts();
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

    private async loadProducts(): Promise<void> {
        this.reset();
        const products = (await this.octopusService.getProductsAsync()).results;

        this.updateBrands(products);
        this.updateCheckboxes(products);

        this._products = products;

        this.filterProducts();
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

    private filterProducts() {
        const selectedBrands = Object.entries(this._checkedBrands)
            .filter(([_key, value]) => value === true)
            .map(([key]) => key);

        this._filteredProducts = this._products
            ?.filter(
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
    }
}
