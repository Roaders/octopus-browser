import { Component, OnInit, Output } from '@angular/core';
import { firstValueFrom, from, map, shareReplay } from 'rxjs';

import { IBillingType, IProduct, IProductDetail, IRegion, IRegister } from '../../contracts';
import { isIBillingType, isIRegister, SelectedItemHelper, SelectedItemHelperFactory } from '../../helpers';
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
        this.regionSelector.itemChange.subscribe({
            next: (region: IRegion | undefined) => this.onRegionSelected(region),
        });

        this.billingSelector = selectedItemFactory.create(
            (billing) => this.billingDisplayValue(billing),
            () => 'Select Billing Type'
        );
    }

    private _productDetail: IProductDetail | undefined;

    public readonly productSelector: SelectedItemHelper<IProduct>;
    public readonly registerSelector: SelectedItemHelper<IRegister>;
    public readonly regionSelector: SelectedItemHelper<IRegion>;
    public readonly billingSelector: SelectedItemHelper<IBillingType>;

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

    public billingDisplayValue(register: IBillingType): string {
        switch (register.type) {
            case 'direct_debit_monthly':
                return 'Monthly DD';
            case 'direct_debit_quarterly':
                return 'Quarterly DD';
            default:
                return register.type;
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

    private onRegionSelected(region: IRegion | undefined) {
        const registerCode = this.registerSelector.selectedItem?.code;
        const register = registerCode != null ? this._productDetail?.[registerCode] : undefined;
        const regionCode = region?.code;
        const tariff = regionCode != null ? register?.[`_${regionCode}`] : undefined;

        if (tariff == null) {
            this.billingSelector.items = undefined;
            return;
        }

        this.billingSelector.items = Object.entries(tariff)
            .map(([type, tariff]) => ({
                type,
                tariff,
            }))
            .filter(isIBillingType);
    }
}

function mapProductDetailToRegisters(detail: IProductDetail): IRegister[] {
    return Object.entries(detail)
        .map(([code, values]) => ({ code, values }))
        .filter(isIRegister);
}
