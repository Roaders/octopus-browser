import { Component, OnInit, Output } from '@angular/core';

import { IProduct, IRegion } from '../../contracts';
import { SelectedItemHelper, SelectedItemHelperFactory } from '../../helpers/selected.helper';
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

        this.regionSelector = selectedItemFactory.create(
            (region) => region.name,
            () => 'Select Region'
        );
    }

    public readonly productSelector: SelectedItemHelper<IProduct>;
    public readonly regionSelector: SelectedItemHelper<IRegion>;

    @Output()
    public readonly productChange;

    ngOnInit(): void {
        this.productsService.initialise().subscribe({ next: (products) => (this.productSelector.items = products) });
        this.loadRegions();
    }

    private async loadRegions() {
        this.regionSelector.items = await this.octopusService.getRegionsAsync();
    }
}
