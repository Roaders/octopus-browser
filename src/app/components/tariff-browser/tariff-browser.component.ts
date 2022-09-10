import { Component, OnInit } from '@angular/core';

import { IBillingType, IProduct, ITariff } from '../../contracts';
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

    private _product: IProduct | undefined;

    public get product(): IProduct | undefined {
        return this._product;
    }

    public async onProductSelected(product?: IProduct) {
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
