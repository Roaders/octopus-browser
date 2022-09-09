import { Component, OnInit } from '@angular/core';
import { IProduct } from '../../contracts';
import { ProductFilterService } from '../../services/product-filter.service';

@Component({
    selector: 'tariff-browser',
    templateUrl: './tariff-browser.component.html',
})
export class TariffBrowserComponent implements OnInit {
    constructor(private productsService: ProductFilterService) {}

    ngOnInit(): void {
        this.productsService.initialise();
    }

    public selectProduct(product: IProduct) {
        console.log(product);
    }

    public get products(): IProduct[] | undefined {
        return this.productsService.products;
    }
}
