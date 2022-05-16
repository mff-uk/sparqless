import { Literal } from '@rdfjs/types';
import { FieldResolver } from 'nexus';

export function createIntResolver(resolverConfig: {
    isArrayType: boolean;
}): FieldResolver<string, string> {
    return async (parent, _args, _context, info) => {
        const values: { value: Literal }[] = parent[info.fieldName];
        if (!values) {
            return undefined;
        }

        const intValues = values.map((x) => parseInt(x.value.value));

        if (resolverConfig.isArrayType) {
            return intValues;
        }

        return intValues[0];
    };
}
