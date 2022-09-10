import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './components/app/app.component';
import { ItemSelectComponent } from './components/item-select/item-select.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { TariffBrowserComponent } from './components/tariff-browser/tariff-browser.component';
import { TariffSelectorComponent } from './components/tariff-selector.component/tariff-selector.component';

@NgModule({
    declarations: [
        AppComponent,
        TariffBrowserComponent,
        ProductFilterComponent,
        TariffSelectorComponent,
        ItemSelectComponent,
    ],
    imports: [BrowserModule, NgbModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
