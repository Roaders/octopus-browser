import { Component, OnInit } from '@angular/core';
import { ProductFilterService } from '../../services/product-filter.service';

const checkboxKeys = ['variable', 'green', 'tracker', 'prepay', 'business', 'restricted', 'import', 'export'] as const;

type CheckboxKey = typeof checkboxKeys[number];

@Component({
    selector: 'product-filter',
    templateUrl: './product-filter.component.html',
})
export class ProductFilterComponent implements OnInit {
    public get checkboxes(): ReadonlyArray<CheckboxKey> {
        return this.productsService.checkboxes;
    }

    public get brands(): ReadonlyArray<string> {
        return this.productsService.brands;
    }

    constructor(private productsService: ProductFilterService) {}

    public ngOnInit(): void {
        this.productsService.initialise();
    }

    public toggleFilter(key: CheckboxKey) {
        this.productsService.toggleFilter(key);
    }

    public isChecked(key: CheckboxKey): boolean {
        return this.productsService.isChecked(key);
    }

    public toggleBrand(brand: string) {
        return this.productsService.toggleBrand(brand);
    }

    public isBrandChecked(brand: string): boolean {
        return this.productsService.isBrandChecked(brand);
    }

    public reset(): void {
        this.productsService.reset();
    }

    public filterDisplayString(key: CheckboxKey): string {
        return this.productsService.filterDisplayString(key);
    }
}
