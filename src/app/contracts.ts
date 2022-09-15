export const IncludeVatValues = ['Vat Incl.', 'Vat Excl.', 'Show Both'] as const;
export type IncludeVat = typeof IncludeVatValues[number];

export const TimePeriods = ['Day', 'Week', 'Month'] as const;
export type TimePeriod = typeof TimePeriods[number];

export type TariffWithProduct = { tariff: ITariff; product: IProductDetail<Date> };

export type ChartSeries = TariffWithProduct & { incVat: boolean };

export interface IProductsResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: IProduct[];
}

export type DateOrString = Date | string;

export interface IProduct<TDate extends DateOrString = string> {
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
    available_from: TDate | null;
    available_to: TDate | null;
    // undocumented (might disappear)
    direction?: 'IMPORT' | 'EXPORT' | null;
    links: [ILink<'self'>];
}

export type LinkRel = 'standing_charges' | 'standard_unit_rates' | 'day_unit_rates' | 'night_unit_rate';
export type ChargeType = 'standing-charges' | 'standard-unit-rates' | 'day-unit-rates' | 'night-unit-rate';

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
    links: ILink<LinkRel>[];
}

export type BillingType = keyof IBillingTypes;

export interface IBillingType {
    type: BillingType;
    tariff: ITariff;
}

export interface IBillingTypes {
    direct_debit_monthly: ITariff;
    direct_debit_quarterly: ITariff;
    prepayment: ITariff;
}

export type TariffBillingRecord = Partial<IBillingTypes>;
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

export interface IProductDetail<TDate extends DateOrString = string> extends IProduct<TDate>, IProductRegisters {
    tariffs_active_at: TDate;
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

export interface ChargesResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: ICharge[];
}

export interface ICharge<TDate extends DateOrString = string> {
    value_exc_vat: number;
    value_inc_vat: number;
    valid_from: TDate;
    valid_to: TDate;
}

export interface LoadChargesConfig {
    product: IProduct<Date>;
    tariff: ITariff;
    register: 'electricity-tariffs' | 'gas-tariffs';
    chargeType: LinkRel | ChargeType;
    pageSize?: number;
    periodFrom: Date;
    periodTo: Date;
}
