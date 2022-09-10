import { Component, Input } from '@angular/core';

import { ITariff } from '../../contracts';

@Component({
    selector: 'selected-tariff',
    templateUrl: './selected-tariff.component.html',
})
export class SelectedTariffComponent {
    @Input()
    public tariff?: ITariff;
}
