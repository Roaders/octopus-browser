import { Component, Input } from '@angular/core';

import { ICharge, ITariff, LinkRel, TariffWithProduct } from '../../contracts';
import { isDefined } from '../../helpers';
import { OctopusService } from '../../services';

type BarChartValue = { name: string | Date | number; value: number };
type GroupedBarChartValue = { name: string | Date | number; series: BarChartValue[] };
type ChartDimensions = [number, number];

const standingChartBarWidth = 400;
const standingChargesHeight = 300;

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

    public getValues(tariffCode: string, rel: LinkRel): ICharge<Date>[] {
        const values = this.charges[tariffCode]?.[rel];
        return Array.isArray(values) ? values : [];
    }

    private _unitRatesData: GroupedBarChartValue[] = [];

    public get unitRatesData(): GroupedBarChartValue[] {
        return this._unitRatesData;
    }

    private _standingChargesData: GroupedBarChartValue[] = [];

    public get standingChargesData(): GroupedBarChartValue[] {
        return this._standingChargesData;
    }

    private _standingChargesDimensions: ChartDimensions = [standingChartBarWidth, standingChargesHeight];

    public get standingChargesDimensions(): ChartDimensions {
        return this._standingChargesDimensions;
    }

    private updateUnitRatesChart() {
        const timeSpans = this.getTimeSpans();

        const seriesLookup = this.tariffs
            .map(({ tariff }) => tariff)
            .reduce(
                (lookup, tariff) => lookup.set(tariff.code, this.getUnitRateSeries(tariff)),
                new Map<string, BarChartValue[] | undefined>()
            );

        this._unitRatesData = timeSpans
            .map((span, index) => {
                return {
                    name: span.valid_from.getTime(),
                    series: this.tariffs
                        .map(({ tariff }) => tariff)
                        .map((tariff) => seriesLookup.get(tariff.code)?.[index])
                        .filter(isDefined),
                };
            })
            .filter(isDefined);
    }

    private getTimeSpans(): Omit<ICharge<Date>, 'value_exc_vat' | 'value_inc_vat'>[] {
        const tariff = this.tariffs[0]; // TODO

        const charges = this.charges[tariff.tariff.code]?.['standard_unit_rates']; // TODO

        return charges?.map(({ valid_from, valid_to }) => ({ valid_from, valid_to })) ?? [];
    }

    private getUnitRateSeries(tariff: ITariff): BarChartValue[] | undefined {
        const charges = this.charges[tariff.code]?.['standard_unit_rates']; // TODO

        if (charges == null) {
            return undefined;
        }

        return charges.map((charge) => ({
            name: tariff.code,
            value: charge.value_inc_vat,
        }));
    }

    private updateStandingChargesChart() {
        this._standingChargesData = this._tariffs
            .map(({ tariff }) => tariff)
            .map((tariff) => ({
                name: tariff.code,
                series: [
                    { name: 'inc vat', value: tariff.standing_charge_inc_vat },
                    { name: 'ex vat', value: tariff.standing_charge_exc_vat },
                ],
            }));

        this._standingChargesDimensions = [this._tariffs.length + 2 * standingChartBarWidth, standingChargesHeight];
    }

    private loadTariffs() {
        this._tariffs.forEach((tariff) => this.loadCharges(tariff));
    }

    private async loadCharges(tariffAndProduct: TariffWithProduct) {
        tariffAndProduct.tariff.links.forEach(async (link) => {
            console.log(`loadCharges: ${link.href}`);

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
