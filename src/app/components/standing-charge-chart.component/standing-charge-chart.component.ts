import 'chartjs-adapter-date-fns';

import { Component, Input } from '@angular/core';
import Highcharts, { Chart, Options, SeriesOptionsType } from 'highcharts';

import { defaultInclVat, HexLookup } from '../../constants';
import { IncludeVat, ITariff, TariffWithProduct } from '../../contracts';
import { getChartSerieses, getDisplayValue, isDefined } from '../../helpers';

@Component({
    selector: 'standing-charge-chart',
    templateUrl: './standing-charge-chart.component.html',
})
export class StandingChargeChartComponent {
    public readonly highCharts = Highcharts;

    private _chart: Chart | undefined;

    private _chartCallback(chart: Chart): void {
        this._chart = chart;

        this.updateStandingChargesChart();
    }

    public chartCallback = this._chartCallback.bind(this);

    private _chartOptions: Options = {
        accessibility: {
            enabled: false,
        },
        title: undefined,
        chart: {
            type: 'column',
        },
        yAxis: {
            title: { text: 'p/day' },
        },
    };

    public get chartOptions(): Options {
        return this._chartOptions;
    }

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

    private updateStandingChargesChart() {
        if (this._chart == null) {
            return;
        }
        const dataSets = this.generateDataSets();
        const existingSeries = this._chart.series ?? [];

        existingSeries
            .filter((series) => dataSets.every((dataset) => dataset.id != series.options.id))
            .forEach((series) => series.remove(false));

        dataSets
            .filter((dataset) => existingSeries.every((series) => dataset.id != series.options.id))
            .forEach((dataset) => this._chart?.addSeries(dataset, false, false));

        this._chart.redraw(false);
    }

    private generateDataSets(): SeriesOptionsType[] {
        return getChartSerieses(this.tariffs, this.includeVat)
            .map<SeriesOptionsType | undefined>((series) => {
                return {
                    data: [this.getValue(series.tariff, series.incVat)],
                    type: 'bar',
                    name: `${series.tariff.code} ${getDisplayValue(series.incVat ? 'incl' : 'excl')}`,
                    id: `${series.tariff.code}_${series.incVat ? 'incl' : 'excl'}`,
                    color: series.incVat ? HexLookup['incl'] : HexLookup['excl'],
                    step: 'left',
                };
            })
            .filter(isDefined);
    }

    private getValue(tariff: ITariff, includeVat: boolean): number {
        return includeVat ? tariff.standing_charge_inc_vat : tariff.standing_charge_exc_vat;
    }
}
