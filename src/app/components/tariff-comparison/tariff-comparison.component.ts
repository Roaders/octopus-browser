import { Component, Input } from '@angular/core';

import { ICharge, TariffWithProduct } from '../../contracts';
import { OctopusService } from '../../services';

@Component({
    selector: 'tariff-comparison',
    templateUrl: './tariff-comparison.component.html',
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

        this.loadTariffs();
    }

    public getValues(tariffCode: string, rel: string): ICharge<Date>[] {
        const values = this.charges[tariffCode]?.[rel];
        return Array.isArray(values) ? values : [];
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
                register: 'electricity-tariffs',
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
