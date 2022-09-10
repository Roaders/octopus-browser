import { IRegister, TariffRegisterRecord } from '../contracts';

export function isTariffRegisterRecord(value: unknown): value is TariffRegisterRecord {
    const register = value as TariffRegisterRecord;
    return register._A != null;
}

export function isIRegister(value: unknown): value is IRegister {
    const register = value as IRegister;

    switch (register.code) {
        case 'dual_register_electricity_tariffs':
        case 'single_register_electricity_tariffs':
        case 'single_register_gas_tariffs':
            return isTariffRegisterRecord(register.values);
    }
}
