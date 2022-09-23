import { Injectable } from '@morgan-stanley/needle';

import { arraysMatch } from './compare.helper';

const urlParamRegExp = /(\?|&)([^=]+)=([^&]+)/g;

@Injectable()
export class UrlHelper {
    public getMultipleParams(paramName: string): string[] {
        const matches: { key: string; value: string }[] = [];

        let match = urlParamRegExp.exec(window.location.search);

        while (match != null) {
            matches.push({ key: match[2], value: match[3] });

            match = urlParamRegExp.exec(window.location.search);
        }

        return matches.filter((match) => match.key === paramName).map((match) => decodeURIComponent(match.value));
    }

    public getSingleParam(paramName: string): string | undefined {
        return this.getMultipleParams(paramName)[0];
    }

    public saveUrlParam(paramName: string, value: string | string[]) {
        const existingValues = this.getMultipleParams(paramName);
        const values = Array.isArray(value) ? value : [value];

        if (!arraysMatch(existingValues, values)) {
            const url = new URL(window.location.href);
            values.forEach((value) => {
                url.searchParams.set(paramName, value);
            });

            window.history.replaceState({}, '', url);
        }
    }
}
