import 'chartjs-adapter-date-fns';

import { Component, Input } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { format } from 'date-fns';

import { defaultInclVat, defaultPeriod } from '../../constants';
import { ICharge, IncludeVat, LinkRel, TariffWithProduct, TimePeriod, TimePeriods } from '../../contracts';
import { getChartSerieses, isDefined } from '../../helpers';
import { OctopusService } from '../../services';

type Timespan = Omit<ICharge<Date>, 'value_exc_vat' | 'value_inc_vat'>;
type BarData = { charge: ICharge<Date>; date: Date; value: number } & TariffWithProduct;

@Component({
    selector: 'unit-rates-chart',
    templateUrl: './unit-rates-chart.component.html',
})
export class UnitRatesChartComponent {
    constructor(private octopusService: OctopusService) {}

    private chargeType: LinkRel = 'standard_unit_rates';

    private chargesLookup: Partial<Record<string, ICharge<Date>[]>> = {};

    public get timePeriods(): ReadonlyArray<TimePeriod> {
        return TimePeriods;
    }

    private _period: TimePeriod = defaultPeriod;

    public get selectedPeriod(): TimePeriod {
        return this._period;
    }

    public set selectedPeriod(value: TimePeriod) {
        this._period = value;

        this.loadTariffs();
    }

    private _includeVat: IncludeVat = defaultInclVat;

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

    private _unitRatesConfig: ChartConfiguration<'bar', BarData[]> | undefined;

    public get unitRatesConfig(): ChartConfiguration<'bar', BarData[]> | undefined {
        return this._unitRatesConfig;
    }

    private updateUnitRatesChart() {
        this._unitRatesConfig = {
            type: 'bar',
            options: {
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        ...Chart.defaults.plugins.tooltip,
                        callbacks: {
                            title: (items) => {
                                return items.map((item) => getSpanLabel((item.raw as BarData).charge));
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
                            callback: (_value, index, ticks) => {
                                const tick = ticks[index];
                                return tick.major ? formatDateString(new Date(tick.value)) : undefined;
                            },
                        },
                    },
                },
            },
            data: {
                datasets: getChartSerieses(this.tariffs, this.includeVat)
                    .map((series) => {
                        const charges = this.chargesLookup[series.tariff.code];

                        if (charges == null) {
                            return undefined;
                        }

                        return {
                            data: charges.map((charge) => ({
                                date: charge.valid_from,
                                value: series.incVat ? charge.value_inc_vat : charge.value_exc_vat,
                                charge,
                                tariff: series.tariff,
                                product: series.product,
                            })),
                            label: `${series.tariff.code} ${series.incVat ? 'Incl. Vat' : 'Excl. Vat'}`,
                        };
                    })
                    .filter(isDefined),
            },
        };
    }

    private loadTariffs() {
        this.chargesLookup = {};
        this.updateUnitRatesChart();

        // TODO
        const now = new Date();
        let start: number;

        const day = 3600 * 1000 * 24;

        switch (this.selectedPeriod) {
            case 'Day':
                start = now.getTime() - day;
                break;
            case 'Week':
                start = now.getTime() - day * 7;
                break;

            case 'Month':
                start = now.getTime() - day * 28;
                break;
        }

        this._tariffs.forEach((tariff) => this.loadCharges(tariff, new Date(start), now));
    }

    private async loadCharges(tariffAndProduct: TariffWithProduct, periodFrom: Date, periodTo: Date) {
        if (tariffAndProduct.tariff.links.every((link) => link.rel != this.chargeType)) {
            return;
        }

        const values = await this.octopusService.loadCharges({
            product: tariffAndProduct.product,
            tariff: tariffAndProduct.tariff,
            register: 'electricity-tariffs', // TODO
            chargeType: this.chargeType,
            pageSize: 1500,
            periodFrom,
            periodTo,
        });

        this.chargesLookup[tariffAndProduct.tariff.code] = values;

        this.updateUnitRatesChart();
    }
}

function formatDateString(date: Date): string {
    return date.toDateString();
}

function getSpanLabel(span: Timespan): string {
    const time = `${format(span.valid_from, 'HH:mm')} - ${format(span.valid_to, 'HH:mm')}`;

    return `${formatDateString(span.valid_from)} ${time}`;
}
