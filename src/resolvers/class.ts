import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { groupBy } from 'lodash';
import { FieldResolver } from 'nexus';
import { ENDPOINT_TO_RUN } from '../api/config';
import { ClassDescriptor } from '../models/class';
import { EndpointClient } from '../observation/client';

export function createClassResolver(
    classDescriptor: ClassDescriptor,
    isArrayType: boolean,
    instanceIRI?: string,
): FieldResolver<string, string> {
    return async (_parent, args, _context, info) => {
        const requestedFieldNames = info.fieldNodes[0].selectionSet?.selections
            .map((x) => (x as FieldNode).name.value)!
            .filter((x) => !['_rdf_type', '_rdf_iri'].includes(x))!;
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
                variableName: `?p${index}`,
                variableKey: `p${index}`,
            };
        });
        const query = `
        SELECT ?instance ${queryVars.map((x) => x.variableName).join(' ')}
        WHERE {
            ?instance
                ${queryVars
                    .map((x) => `<${x.propertyIri}> ${x.variableName} ;`)
                    .join(' ')} 
                a <${classDescriptor.iri}> .
            ${instanceIRI ? `FILTER (?instance=<${instanceIRI}>)` : ''}
        }
        ${args.limit ? `LIMIT ${args.limit}` : ''}
        ${args.offset ? `OFFSET ${args.offset}` : ''}`;

        const results = await new EndpointClient(
            ENDPOINT_TO_RUN,
        ).runSelectQuery(query);

        const resultObjects = results.map((bindings) => {
            const parsedInstance: any = {
                _rdf_type: classDescriptor.iri,
                _rdf_iri: bindings.instance.value,
            };
            for (const instanceProperty of queryVars) {
                parsedInstance[instanceProperty.propertyName] =
                    bindings[instanceProperty.variableKey].value;
            }
            return parsedInstance;
        });

        if (!isArrayType) {
            if (resultObjects.length === 0) {
                return undefined;
            }
            return resultObjects[0];
        }
        return resultObjects;
    };
}
