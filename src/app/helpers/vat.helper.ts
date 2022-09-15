import { IncludeVat } from '../contracts';

export function filterInclVatValues(value: IncludeVat, includeVat: IncludeVat): boolean {
    switch (value) {
        case 'Vat Excl.':
            return includeVat != 'Vat Incl.';
        case 'Vat Incl.':
            return includeVat != 'Vat Excl.';
        default:
            return true;
    }
}
