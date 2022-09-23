import 'chartjs-adapter-date-fns';

import { Component, Input } from '@angular/core';

import { defaultInclVat } from '../../constants';
import { IncludeVat, IncludeVatValues, TariffWithProduct } from '../../contracts';
import { getDisplayValue, isIncludeVat, UrlHelper } from '../../helpers';

const vatUrlParam = 'vat';

@Component({
    selector: 'tariff-comparison',
    templateUrl: './tariff-comparison.component.html',
})
export class TariffComparisonComponent {
    constructor(private urlHelper: UrlHelper) {
        const showVat = urlHelper.getSingleParam(vatUrlParam);

        this._includeVat = isIncludeVat(showVat) ? showVat : defaultInclVat;
    }

    public get vatValues(): ReadonlyArray<IncludeVat> {
        return IncludeVatValues;
    }

    private _includeVat: IncludeVat = defaultInclVat;

    public get includeVat(): IncludeVat {
        return this._includeVat;
    }

    public set includeVat(value: IncludeVat) {
        this._includeVat = value;

        this.urlHelper.saveUrlParam(vatUrlParam, value);
    }

    private _tariffs: TariffWithProduct[] = [];

    @Input()
    public get tariffs(): TariffWithProduct[] {
        return this._tariffs;
    }

    public set tariffs(value: TariffWithProduct[]) {
        this._tariffs = value;
    }

    public vatDisplayValue(value: IncludeVat): string {
        return getDisplayValue(value);
    }
}
