import { Injectable } from '@morgan-stanley/needle';
import { firstValueFrom, from, mergeMap, Observable, shareReplay } from 'rxjs';
import * as format from 'string-template';

import { PRODUCT_URI, PRODUCTS_URI } from '../constants';
import { IProduct, IProductsResponse } from '../contracts';

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

    public async getProductAsync(code: string): Promise<IProduct> {
        const response = await fetch(format(PRODUCT_URI, { code }));

        return response.json();
    }
}
