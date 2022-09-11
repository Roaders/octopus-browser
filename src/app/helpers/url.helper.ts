import { Injectable } from '@morgan-stanley/needle';

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
}
