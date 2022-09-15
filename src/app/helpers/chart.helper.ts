import { ChartSeries, IncludeVat, TariffWithProduct } from '../contracts';
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
