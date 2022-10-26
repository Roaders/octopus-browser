import { Component, Input } from '@angular/core';
import {} from 'date-fns';
import * as Highcharts from 'highcharts';
import { Chart, Options, SeriesOptionsType } from 'highcharts';

import { defaultInclVat, defaultPeriod, HexLookup } from '../../constants';
import { ICharge, IncludeVat, LinkRel, TariffWithProduct, TimePeriod, TimePeriods } from '../../contracts';
import { getChartSerieses, getDisplayValue, isDefined, isPeriod, UrlHelper } from '../../helpers';
import { OctopusService } from '../../services';

const periodUrlParam = 'period';

@Component({
    selector: 'unit-rates-chart',
    templateUrl: './unit-rates-chart.component.html',
})
export class UnitRatesChartComponent {
    public readonly highCharts = Highcharts;

    private _chart: Chart | undefined;

    private _chartCallback(chart: Chart): void {
        this._chart = chart;

        this.updateUnitRatesChart();
    }

    public chartCallback = this._chartCallback.bind(this);

    private _chartOptions: Options = {
        accessibility: {
            enabled: false,
        },
        title: undefined,
        time: {
            useUTC: false,
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: {
            title: { text: 'p/kwh' },
        },
        plotOptions: {
            line: {
                marker: {
                    enabled: false,
                },
            },
        },
    };

    public get chartOptions(): Options {
        return this._chartOptions;
    }

    constructor(private octopusService: OctopusService, private urlHelper: UrlHelper) {
        const savedPeriod = urlHelper.getSingleParam(periodUrlParam);

        this.chargeType = 'standard_unit_rates';
        this._includeVat = defaultInclVat;
        this.selectedPeriod = isPeriod(savedPeriod) ? savedPeriod : defaultPeriod;
    }

    private chargeType: LinkRel;

    private chargesLookup: Partial<Record<string, ICharge<Date>[]>> = {};

    public get timePeriods(): ReadonlyArray<TimePeriod> {
        return TimePeriods;
    }

    private _period: TimePeriod = 'Day';

    public get selectedPeriod(): TimePeriod {
        return this._period;
    }

    public set selectedPeriod(value: TimePeriod) {
        this._period = value;

        this._periodTo = new Date();
        this._periodFrom = calculatePeriodStart(this._periodTo, this.selectedPeriod);

        this.loadTariffs();

        this.urlHelper.saveUrlParam(periodUrlParam, value);
    }

    // updated in constructor by setting selectedPeriod
    private _periodFrom: Date = new Date();
    private _periodTo: Date = new Date();

    private _includeVat: IncludeVat;

    @Input()
    public get includeVat(): IncludeVat {
        return this._includeVat;
    }

    public set includeVat(value: IncludeVat) {
        this._includeVat = value;

        this.updateUnitRatesChart();
    }

    private _tariffs: TariffWithProduct[] = [];

    @Input()
    public get tariffs(): TariffWithProduct[] {
        return this._tariffs;
    }

    public set tariffs(value: TariffWithProduct[]) {
        this._tariffs = value;

        this.updateUnitRatesChart();
        this.loadTariffs();
    }

    private updateUnitRatesChart() {
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
        const serieses = getChartSerieses(this.tariffs, this.includeVat)
            .map<SeriesOptionsType | undefined>((series) => {
                const charges = this.chargesLookup[series.tariff.code];

                if (charges == null) {
                    return undefined;
                }

                const data = charges.map((charge) => [
                    charge.valid_from.getTime(),
                    series.incVat ? charge?.value_inc_vat : charge?.value_exc_vat,
                ]);

                return {
                    data,
                    type: 'line',
                    name: `${series.tariff.code} ${getDisplayValue(series.incVat ? 'incl' : 'excl')}`,
                    id: `${series.tariff.code}_${series.incVat ? 'incl' : 'excl'}`,
                    color: series.incVat ? HexLookup['incl'] : HexLookup['excl'],
                    step: 'left',
                };
            })
            .filter(isDefined);

        return serieses;
    }

    private loadTariffs() {
        this.chargesLookup = {};
        this.updateUnitRatesChart();

        this._tariffs.forEach((tariff) => this.loadCharges(tariff));
    }

    private async loadCharges(tariffAndProduct: TariffWithProduct) {
        if (tariffAndProduct.tariff.links.every((link) => link.rel != this.chargeType)) {
            return;
        }

        const values = await this.octopusService.loadCharges({
            product: tariffAndProduct.product,
            tariff: tariffAndProduct.tariff,
            register: 'electricity-tariffs', // TODO
            chargeType: this.chargeType,
            pageSize: 1500,
            periodFrom: this._periodFrom,
            periodTo: this._periodTo,
        });

        this.chargesLookup[tariffAndProduct.tariff.code] = values;

        this.updateUnitRatesChart();
    }
}

/**
 * TODO
 * @param end
 * @param selectedPeriod
 * @returns
 */
function calculatePeriodStart(end: Date, selectedPeriod: TimePeriod): Date {
    const day = 3600 * 1000 * 24;

    let start: number;

    switch (selectedPeriod) {
        case 'Day':
            start = end.getTime() - day;
            break;
        case 'Week':
            start = end.getTime() - day * 7;
            break;

        case 'Month':
            start = end.getTime() - day * 28;
            break;
    }

    return new Date(start);
}
