import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'yesNo' })
export class YesNoPipe implements PipeTransform {
    public transform(value?: boolean): string {
        switch (value) {
            case true:
                return 'Yes';
            case false:
                return 'No';
            default:
                return '';
        }
    }
}
