import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './components/app/app.component';
import { ProductFilterComponent } from './components/product-filter/product-filter.component';
import { TariffBrowserComponent } from './components/tariff-browser/tariff-browser.component';

@NgModule({
    declarations: [AppComponent, TariffBrowserComponent, ProductFilterComponent],
    imports: [BrowserModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
