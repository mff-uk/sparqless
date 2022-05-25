import { Literal } from '@rdfjs/types';
import { GraphQLResolveInfo } from 'graphql';
import { FieldResolver } from 'nexus';
import { addSortLimitOffsetArgs } from './array_args';

/**
 * Resolver factory for string fields.
 */
export function createStringResolver(resolverConfig: {
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

        const stringValues = values.map((x) => x.value.value);

        if (resolverConfig.isArrayType) {
            return stringValues;
        }

        return stringValues[0];
    };

    return addSortLimitOffsetArgs(
        resolver,
        (a, b) => {
            if (a < b) {
                return -1;
            }
            if (a > b) {
                return 1;
            }
            return 0;
        },
        resolverConfig,
    );
}
