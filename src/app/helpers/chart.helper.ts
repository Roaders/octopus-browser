import { ChartSeries, ICharge, IncludeVat, TariffWithProduct } from '../contracts';
import { filterInclVatValues } from './vat.helper';

export function getChartSerieses(tariffs: TariffWithProduct[], includeVat: IncludeVat): ChartSeries[] {
    const inclVatValues = (['Vat Incl.', 'Vat Excl.'] as const).filter((value) =>
        filterInclVatValues(value, includeVat)
    );

    return tariffs.reduce(
        (serieses, series) => [
            ...serieses,
            ...inclVatValues.map((value) => ({ ...series, incVat: value === 'Vat Incl.' })),
        ],
        new Array<ChartSeries>()
    );
}

export function getTimes(periodFrom: Date, periodTo: Date, interval = 60000): Date[] {
    const times: Date[] = [periodFrom];

    let last = periodFrom.getTime();

    while (last < periodTo.getTime()) {
        last += interval;

        times.push(new Date(last));
    }

    if (last != periodTo.getTime()) {
        times.push(periodTo);
    }

    return times;
}

// This is not the most performant way of doing this as we iterate through the whole charge array each time
// Performance shouldn't be an issue though so we will leave it as is for now
export function mapDateToCharge(date: Date, charges: ICharge<Date>[]): ICharge<Date> | undefined {
    return charges.find(
        (charge) => charge.valid_from.getTime() <= date.getTime() && charge.valid_to.getTime() >= date.getTime()
    );
}
