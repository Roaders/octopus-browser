import { Component, Input } from '@angular/core';
import { format } from 'date-fns';
import * as Highcharts from 'highcharts';
import { Options, SeriesOptionsType } from 'highcharts';

import { defaultInclVat, defaultPeriod } from '../../constants';
import { ChartSeries, ICharge, IncludeVat, LinkRel, TariffWithProduct, TimePeriod, TimePeriods } from '../../contracts';
import {
    getChartSerieses,
    getDisplayValue,
    getTimes,
    isDefined,
    isPeriod,
    mapDateToCharge,
    UrlHelper,
} from '../../helpers';
import { OctopusService } from '../../services';

const periodUrlParam = 'period';

type Timespan = Omit<ICharge<Date>, 'value_exc_vat' | 'value_inc_vat'>;
type ChartData = { charge?: ICharge<Date>; date: Date; value: number } & TariffWithProduct;

@Component({
    selector: 'unit-rates-chart',
    templateUrl: './unit-rates-chart.component.html',
})
export class UnitRatesChartComponent {
    public readonly highCharts = Highcharts;

    private _chartOptions: Options | undefined;

    public get chartOptions(): Options | undefined {
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
        this._chartOptions = {
            accessibility: {
                enabled: false,
            },
            title: undefined,
            xAxis: {
                type: 'datetime',
            },
            yAxis: {
                title: { text: 'p/kwh' },
            },
            series: this.generateDataSets(),
        };
    }

    private generateDataSets(): SeriesOptionsType[] {
        const data = [
            [new Date(2022, 1, 3).getTime(), 1],
            [new Date(2022, 1, 4).getTime(), 2],
        ];

        return getChartSerieses(this.tariffs, this.includeVat)
            .map<SeriesOptionsType | undefined>((series) => {
                const chartData = this.generateData(series)?.map((data) => [data.date.getTime(), data.value]);

                if (chartData == null) {
                    return undefined;
                }

                return {
                    data,
                    type: 'line',
                    name: `${series.tariff.code} ${getDisplayValue(series.incVat ? 'incl' : 'excl')}`,
                };
            })
            .filter(isDefined);
    }

    // TODO just return charges array
    private generateData(series: ChartSeries): ChartData[] | undefined {
        const times = getTimes(this._periodFrom, this._periodTo);
        const charges = this.chargesLookup[series.tariff.code];

        if (charges == null) {
            return undefined;
        }

        //TODO: reduce data to include one entry for start and end of span
        const data = times
            .map((date) => {
                const charge = mapDateToCharge(date, charges);

                if (charge == null) {
                    return undefined;
                }

                return {
                    date,
                    value: series.incVat ? charge?.value_inc_vat : charge?.value_exc_vat,
                    charge,
                    tariff: series.tariff,
                    product: series.product,
                };
            })
            .filter(isDefined);

        return data;
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

function formatDateString(date: Date): string {
    return date.toDateString();
}

function getSpanLabel(span?: Timespan): string {
    if (span == null) {
        return '';
    }

    const time = `${format(span.valid_from, 'HH:mm')} - ${format(span.valid_to, 'HH:mm')}`;

    return `${formatDateString(span.valid_from)} ${time}`;
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
