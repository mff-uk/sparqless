import { Literal } from '@rdfjs/types';
import { GraphQLResolveInfo } from 'graphql';
import { FieldResolver } from 'nexus';
import { addSortLimitOffsetArgs } from './array_args';

export function createIntResolver(resolverConfig: {
    isArrayType: boolean;
}): FieldResolver<string, string> {
    const resolver = async (
        parent: any,
        _args: any,
        _context: any,
        info: GraphQLResolveInfo,
    ) => {
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

    return addSortLimitOffsetArgs(resolver, (a, b) => a - b, resolverConfig);
}
