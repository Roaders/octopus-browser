import { Injectable } from '@morgan-stanley/needle';
import { IProductResponse } from '../contracts';

@Injectable()
export class OctopusService {
    public async getProductsAsync(): Promise<IProductResponse> {
        const response = await fetch(`https://api.octopus.energy/v1/products`);

        return response.json();
    }
}
