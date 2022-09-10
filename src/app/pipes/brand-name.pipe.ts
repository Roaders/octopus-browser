import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brandName' })
export class BrandNamePipe implements PipeTransform {
    public transform(value = ''): string {
        return value
            .split('_')
            .map((name) => `${name.substring(0, 1).toUpperCase()}${name.substring(1).toLowerCase()}`)
            .join(' ');
    }
}
