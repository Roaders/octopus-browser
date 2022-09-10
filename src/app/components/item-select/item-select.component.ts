import { Component, Input } from '@angular/core';

import { SelectedItemHelper } from '../../helpers';

@Component({
    selector: 'item-select',
    templateUrl: './item-select.component.html',
})
export class ItemSelectComponent<T> {
    @Input()
    public selectionHelper!: SelectedItemHelper<T>;
}
