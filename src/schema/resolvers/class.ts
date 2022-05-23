import { GraphQLResolveInfo } from 'graphql';
import { parseResolveInfo } from 'graphql-parse-resolve-info';
import { groupBy } from 'lodash';
import { FieldResolver } from 'nexus';
import { Logger } from 'winston';
import { Config } from '../../api/config';
import { ClassDescriptor } from '../../models/class';
import { EndpointClient } from '../../observation/client';

/**
 * Resolver factory for classes.
 * 
 * Each class has its own resolver, because the resolver
 * needs to know which fields the class may have,
 * and how to query those fields in a SPARQL query.
 * 
 * @param resolverConfig `isArrayType` determines whether the
 * created resolver should return potentially multiple values,
 * or just one. `areFieldsOptional` is a toggle which specifies
 * whether the fields specified in the GraphQL query should
 * be treated as optional or mandatory. If they are treated
 * as mandatory, only objects which contain all queries fields
 * will be returned. `instanceIri`, if specified, will limit
 * the results to only the class with the specified IRI. 
 */
export function createClassResolver(
    classDescriptor: ClassDescriptor,
    resolverConfig: {
        isArrayType: boolean;
        areFieldsOptional: boolean;
        instanceIri?: string;
    },
    config: Config,
): FieldResolver<string, string> {
    return async (_parent, args, _context, info) => {
        if (args.sort && !['ASC', 'DESC'].includes(args.sort)) {
            throw new Error(
                `Invalid sort direction: ${args.sort}. Allowed values are ASC and DESC.`,
            );
        }
        const filterConfig =
            !resolverConfig.instanceIri && args.filter
                ? { ...resolverConfig, instanceIRI: args.filter }
                : resolverConfig;

        const queryVars = getQueryVars(classDescriptor, info, config.logger);
        const instanceIRIs = await resolveInstanceIRIs(
            classDescriptor,
            queryVars,
            args,
            filterConfig,
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

/**
 * Helper interface for variables inserted into
 * the generated SPARQL queries.
 */
interface QueryVar {
    propertyIri: string;
    propertyName: string;
}

/**
 * Get the list of variables which are requested
 * by the current GraphQL query.
 */
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

/**
 * Query the SPARQL endpoint for the IRIs of instances
 * of the requested class. This query is necessary
 * to implement sorting, filtering, limit and offset.
 * 
 * It is also necessary in case the requested fields
 * are mandatory, and we only want objects where
 * all of the requested fields are present to be
 * returned.
 */
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
            // TODO: implement optional switches on the individual field level
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

/**
 * Execute a SPARQL query for the fields requested by the
 * GraphQL query on the given class instance, and return
 * the instance as a plain JavaScript object.
 */
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
