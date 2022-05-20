import { Literal } from '@rdfjs/types';
import { groupBy } from 'lodash';
import { FieldResolver } from 'nexus';

export function createLangStringResolver(resolverConfig: {
    isArrayType: boolean;
}): FieldResolver<string, string> {
    return async (parent, _args, _context, info) => {
        const foundStrings: { value: Literal }[] = parent[info.fieldName];
        if (!foundStrings) {
            return undefined;
        }

        const languageStrings = groupBy(
            foundStrings.map((x) => x.value),
            (x) => x.language,
        );

        const langStringObject: any = {};

        for (const [language, literals] of Object.entries(languageStrings)) {
            const literalValues = literals.map((x) => x.value);
            const resultValue = resolverConfig.isArrayType
                ? literalValues
                : literalValues[0];
            if (language === '') {
                langStringObject['_no_language'] = resultValue;
            } else {
                langStringObject[language] = resultValue;
            }
        }

        return langStringObject;
    };
}
