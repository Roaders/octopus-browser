import { ChartSeries, ICharge, IncludeVat, TariffWithProduct } from '../contracts';
import { filterInclVatValues } from './vat.helper';

export function getChartSerieses(tariffs: TariffWithProduct[], includeVat: IncludeVat): ChartSeries[] {
    const inclVatValues = (['incl', 'excl'] as const).filter((value) => filterInclVatValues(value, includeVat));

    return tariffs.reduce(
        (serieses, series) => [...serieses, ...inclVatValues.map((value) => ({ ...series, incVat: value === 'incl' }))],
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
