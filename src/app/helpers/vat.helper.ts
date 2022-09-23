import { IncludeVat } from '../contracts';

export function filterInclVatValues(value: IncludeVat, includeVat: IncludeVat): boolean {
    switch (value) {
        case 'excl':
            return includeVat != 'incl';
        case 'incl':
            return includeVat != 'excl';
        default:
            return true;
    }
}

export function getDisplayValue(value: IncludeVat): string {
    switch (value) {
        case 'both':
            return 'Show Both';
        case 'excl':
            return 'Vat Excl.';
        case 'incl':
            return 'Vat Incl.';
    }
}
