import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './components/app/app.component';
import { TariffBrowserComponent } from './components/tariff-browser/tariff-browser.component';

@NgModule({
    declarations: [AppComponent, TariffBrowserComponent],
    imports: [BrowserModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
