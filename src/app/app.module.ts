import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgChartsModule } from 'ng2-charts';

import npmPackage from '../../package.json';
import { AppComponent } from './components/app/app.component';
import { ItemSelectComponent } from './components/item-select/item-select.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { SelectedProductComponent } from './components/selected-product/selected-product.component';
import { SelectedTariffComponent } from './components/selected-tariff/selected-tariff.component';
import { StandingChargeChartComponent } from './components/standing-charge-chart.component/standing-charge-chart.component';
import { TariffBrowserComponent } from './components/tariff-browser/tariff-browser.component';
import { TariffComparisonComponent } from './components/tariff-comparison/tariff-comparison.component';
import { TariffSelectorComponent } from './components/tariff-selector.component/tariff-selector.component';
import { UnitRatesChartComponent } from './components/unit-rates-chart/unit-rates-chart.component';
import { BrandNamePipe } from './pipes/brand-name.pipe';
import { YesNoPipe } from './pipes/yes-no.pipe';

@NgModule({
    declarations: [
        AppComponent,
        TariffBrowserComponent,
        ProductFilterComponent,
        TariffSelectorComponent,
        ItemSelectComponent,
        SelectedProductComponent,
        SelectedTariffComponent,
        YesNoPipe,
        BrandNamePipe,
        TariffComparisonComponent,
        StandingChargeChartComponent,
        UnitRatesChartComponent,
    ],
    imports: [BrowserModule, NgbModule, NgChartsModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor() {
        window.document.title = `Octopus Browser v${npmPackage.version}`;
    }
}
