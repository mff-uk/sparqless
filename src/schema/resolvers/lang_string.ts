import { Literal } from '@rdfjs/types';
import { groupBy } from 'lodash';
import { FieldResolver } from 'nexus';

/**
 * Resolver factory for language-tagged strings.
 * 
 * A language-tagged string in RDF is a string literal accompanied
 * by a language tag, like so: `"Lazy Fox"@en`. A property
 * may contain language-tagged strings in multiple languages,
 * so this resolver generates objects of the following form:
 * 
 * ```
 * {
 *     en: "Lazy Fox",
 *     cs: "Líná Liška",
 *     es: "Zorro Perezoso",
 * }
 * ```
 */
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
