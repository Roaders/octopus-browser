import { Component, Input } from '@angular/core';

import { IProduct } from '../../contracts';

@Component({
    selector: 'selected-product',
    templateUrl: './selected-product.component.html',
})
export class SelectedProductComponent {
    @Input()
    public product?: IProduct;
}
