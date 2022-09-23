import { Regions } from '../constants';
import {
    IBillingType,
    IBillingTypes,
    IncludeVat,
    IRegister,
    ITariff,
    TariffRegisterRecord,
    TimePeriod,
} from '../contracts';

export function isITariff(value: unknown): value is ITariff {
    const tariff = value as ITariff;
    return isObject(tariff) && typeof tariff.code === 'string' && typeof tariff.standard_unit_rate_exc_vat === 'number';
}

export function isIBillingTypes(value: unknown): value is IBillingTypes {
    const types = value as IBillingTypes;
    return isObject(types) && Object.values(types).some(isITariff);
}

export function isTariffRegisterRecord(value: unknown): value is TariffRegisterRecord {
    const register = value as TariffRegisterRecord;
    return isObject(register) && Regions.some((region) => isIBillingTypes(register[`_${region.code}`]));
}

export function isIRegister(value: unknown): value is IRegister {
    const register = value as IRegister;

    return isTariffRegisterRecord(register.values);
}

export function isIBillingType(value: unknown): value is IBillingType {
    const register = value as IBillingType;

    return isITariff(register.tariff);
}

export function isDefined<T>(value: T | null | undefined): value is T {
    return value != null;
}

export function isIncludeVat(value: unknown): value is IncludeVat {
    const inclVat = value as IncludeVat;

    switch (inclVat) {
        case 'both':
        case 'excl':
        case 'incl':
            return true;
        default:
            return false;
    }
}

export function isPeriod(value: unknown): value is TimePeriod {
    const periodValue = value as TimePeriod;

    switch (periodValue) {
        case 'Day':
        case 'Month':
        case 'Week':
            return true;
        default:
            return false;
    }
}

function isObject(value: unknown): boolean {
    return value != null && typeof value === 'object';
}
