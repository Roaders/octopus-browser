import { Injectable } from '@morgan-stanley/needle';
import { firstValueFrom, from, mergeMap, Observable, shareReplay } from 'rxjs';
import * as format from 'string-template';

import { PRODUCT_URI, PRODUCTS_URI, Regions } from '../constants';
import { IProduct, IProductDetail, IProductsResponse, IRegion } from '../contracts';

@Injectable()
export class OctopusService {
    private _productsStream?: Observable<IProductsResponse>;

    public getProductsAsync(): Promise<IProductsResponse> {
        if (this._productsStream == null) {
            this._productsStream = from(fetch(PRODUCTS_URI)).pipe(
                mergeMap((response) => response.json()),
                shareReplay()
            );
        }

        return firstValueFrom(this._productsStream);
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
}

function parseDate(value: string | null): Date | null {
    if (value == null) {
        return null;
    }
    return new Date(value);
}
