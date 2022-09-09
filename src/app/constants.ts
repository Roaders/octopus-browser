export const PRODUCTS_URI = `https://api.octopus.energy/v1/products`;

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
