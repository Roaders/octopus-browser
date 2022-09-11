import { Injectable } from '@morgan-stanley/needle';
import { firstValueFrom, from, map, mergeMap, Observable, shareReplay } from 'rxjs';
import * as format from 'string-template';

import { CHARGES_URI, PRODUCT_URI, PRODUCTS_URI, Regions } from '../constants';
import {
    ChargesResponse,
    ChargeType,
    ICharge,
    IProduct,
    IProductDetail,
    IProductsResponse,
    IRegion,
    ITariff,
    LinkRel,
} from '../contracts';

@Injectable()
export class OctopusService {
    private _productsStream?: Observable<IProductsResponse>;

    public getProductsAsync(): Promise<IProduct[]> {
        if (this._productsStream == null) {
            this._productsStream = from(fetch(PRODUCTS_URI)).pipe(
                mergeMap((response) => response.json()),
                shareReplay()
            );
        }

        return firstValueFrom(this._productsStream.pipe(map((response) => response.results)));
    }

    public async getProductAsync(product: IProduct): Promise<IProductDetail<Date>> {
        const response = await fetch(format(PRODUCT_URI, { code: product.code }));
        const productStringDetail: IProductDetail = await response.json();

        return {
            ...product,
            ...productStringDetail,
            available_from: parseDate(productStringDetail.available_from),
            available_to: new Date(),
            tariffs_active_at: new Date(),
        };
    }

    public async getRegionsAsync(): Promise<IRegion[]> {
        return Regions;
    }

    public async loadCharges(request: {
        product: IProduct<Date>;
        tariff: ITariff;
        register: 'electricity-tariffs' | 'gas-tariffs';
        chargeType: LinkRel | ChargeType;
    }): Promise<ICharge<Date>[]> {
        let chargeType: ChargeType;

        switch (request.chargeType) {
            case 'day_unit_rates':
                chargeType = 'day-unit-rates';
                break;
            case 'night_unit_rate':
                chargeType = 'night-unit-rate';
                break;
            case 'standard_unit_rates':
                chargeType = 'standard-unit-rates';
                break;
            case 'standing_charges':
                chargeType = 'standing-charges';
                break;
            default:
                chargeType = request.chargeType;
        }

        const urlParams = {
            productCode: request.product.code,
            register: request.register,
            tariffCode: request.tariff.code,
            chargeType,
        };
        const url = format(CHARGES_URI, urlParams);

        console.log(`loadCharges`, url);

        const response: ChargesResponse = await fetch(url).then((r) => r.json());
        const results = response.results;

        return results.map((result) => ({
            ...result,
            valid_from: parseDate(result.valid_from),
            valid_to: parseDate(result.valid_to),
        }));
    }
}
function parseDate(value: string): Date;
function parseDate(value: string | null): Date | null;
function parseDate(value: string | null): Date | null {
    if (value == null) {
        return null;
    }
    return new Date(value);
}
