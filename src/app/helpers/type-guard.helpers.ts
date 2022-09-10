import { Regions } from '../constants';
import { IBillingType, IBillingTypes, IRegister, ITariff, TariffRegisterRecord } from '../contracts';

export function isITariff(value: unknown): value is ITariff {
    const tariff = value as ITariff;
    return isObject(tariff) && typeof tariff.code === 'string' && typeof tariff.standard_unit_rate_exc_vat === 'number';
}

export function isIBillingTypes(value: unknown): value is IBillingTypes {
    const types = value as IBillingTypes;
    return isObject(types) && (isITariff(types.direct_debit_monthly) || isITariff(types.direct_debit_quarterly));
}

export function isTariffRegisterRecord(value: unknown): value is TariffRegisterRecord {
    const register = value as TariffRegisterRecord;
    return isObject(register) && Regions.every((region) => isIBillingTypes(register[`_${region.code}`]));
}

export function isIRegister(value: unknown): value is IRegister {
    const register = value as IRegister;

    return isTariffRegisterRecord(register.values);
}

export function isIBillingType(value: unknown): value is IBillingType {
    const register = value as IBillingType;

    return isITariff(register.tariff);
}

function isObject(value: unknown): boolean {
    return value != null && typeof value === 'object';
}
