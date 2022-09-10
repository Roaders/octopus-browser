import { Component, EventEmitter, OnInit } from '@angular/core';

import { IProduct, IRegion } from '../../contracts';
import { OctopusService } from '../../services';
import { ProductFilterService } from '../../services/product-filter.service';

@Component({
    selector: 'tariff-selector',
    templateUrl: './tariff-selector.component.html',
})
export class TariffSelectorComponent implements OnInit {
    constructor(private productsService: ProductFilterService, private octopusService: OctopusService) {}

    private _regions: IRegion[] | undefined;

    public get regions(): IRegion[] | undefined {
        return this._regions;
    }

    private _selectedRegion: IRegion | undefined;

    public get selectedRegion(): IRegion | undefined {
        return this._selectedRegion;
    }

    private _selectedProduct: IProduct | undefined;

    public readonly productChangeEvent = new EventEmitter<IProduct>();

    public get selectedProduct(): IProduct | undefined {
        return this._selectedProduct;
    }

    public get selectProductButtonText(): string {
        return this._selectedProduct != null
            ? this._selectedProduct.full_name
            : `Select Product (${this.products?.length})`;
    }

    public get selectRegionButtonText(): string {
        return this._selectedRegion != null ? this._selectedRegion.name : `Select Region`;
    }

    ngOnInit(): void {
        this.productsService.initialise();
        this.loadRegions();
    }

    public selectProduct(product?: IProduct) {
        this._selectedProduct = product;
    }

    public selectRegion(region?: IRegion) {
        this._selectedRegion = region;
    }

    public get products(): IProduct[] | undefined {
        return this.productsService.products;
    }

    private async loadRegions() {
        this._regions = await this.octopusService.getRegionsAsync();
    }
}
