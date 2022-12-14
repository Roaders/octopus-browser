import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { firstValueFrom, from, map, shareReplay } from 'rxjs';

import { IBillingType, IProduct, IProductDetail, IRegion, IRegister } from '../../contracts';
import { isIBillingType, isIRegister, SelectedItemHelper, SelectedItemHelperFactory, UrlHelper } from '../../helpers';
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
        selectedItemFactory: SelectedItemHelperFactory,
        private urlHelper: UrlHelper
    ) {
        this.productSelector = selectedItemFactory.create({
            displayFunction: (product) =>
                product != null ? product.full_name : `Select Product (${this.productSelector.items?.length ?? 0})`,
            propertyKey: 'code',
            valueIndex: 0,
        });
        this.productSelector.itemChange.subscribe({
            next: (product: IProduct | undefined) => this.onProductSelected(product),
        });

        this.registerSelector = selectedItemFactory.create({
            displayFunction: (register) => (register != null ? this.registerDisplayValue(register) : 'Select Register'),
            propertyKey: 'code',
            valueIndex: 1,
        });
        this.registerChange = this.registerSelector.itemChange;
        this.registerSelector.itemChange.subscribe({
            next: () => this.onRegisterSelected(),
        });

        this.regionSelector = selectedItemFactory.create({
            displayFunction: (region) => (region != null ? region.name : 'Select Region'),
            propertyKey: 'code',
            valueIndex: 2,
        });
        this.regionSelector.itemChange.subscribe({
            next: (region: IRegion | undefined) => this.onRegionSelected(region),
        });
        this.regionChange = this.regionSelector.itemChange;

        this.billingSelector = selectedItemFactory.create({
            displayFunction: (billing) => (billing != null ? this.billingDisplayValue(billing) : 'Select Billing Type'),
            propertyKey: 'type',
            valueIndex: 3,
        });
        this.billingTypeChange = this.billingSelector.itemChange;
    }

    private _productDetail: IProductDetail<Date> | undefined;

    public readonly productSelector: SelectedItemHelper<IProduct>;
    public readonly registerSelector: SelectedItemHelper<IRegister>;
    public readonly regionSelector: SelectedItemHelper<IRegion>;
    public readonly billingSelector: SelectedItemHelper<IBillingType>;

    @Output()
    public readonly productChange = new EventEmitter<IProductDetail<Date> | undefined>();

    @Output()
    public readonly registerChange: EventEmitter<IRegister | undefined>;

    @Output()
    public readonly regionChange: EventEmitter<IRegion | undefined>;

    @Output()
    public readonly billingTypeChange: EventEmitter<IBillingType | undefined>;

    ngOnInit(): void {
        this.productsService.productsUpdates.subscribe({
            next: (products) => (this.productSelector.items = products),
        });
        this.productSelector.loadItems(firstValueFrom(this.productsService.initialise()));
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
            case 'prepayment':
                return 'Pre Payment';
            default:
                return register.type;
        }
    }

    private onProductSelected(product: IProduct | undefined) {
        this._productDetail = undefined;
        this.productChange.emit(undefined);
        this.registerSelector.selectItem(undefined);

        if (product == null) {
            return;
        }

        const loadProductDetail = from(this.octopusService.getProductAsync(product)).pipe(shareReplay());

        const loadRegisters = loadProductDetail.pipe(map((detail) => mapProductDetailToRegisters(detail)));

        this.registerSelector.loadItems(firstValueFrom(loadRegisters));
        loadProductDetail.subscribe({
            next: (detail) => {
                this._productDetail = detail;
                this.productChange.emit(detail);
            },
        });

        this.updateUrl();
    }

    private onRegisterSelected() {
        this.regionSelector.selectItem(undefined);

        this.regionSelector.loadItems(this.octopusService.getRegionsAsync());

        this.updateUrl();
    }

    private onRegionSelected(region: IRegion | undefined) {
        this.billingSelector.selectItem(undefined);

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

        this.updateUrl();
    }

    private updateUrl() {
        const values = [
            this.productSelector.deeplinkValue,
            this.registerSelector.deeplinkValue,
            this.regionSelector.deeplinkValue,
            this.billingSelector.deeplinkValue,
        ].join('|');

        this.urlHelper.saveUrlParam('tariff', values);
    }
}

function mapProductDetailToRegisters(detail: IProductDetail<Date>): IRegister[] {
    return Object.entries(detail)
        .map(([code, values]) => ({ code, values }))
        .filter(isIRegister);
}
