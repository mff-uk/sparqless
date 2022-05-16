import { FieldResolver } from 'nexus';
import { Config } from '../../api/config';
import { AssociationDescriptor } from '../../models/association';
import { EndpointClient } from '../../observation/client';
import { createClassResolver } from './class';

export function createAssociationResolver(
    resolverConfig: {
        associationDescriptor: AssociationDescriptor;
        isArrayType: boolean;
    },
    config: Config,
): FieldResolver<string, string> {
    return async (parent, args, context, info) => {
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
                    instanceIRI: instanceIRI,
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
}

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
