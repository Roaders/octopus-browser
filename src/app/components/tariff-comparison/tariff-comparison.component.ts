import 'chartjs-adapter-date-fns';

import { Component, Input } from '@angular/core';

import { defaultInclVat } from '../../constants';
import { IncludeVat, IncludeVatValues, TariffWithProduct } from '../../contracts';

@Component({
    selector: 'tariff-comparison',
    templateUrl: './tariff-comparison.component.html',
})
export class TariffComparisonComponent {
    public get vatValues(): ReadonlyArray<IncludeVat> {
        return IncludeVatValues;
    }

    private _includeVat: IncludeVat = defaultInclVat;

    public get includeVat(): IncludeVat {
        return this._includeVat;
    }

    public set includeVat(value: IncludeVat) {
        this._includeVat = value;
    }

    private _tariffs: TariffWithProduct[] = [];

    @Input()
    public get tariffs(): TariffWithProduct[] {
        return this._tariffs;
    }

    public set tariffs(value: TariffWithProduct[]) {
        this._tariffs = value;
    }
}
