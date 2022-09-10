import { Component, OnInit, Output } from '@angular/core';
import { firstValueFrom, from, map, shareReplay } from 'rxjs';

import { IProduct, IProductDetail, IRegion, IRegister } from '../../contracts';
import { isIRegister, SelectedItemHelper, SelectedItemHelperFactory } from '../../helpers';
import { OctopusService } from '../../services';
import { ProductFilterService } from '../../services/product-filter.service';

@Component({
    selector: 'tariff-selector',
    templateUrl: './tariff-selector.component.html',
})
export class TariffSelectorComponent implements OnInit {
    constructor(
        private productsService: ProductFilterService,
        private octopusService: OctopusService,
        selectedItemFactory: SelectedItemHelperFactory
    ) {
        this.productSelector = selectedItemFactory.create(
            (product) => product.full_name,
            (helper) => `Select Product (${helper.items?.length ?? 0})`
        );
        this.productChange = this.productSelector.itemChange;
        this.productChange.subscribe({ next: (product: IProduct | undefined) => this.onProductSelected(product) });

        this.registerSelector = selectedItemFactory.create(
            (register) => this.registerDisplayValue(register),
            () => 'Select Register'
        );

        this.regionSelector = selectedItemFactory.create(
            (region) => region.name,
            () => 'Select Region'
        );
    }

    private _productDetail: IProductDetail | undefined;

    public readonly productSelector: SelectedItemHelper<IProduct>;
    public readonly registerSelector: SelectedItemHelper<IRegister>;
    public readonly regionSelector: SelectedItemHelper<IRegion>;

    @Output()
    public readonly productChange;

    ngOnInit(): void {
        this.productsService.initialise().subscribe({ next: (products) => (this.productSelector.items = products) });
        this.loadRegions();
    }

    public registerDisplayValue(register: IRegister): string {
        switch (register.code) {
            case 'dual_register_electricity_tariffs':
                return 'Dual Fuel';
            case 'single_register_electricity_tariffs':
                return 'Electric';
            case 'single_register_gas_tariffs':
                return 'Gas';
            default:
                return register.code;
        }
    }

    private async loadRegions() {
        this.regionSelector.items = await this.octopusService.getRegionsAsync();
    }

    private onProductSelected(product: IProduct | undefined) {
        this._productDetail = undefined;

        if (product == null) {
            this.regionSelector.items = undefined;
            return;
        }

        const loadProductDetail = from(this.octopusService.getProductAsync(product.code)).pipe(shareReplay());

        const loadRegisters = loadProductDetail.pipe(map((detail) => mapProductDetailToRegisters(detail)));

        this.registerSelector.loadItems(firstValueFrom(loadRegisters));
        loadProductDetail.subscribe({ next: (detail) => (this._productDetail = detail) });
    }
}

function mapProductDetailToRegisters(detail: IProductDetail): IRegister[] {
    return Object.entries(detail)
        .map(([code, values]) => ({ code, values }))
        .filter(isIRegister);
}
