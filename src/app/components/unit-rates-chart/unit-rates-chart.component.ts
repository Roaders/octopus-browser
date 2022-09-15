import 'chartjs-adapter-date-fns';

import { Component, Input } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { format } from 'date-fns';

import { defaultInclVat } from '../../constants';
import { ICharge, IncludeVat, LinkRel, TariffWithProduct } from '../../contracts';
import { filterInclVatValues, isDefined } from '../../helpers';
import { OctopusService } from '../../services';

type Timespan = Omit<ICharge<Date>, 'value_exc_vat' | 'value_inc_vat'>;
type BarData = { charge: ICharge<Date>; date: Date; value: number } & TariffWithProduct;
type UnitRateSeries = TariffWithProduct & { charges: ICharge<Date>[]; incVat: boolean };

@Component({
    selector: 'unit-rates-chart',
    templateUrl: './unit-rates-chart.component.html',
})
export class UnitRatesChartComponent {
    constructor(private octopusService: OctopusService) {}

    private charges: Partial<Record<string, Partial<Record<LinkRel, ICharge<Date>[]>>>> = {};

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
                            callback: (value, index, ticks) => {
                                const tick = ticks[index];
                                console.log(value, ticks[index]);
                                return tick.major ? formatDateString(new Date(tick.value)) : undefined;
                            },
                        },
                    },
                },
            },
            data: {
                datasets: this.getUnitRateSerieses()
                    .map((series) => {
                        if (series == null) {
                            return undefined;
                        }

                        return {
                            data: series.charges.map((charge) => ({
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

    private getUnitRateSerieses(): UnitRateSeries[] {
        const inclVatValues = (['Vat Incl.', 'Vat Excl.'] as const).filter((value) =>
            filterInclVatValues(value, this.includeVat)
        );

        return this.tariffs
            .map((tariffWithProduct) => {
                const charges = this.charges[tariffWithProduct.tariff.code]?.['standard_unit_rates'];

                if (charges == null) {
                    return undefined;
                }

                return { ...tariffWithProduct, charges };
            })
            .filter(isDefined)
            .reduce(
                (serieses, series) => [
                    ...serieses,
                    ...inclVatValues.map((value) => ({ ...series, incVat: value === 'Vat Incl.' })),
                ],
                new Array<UnitRateSeries>()
            );
    }

    private loadTariffs() {
        this._tariffs.forEach((tariff) => this.loadCharges(tariff));
    }

    private async loadCharges(tariffAndProduct: TariffWithProduct) {
        tariffAndProduct.tariff.links.forEach(async (link) => {
            const now = new Date();
            const start = now.getTime() - 3600 * 1000 * 24 * 10;

            const values = await this.octopusService.loadCharges({
                product: tariffAndProduct.product,
                tariff: tariffAndProduct.tariff,
                register: 'electricity-tariffs', // TODO
                chargeType: link.rel,
                pageSize: 1500,
                periodFrom: new Date(start),
                periodTo: now,
            });

            const tariffLinkLookup = (this.charges[tariffAndProduct.tariff.code] =
                this.charges[tariffAndProduct.tariff.code] || {});

            tariffLinkLookup[link.rel] = values;

            this.updateUnitRatesChart();
        });
    }
}

function formatDateString(date: Date): string {
    return date.toDateString();
}

function getSpanLabel(span: Timespan): string {
    const time = `${format(span.valid_from, 'HH:mm')} - ${format(span.valid_to, 'HH:mm')}`;

    return `${formatDateString(span.valid_from)} ${time}`;
}
