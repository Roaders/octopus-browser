import { Component, Input } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { format } from 'date-fns';

import { ICharge, ITariff, LinkRel, TariffWithProduct } from '../../contracts';
import { isDefined } from '../../helpers';
import { OctopusService } from '../../services';

type Timespan = Omit<ICharge<Date>, 'value_exc_vat' | 'value_inc_vat'>;
type BarData = { charge: ICharge<Date>; dateLabel: string } & TariffWithProduct;

@Component({
    selector: 'tariff-comparison',
    templateUrl: './tariff-comparison.component.html',
    styleUrls: ['./tariff-comparison.component.scss'],
})
export class TariffComparisonComponent {
    constructor(private octopusService: OctopusService) {}

    private charges: Partial<Record<string, Partial<Record<LinkRel, ICharge<Date>[]>>>> = {};

    private _tariffs: TariffWithProduct[] = [];

    @Input()
    public get tariffs(): TariffWithProduct[] {
        return this._tariffs;
    }

    public set tariffs(value: TariffWithProduct[]) {
        this._tariffs = value;

        this.updateStandingChargesChart();
        this.updateUnitRatesChart();
        this.loadTariffs();
    }

    private _unitRatesConfig: ChartConfiguration<'bar', BarData[]> | undefined;

    public get unitRatesConfig(): ChartConfiguration<'bar', BarData[]> | undefined {
        return this._unitRatesConfig;
    }

    private _standingChargesConfig: ChartConfiguration<'bar'> | undefined;

    public get standingChargesConfig(): ChartConfiguration<'bar'> | undefined {
        return this._standingChargesConfig;
    }

    private updateUnitRatesChart() {
        const seriesLookup = this.tariffs.reduce(
            (lookup, tariffWithProduct) =>
                lookup.set(tariffWithProduct.tariff.code, this.getUnitRateSeries(tariffWithProduct.tariff)),
            new Map<string, ICharge<Date>[] | undefined>()
        );

        this._unitRatesConfig = {
            type: 'bar',
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                    },
                    tooltip: {
                        ...Chart.defaults.plugins.tooltip,
                        callbacks: {
                            title: (items) => {
                                return items.map((item) => {
                                    console.log(item);
                                    return getSpanLabel((item.raw as BarData).charge);
                                });
                            },
                        },
                    },
                },

                parsing: {
                    xAxisKey: 'dateLabel',
                    yAxisKey: 'charge.value_inc_vat',
                },
            },
            data: {
                labels: seriesLookup
                    .get(this.tariffs[0].tariff.code)
                    ?.map((span, index, spans) => getSpanLabel(span, spans[index - 1])),
                datasets: this.tariffs
                    .map((tariffWithProduct) => {
                        const series = seriesLookup.get(tariffWithProduct.tariff.code);

                        if (series == null) {
                            return undefined;
                        }

                        return {
                            data: series.map((charge, index, charges) => ({
                                dateLabel: getSpanLabel(charge, charges[index - 1]),
                                charge,
                                ...tariffWithProduct,
                            })),
                            label: tariffWithProduct.tariff.code,
                        };
                    })
                    .filter(isDefined),
            },
        };
    }

    private getUnitRateSeries(tariff: ITariff): ICharge<Date>[] | undefined {
        return this.charges[tariff.code]?.['standard_unit_rates']; // TODO
    }

    private updateStandingChargesChart() {
        this._standingChargesConfig = {
            type: 'bar',
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                    },
                },
            },
            data: {
                labels: this.tariffs.map((value) => value.tariff.code),
                datasets: [
                    { data: this.tariffs.map((value) => value.tariff.standing_charge_inc_vat), label: 'Incl. Vat' },
                    { data: this.tariffs.map((value) => value.tariff.standing_charge_exc_vat), label: 'Excl. Vat' },
                ],
            },
        };
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

function getSpanLabel(span: Timespan, previous?: Timespan): string {
    const time = `${format(span.valid_from, 'HH:mm')} - ${format(span.valid_to, 'HH:mm')}`;
    const date = span.valid_from.toDateString();
    if (previous != null && getSpanLabel(previous).indexOf(date) === 0) {
        return time;
    }

    return `${date} ${time}`;
}
