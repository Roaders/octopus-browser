import { IncludeVat, IRegion, TimePeriod } from './contracts';

export const PRODUCTS_URI = `https://api.octopus.energy/v1/products`;
export const PRODUCT_URI = `https://api.octopus.energy/v1/products/{code}/`;
export const CHARGES_URI = `https://api.octopus.energy/v1/products/{productCode}/{register}/{tariffCode}/{chargeType}/`;

export const defaultInclVat: IncludeVat = 'incl';
export const defaultPeriod: TimePeriod = 'Week';

export const checkboxKeys = [
    'variable',
    'green',
    'tracker',
    'prepay',
    'business',
    'restricted',
    'import',
    'export',
] as const;

export type CheckboxKey = typeof checkboxKeys[number];

export const Regions: IRegion[] = [
    { code: 'A', MPAN: 10, name: 'Eastern England' },
    { code: 'B', MPAN: 11, name: 'East Midlands' },
    { code: 'C', MPAN: 12, name: 'London' },
    { code: 'D', MPAN: 13, name: 'Merseyside and Northern Wales' },
    { code: 'E', MPAN: 14, name: 'West Midlands' },
    { code: 'F', MPAN: 15, name: 'North Eastern England' },
    { code: 'G', MPAN: 16, name: 'North Western England' },
    { code: 'H', MPAN: 20, name: 'Southern England' },
    { code: 'J', MPAN: 19, name: 'South Eastern England' },
    { code: 'K', MPAN: 21, name: 'Southern Wales' },
    { code: 'L', MPAN: 22, name: 'South Western England' },
    { code: 'M', MPAN: 23, name: 'Yorkshire' },
    { code: 'N', MPAN: 18, name: 'Southern Scotland' },
    { code: 'P', MPAN: 17, name: 'Northern Scotland' },
];

export const HexLookup: Record<IncludeVat, string> = {
    both: '',
    excl: '#FF7F50',
    incl: '#6495ED',
};
