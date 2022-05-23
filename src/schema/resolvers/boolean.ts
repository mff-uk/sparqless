import { Literal } from '@rdfjs/types';
import { FieldResolver } from 'nexus';

/**
 * Resolver factory for booleans.
 */
export function createBooleanResolver(resolverConfig: {
    isArrayType: boolean;
}): FieldResolver<string, string> {
    return async (parent, _args, _context, info) => {
        const values: { value: Literal }[] = parent[info.fieldName];
        if (!values) {
            return undefined;
        }

        const booleanValues = values.map((x) =>
            ['true', '1'].includes(String(x.value.value)),
        );

        if (resolverConfig.isArrayType) {
            return booleanValues;
        }

        return booleanValues[0];
    };
}
