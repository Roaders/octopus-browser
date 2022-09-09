export const PRODUCTS_URI = `https://api.octopus.energy/v1/products`;
export const PRODUCT_URI = `https://api.octopus.energy/v1/products/{code}/`;

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
