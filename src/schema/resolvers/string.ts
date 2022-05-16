import { Literal } from '@rdfjs/types';
import { FieldResolver } from 'nexus';

export function createStringResolver(resolverConfig: {
    isArrayType: boolean;
}): FieldResolver<string, string> {
    return async (parent, _args, _context, info) => {
        const values: { value: Literal }[] = parent[info.fieldName];
        if (!values) {
            return undefined;
        }

        const stringValues = values.map((x) => x.value.value);

        if (resolverConfig.isArrayType) {
            return stringValues;
        }

        return stringValues[0];
    };
}
