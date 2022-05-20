import { FieldResolver } from 'nexus';

/**
 * Resolver decorator which adds server-side support
 * for `limit`, `offset`, `sort` and `filter` arguments.
 *
 * These arguments must be defined in the field configuration
 * in order to be visible in the schema.
 *
 * @param innerResolver Resolver function to decorate.
 * @param comparatorFunc If the `sort` argument is defined,
 * this function will be used as a comparator. It should sort
 * the elements in ASCENDING order.
 * @returns The inner resolver decorated with additional
 * argument support.
 */
export function addSortLimitOffsetArgs(
    innerResolver: FieldResolver<string, string>,
    comparatorFunc: (a: any, b: any) => number,
    resolverConfig: {
        isArrayType: boolean;
    },
): FieldResolver<string, string> {
    return async (parent, args, context, info) => {
        let result = await innerResolver(parent, args, context, info);

        if (!resolverConfig.isArrayType) {
            return result;
        }

        if (!Array.isArray(result)) {
            return result;
        }

        if (args.filter) {
            result = result.filter((x) => x._rdf_iri === args.filter);
        }

        if (args.sort && !['ASC', 'DESC'].includes(args.sort)) {
            throw new Error(
                `Invalid sort direction: ${args.sort}. Allowed values are ASC and DESC.`,
            );
        }

        if (args.sort) {
            const comparator =
                args.sort === 'ASC'
                    ? comparatorFunc
                    : (a: any, b: any) => comparatorFunc(b, a);

            result.sort(comparator);
        }

        if (args.offset) {
            result = result.slice(parseInt(args.offset));
        }

        if (args.limit) {
            result = result.slice(0, parseInt(args.limit));
        }

        return result;
    };
}
