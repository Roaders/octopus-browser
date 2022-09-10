import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'date' })
export class DatePipe implements PipeTransform {
    public transform(value?: Date): string {
        if (value == null) {
            return '';
        }

        return value.toDateString();
    }
}
