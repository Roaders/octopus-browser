export interface IProductsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: IProduct[];
}

export interface IProduct {
    code: string;
    full_name: string;
    display_name: string;
    description: string;
    is_variable: boolean;
    is_green: boolean;
    is_tracker: boolean;
    is_prepay: boolean;
    is_business: boolean;
    is_restricted: boolean;
    /**
     * term in months
     */
    term: number;
    brand: string;
    available_from: string | null;
    available_to: string | null;
    // undocumented (might disappear)
    direction?: 'IMPORT' | 'EXPORT' | null;
    links: [ILink<'self'>];
}

export interface ITariff {
    code: string;
    standard_unit_rate_exc_vat: number;
    standard_unit_rate_inc_vat: number;
    standing_charge_exc_vat: number;
    standing_charge_inc_vat: number;
    online_discount_exc_vat: number;
    online_discount_inc_vat: number;
    dual_fuel_discount_exc_vat: number;
    dual_fuel_discount_inc_vat: number;
    exit_fees_exc_vat: number;
    exit_fees_inc_vat: number;
    exit_fees_type: string;
}

export type BillingType = `direct_debit_monthly` | `direct_debit_quarterly`;

export type TariffBillingRecord = Partial<Record<BillingType, ITariff>>;
export type TariffRegisterRecord = Record<`_${RegionCode}`, TariffBillingRecord>;

export interface IProductRegisters {
    single_register_electricity_tariffs: TariffRegisterRecord | Record<string, never>;
    dual_register_electricity_tariffs: TariffRegisterRecord | Record<string, never>;
    single_register_gas_tariffs: TariffRegisterRecord | Record<string, never>;
}

export interface IRegister {
    code: keyof IProductRegisters;
    values: TariffRegisterRecord;
}

export interface IProductDetail extends IProduct, IProductRegisters {
    tariffs_active_at: string;
}

export interface ILink<TRel extends string = string> {
    href: string;
    method: string;
    rel: TRel;
}

export const RegionCodes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P'] as const;

export type RegionCode = typeof RegionCodes[number];

export interface IRegion {
    code: RegionCode;
    MPAN: number;
    name: string;
}
