import 'chartjs-adapter-date-fns';

import { Component, Input } from '@angular/core';
import { ChartConfiguration, ChartDataset } from 'chart.js';
import { format } from 'date-fns';

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
type ChartData = { charge?: ICharge<Date>; date: Date; value?: number } & TariffWithProduct;

@Component({
    selector: 'unit-rates-chart',
    templateUrl: './unit-rates-chart.component.html',
})
export class UnitRatesChartComponent {
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

    private _unitRatesConfig: ChartConfiguration<'line', ChartData[]> | undefined;

    public get unitRatesConfig(): ChartConfiguration<'line', ChartData[]> | undefined {
        return this._unitRatesConfig;
    }

    private updateUnitRatesChart() {
        this._unitRatesConfig = {
            type: 'line',
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => {
                                return items.map((item) => getSpanLabel((item.raw as ChartData)?.charge));
                            },
                        },
                    },
                },
                parsing: {
                    xAxisKey: 'date',
                    yAxisKey: 'value',
                },
                scales: {
                    y: {
                        beginAtZero: false,
                    },
                    x: {
                        type: 'time',
                        ticks: {
                            major: {
                                enabled: true,
                            },
                        },
                    },
                },
            },
            data: {
                datasets: this.generateDataSets(),
            },
        };
    }

    private generateDataSets(): ChartDataset<'line', ChartData[]>[] {
        return getChartSerieses(this.tariffs, this.includeVat)
            .map((series) => {
                const data = this.generateData(series);

                if (data == null) {
                    return undefined;
                }

                return {
                    data,
                    label: `${series.tariff.code} ${getDisplayValue(series.incVat ? 'incl' : 'excl')}`,
                    pointRadius: 0,
                    lineTension: 0,
                    borderWidth: 1,
                };
            })
            .filter(isDefined);
    }

    private generateData(series: ChartSeries): ChartData[] | undefined {
        const times = getTimes(this._periodFrom, this._periodTo);
        const charges = this.chargesLookup[series.tariff.code];

        if (charges == null) {
            return undefined;
        }

        //TODO: reduce data to include one entry for start and end of span
        const data = times.map((date) => {
            const charge = mapDateToCharge(date, charges);

            return {
                date,
                value: series.incVat ? charge?.value_inc_vat : charge?.value_exc_vat,
                charge,
                tariff: series.tariff,
                product: series.product,
            };
        });

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
