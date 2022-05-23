import { GraphQLResolveInfo } from 'graphql';
import { FieldResolver } from 'nexus';
import { Config } from '../../api/config';
import { AssociationDescriptor } from '../../models/association';
import { EndpointClient } from '../../observation/client';
import { addSortLimitOffsetArgs } from './array_args';
import { createClassResolver } from './class';

/**
 * Resolver factory for associations, i.e. fields which refer to other classes.
 */
export function createAssociationResolver(
    resolverConfig: {
        associationDescriptor: AssociationDescriptor;
        isArrayType: boolean;
    },
    config: Config,
): FieldResolver<string, string> {
    const resolver = async (
        parent: any,
        args: any,
        context: any,
        info: GraphQLResolveInfo,
    ) => {
        const values = parent[info.fieldName];
        if (!values) {
            return undefined;
        }

        const instanceIRIs: string[] = values.map((x: any) => x.value.value);

        const resolvedInstances: any[] = [];
        for (const instanceIRI of instanceIRIs) {
            const typeIRI = await resolveTargetClassType(
                instanceIRI,
                resolverConfig,
                config,
            );
            if (!typeIRI) {
                continue;
            }

            const targetClassDescriptor =
                resolverConfig.associationDescriptor.targetClasses.find(
                    (x) => x.iri === typeIRI,
                )!;

            const resolvedInstance = await createClassResolver(
                targetClassDescriptor,
                {
                    isArrayType: false,
                    areFieldsOptional: true,
                    instanceIri: instanceIRI,
                },
                config,
            )(parent, args, context, info);
            resolvedInstance['__typename'] = targetClassDescriptor.name;

            resolvedInstances.push(resolvedInstance);
        }

        if (resolverConfig.isArrayType) {
            return resolvedInstances;
        }

        return resolvedInstances[0];
    };

    return addSortLimitOffsetArgs(
        resolver,
        (a, b) => {
            if (a._rdf_iri < b._rdf_iri) {
                return -1;
            }

            if (a._rdf_iri > b._rdf_iri) {
                return 1;
            }

            return 0;
        },
        resolverConfig,
    );
}

/**
 * For a class instance with a given IRI, query
 * the SPARQL endpoint to check the actual type
 * of this instance. This is because some associations
 * may have multiple target types, so we need to find out
 * which type the instance actually belongs to.
 */
async function resolveTargetClassType(
    instanceIRI: string,
    resolverConfig: {
        associationDescriptor: AssociationDescriptor;
        isArrayType: boolean;
    },
    config: Config,
): Promise<string | undefined> {
    const typeQuery = `
    SELECT ?class
    WHERE
    {
        VALUES ( ?class )
        {
            ${resolverConfig.associationDescriptor.targetClasses
                .map((x) => `( <${x.iri}> )`)
                .join('\n')}
        }
        <${instanceIRI}> a ?class .
    }
    LIMIT 1`;
    const typeResults = await new EndpointClient(
        config.endpoint,
        config.logger,
    ).runSelectQuery(typeQuery);

    const typeIRI: string | undefined = typeResults.map(
        (bindings) => bindings.class.value,
    )[0];

    return typeIRI;
}
