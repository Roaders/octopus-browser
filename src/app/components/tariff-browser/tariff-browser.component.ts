import { Component, OnInit } from '@angular/core';

import { IProduct } from '../../contracts';
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

    public async selectProduct(product: IProduct) {
        console.log(product);

        const fullProduct = await this.octopusService.getProductAsync(product.code);

        console.log(fullProduct);
    }

    public get products(): IProduct[] | undefined {
        return this.productsService.products;
    }
}
