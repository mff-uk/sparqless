import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { groupBy } from 'lodash';
import { FieldResolver } from 'nexus';
import { Logger } from 'winston';
import { Config } from '../../api/config';
import { ClassDescriptor } from '../../models/class';
import { EndpointClient } from '../../observation/client';

export function createClassResolver(
    classDescriptor: ClassDescriptor,
    resolverConfig: {
        isArrayType: boolean;
        areFieldsOptional: boolean;
        instanceIRI?: string;
    },
    config: Config,
): FieldResolver<string, string> {
    return async (_parent, args, _context, info) => {
        if (args.sort && !["ASC", "DESC"].includes(args.sort)) {
            throw new Error(`Invalid sort direction: ${args.sort}. Allowed values are ASC and DESC.`);
        }
        const queryVars = getQueryVars(classDescriptor, info, config.logger);
        const instanceIRIs = await resolveInstanceIRIs(
            classDescriptor,
            queryVars,
            args,
            resolverConfig,
            config,
        );

        const results = [];
        for (const instanceIRI of instanceIRIs) {
            results.push(
                await resolveInstanceProperties(
                    classDescriptor,
                    instanceIRI,
                    queryVars,
                    config,
                ),
            );
        }

        if (!resolverConfig.isArrayType) {
            if (results.length === 0) {
                return undefined;
            }
            return results[0];
        }
        return results;
    };
}

interface QueryVar {
    propertyIri: string;
    propertyName: string;
}

function getQueryVars(
    classDescriptor: ClassDescriptor,
    info: GraphQLResolveInfo,
    logger?: Logger,
): QueryVar[] {
    const resolveInfo = parseResolveInfo(info);
    if (!resolveInfo) {
        logger?.warn(
            `Unable to parse ResolveInfo while querying ${classDescriptor.name}.`,
        );
        return [];
    }
    const requestedFieldNames = Object.keys(
        resolveInfo.fieldsByTypeName[classDescriptor.name],
    ).filter((x) => !['_rdf_type', '_rdf_iri'].includes(x));
    const classProperties = [
        ...classDescriptor.attributes,
        ...classDescriptor.associations,
    ];
    const requestedFieldIRIs = requestedFieldNames.map(
        (x) => classProperties.find((y) => y.name === x)!.iri,
    );

    const queryVars = requestedFieldIRIs.map((iri, index) => {
        return {
            propertyIri: iri,
            propertyName: requestedFieldNames[index],
        };
    });

    return queryVars;
}

async function resolveInstanceIRIs(
    classDescriptor: ClassDescriptor,
    queryVars: QueryVar[],
    args: any,
    resolverConfig: {
        isArrayType: boolean;
        areFieldsOptional: boolean;
        instanceIRI?: string;
    },
    config: Config,
): Promise<string[]> {
    const iriQuery = `
    SELECT DISTINCT ?instance
    WHERE
    {
        ?instance a <${classDescriptor.iri}> .

        ${queryVars
            // TODO: optional switches on the individual field level
            .map((x) =>
                resolverConfig.areFieldsOptional
                    ? ''
                    : `?instance <${x.propertyIri}> [] .`,
            )
            .join('\n')}

        ${
            resolverConfig.instanceIRI
                ? `FILTER (?instance=<${resolverConfig.instanceIRI}>)`
                : ''
        }
    }
    ${args.sort ? `ORDER BY ${args.sort}( ?instance )` : ''}
    ${args.limit ? `LIMIT ${args.limit}` : ''}
    ${args.offset ? `OFFSET ${args.offset}` : ''}`;

    const iriResults = await new EndpointClient(
        config.endpoint,
        config.logger,
    ).runSelectQuery(iriQuery);

    const instanceIRIs: string[] = iriResults.map(
        (bindings) => bindings.instance.value,
    );
    return instanceIRIs;
}

async function resolveInstanceProperties(
    classDescriptor: ClassDescriptor,
    instanceIRI: string,
    queryVars: QueryVar[],
    config: Config,
): Promise<any> {
    const propertiesQuery = `
    SELECT ?property ?value
    WHERE
    {
        VALUES (?property)
        {
            ${queryVars
                .map((property) => `( <${property.propertyIri}> )`)
                .join('\n')}
        }
        <${instanceIRI}> ?property ?value .
    }`;

    const propertyResults = await new EndpointClient(
        config.endpoint,
        config.logger,
    ).runSelectQuery(propertiesQuery);

    const groupedProperties = groupBy(propertyResults, (x) => {
        return x.property.value;
    });

    const result: any = {
        _rdf_type: classDescriptor.iri,
        _rdf_iri: instanceIRI,
    };

    for (const [propertyIRI, value] of Object.entries(groupedProperties)) {
        const propertyName = queryVars.find(
            (x) => x.propertyIri === propertyIRI,
        )!.propertyName;
        result[propertyName] = value;
    }

    return result;
}
