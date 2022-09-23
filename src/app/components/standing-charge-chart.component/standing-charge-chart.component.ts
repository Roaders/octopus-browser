import 'chartjs-adapter-date-fns';

import { Component, Input } from '@angular/core';
import { ChartConfiguration, ChartDataset } from 'chart.js';

import { defaultInclVat } from '../../constants';
import { IncludeVat, ITariff, TariffWithProduct } from '../../contracts';
import { filterInclVatValues } from '../../helpers';

@Component({
    selector: 'standing-charge-chart',
    templateUrl: './standing-charge-chart.component.html',
})
export class StandingChargeChartComponent {
    private _includeVat: IncludeVat = defaultInclVat;

    @Input()
    public get includeVat(): IncludeVat {
        return this._includeVat;
    }

    public set includeVat(value: IncludeVat) {
        this._includeVat = value;

        this.updateStandingChargesChart();
    }

    private _tariffs: TariffWithProduct[] = [];

    @Input()
    public get tariffs(): TariffWithProduct[] {
        return this._tariffs;
    }

    public set tariffs(value: TariffWithProduct[]) {
        this._tariffs = value;

        this.updateStandingChargesChart();
    }

    private _standingChargesConfig: ChartConfiguration<'bar'> | undefined;

    public get standingChargesConfig(): ChartConfiguration<'bar'> | undefined {
        return this._standingChargesConfig;
    }

    private updateStandingChargesChart() {
        this._standingChargesConfig = {
            type: 'bar',
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    },
                },
            },
            data: {
                labels: this.tariffs.map((value) => value.tariff.code),
                datasets: this.getDatasets(),
            },
        };
    }

    private getDatasets(): ChartDataset<'bar'>[] {
        const inclVatValues = ['incl', 'excl'] as const;
        return inclVatValues
            .filter((value) => filterInclVatValues(value, this.includeVat))
            .map((label) => ({
                data: this.tariffs.map((tariffAndProduct) => this.getValue(tariffAndProduct.tariff)),
                label,
            }));
    }

    private getValue(tariff: ITariff): number {
        return this.includeVat === 'incl' ? tariff.standing_charge_inc_vat : tariff.standing_charge_exc_vat;
    }
}
