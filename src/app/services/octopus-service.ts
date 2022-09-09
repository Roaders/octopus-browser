import { Injectable } from '@morgan-stanley/needle';
import { from, mergeMap, Observable, shareReplay } from 'rxjs';
import { PRODUCTS_URI } from '../constants';
import { IProductResponse } from '../contracts';

@Injectable()
export class OctopusService {
    private _productsStream?: Observable<IProductResponse>;

    public getProductsAsync(): Observable<IProductResponse> {
        if (this._productsStream == null) {
            this._productsStream = from(fetch(PRODUCTS_URI)).pipe(
                mergeMap((response) => response.json()),
                shareReplay()
            );
        }

        return this._productsStream;
    }
}
