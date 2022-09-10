import { Component, OnInit } from '@angular/core';

import { IBillingType, IProductDetail, ITariff } from '../../contracts';
import { OctopusService } from '../../services';
import { ProductFilterService } from '../../services/product-filter.service';

@Component({
    selector: 'tariff-browser',
    templateUrl: './tariff-browser.component.html',
})
export class TariffBrowserComponent implements OnInit {
    constructor(private productsService: ProductFilterService, private octopusService: OctopusService) {}

    ngOnInit(): void {
        this.productsService.initialise();
    }

    private _product: IProductDetail<Date> | undefined;

    public get product(): IProductDetail<Date> | undefined {
        return this._product;
    }

    public async onProductSelected(product?: IProductDetail<Date>) {
        this._product = product;
    }

    private _tariff: ITariff | undefined;

    public get tariff(): ITariff | undefined {
        return this._tariff;
    }

    public async onBillingSelected(billing?: IBillingType) {
        this._tariff = billing?.tariff;
    }
}
