import { Component, Input } from '@angular/core';

import { ICharge, TariffWithProduct } from '../../contracts';
import { OctopusService } from '../../services';

type BarChartValue = { name: string; value: number };
type GroupedBarChartValue = { name: string; series: BarChartValue[] };
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

    private charges: Record<string, Record<string, ICharge<Date>[]>> = {};

    private _tariffs: TariffWithProduct[] = [];

    @Input()
    public get tariffs(): TariffWithProduct[] {
        return this._tariffs;
    }

    public set tariffs(value: TariffWithProduct[]) {
        this._tariffs = value;

        this.updateStandingChargesChart();
        this.loadTariffs();
    }

    public getValues(tariffCode: string, rel: string): ICharge<Date>[] {
        const values = this.charges[tariffCode]?.[rel];
        return Array.isArray(values) ? values : [];
    }

    private _standingChargesData: GroupedBarChartValue[] = [];

    public get standingChargesData(): GroupedBarChartValue[] {
        return this._standingChargesData;
    }

    private _standingChargesDimensions: ChartDimensions = [standingChartBarWidth, standingChargesHeight];

    public get standingChargesDimensions(): ChartDimensions {
        return this._standingChargesDimensions;
    }

    private updateStandingChargesChart() {
        this._standingChargesData = this._tariffs.map((tariff) => ({
            name: tariff.tariff.code,
            series: [
                { name: 'inc vat', value: tariff.tariff.standing_charge_inc_vat, code: 'incl' },
                { name: 'ex vat', value: tariff.tariff.standing_charge_exc_vat, code: 'excl' },
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

            this.charges[tariffAndProduct.tariff.code] = this.charges[tariffAndProduct.tariff.code] || {};

            this.charges[tariffAndProduct.tariff.code][link.rel] = values;
        });
    }
}
