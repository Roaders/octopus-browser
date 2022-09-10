import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './components/app/app.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { TariffBrowserComponent } from './components/tariff-browser/tariff-browser.component';

@NgModule({
    declarations: [AppComponent, TariffBrowserComponent, ProductFilterComponent],
    imports: [BrowserModule, NgbModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
