import { GraphQLResolveInfo } from 'graphql';
import { FieldResolver } from 'nexus';
import { Config } from '../../api/config';
import { AssociationDescriptor } from '../../models/association';
import { EndpointClient } from '../../observation/client';
import { objectIriComparator } from '../utils';
import { addSortLimitOffsetArgs } from './array_args';
import { createClassResolver } from './class';

interface AssociationResolverConfig {
    associationDescriptor: AssociationDescriptor;
    isArrayType: boolean;
}

/**
 * Resolver factory for associations, i.e. fields which refer to other classes.
 */
export function createAssociationResolver(
    resolverConfig: AssociationResolverConfig,
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

        const instanceIris: string[] = values.map((x: any) => x.value.value);

        const resolvedInstances: any[] = [];
        for (const instanceIri of instanceIris) {
            const typeIri = await resolveTargetClassType(
                instanceIri,
                resolverConfig,
                config,
            );
            if (!typeIri) {
                continue;
            }

            const targetClassDescriptor =
                resolverConfig.associationDescriptor.targetClasses.find(
                    (x) => x.iri === typeIri,
                )!;

            const resolvedInstance = await createClassResolver(
                targetClassDescriptor,
                {
                    isArrayType: false,
                    areFieldsOptional: true,
                    instanceIri: instanceIri,
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
        objectIriComparator,
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
    instanceIri: string,
    resolverConfig: AssociationResolverConfig,
    config: Config,
): Promise<string | undefined> {
    const typeQuery = `
    SELECT ?class
    WHERE
    {
        GRAPH ?g {
            VALUES ( ?class )
            {
                ${resolverConfig.associationDescriptor.targetClasses
                    .map((x) => `( <${x.iri}> )`)
                    .join('\n')}
            }
            <${instanceIri}> a ?class .
        }
    }
    LIMIT 1`;
    const typeResults = await new EndpointClient(
        config.endpoint,
        config.logger,
    ).runSelectQuery(typeQuery);

    const typeIri: string | undefined = typeResults.map(
        (bindings) => bindings.class.value,
    )[0];

    return typeIri;
}
