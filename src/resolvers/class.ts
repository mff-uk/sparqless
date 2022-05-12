import { FieldNode, GraphQLResolveInfo } from 'graphql';
import { groupBy } from 'lodash';
import { FieldResolver } from 'nexus';
import { ENDPOINT_TO_RUN } from '../api/config';
import { ClassDescriptor } from '../models/class';
import { EndpointClient } from '../observation/client';

export function createClassResolver(
    classDescriptor: ClassDescriptor,
    isArrayType: boolean,
): FieldResolver<string, string> {
    return async (_root, _args, _context, info) => {
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
        const query = `PREFIX se: <http://skodapetr.eu/ontology/sparql-endpoint/>
        SELECT ?instance ?property ?propertyValue
        WHERE {
            VALUES ( ?property ) {
                ${requestedFieldIRIs.map((x) => `(<${x}>)`).join(' ')}
            }
            ?instance
                a <${classDescriptor.iri}> ;
                ?property ?propertyValue .
        }`;

        const results = await new EndpointClient(
            ENDPOINT_TO_RUN,
        ).runSelectQuery(query);
        const groupedResults = groupBy(results, (x) => x.instance.value);

        const resultObjects = Object.entries(groupedResults).map(
            ([instanceIRI, instanceProperties]) => {
                const parsedInstance: any = {
                    _rdf_type: classDescriptor.iri,
                    _rdf_iri: instanceIRI,
                };
                for (const instanceProperty of instanceProperties) {
                    const descriptor = classProperties.find(
                        (x) => x.iri === instanceProperty.property.value,
                    )!;
                    parsedInstance[descriptor.name] =
                        instanceProperty.propertyValue.value;
                }
                return parsedInstance;
            },
        );

        if (!isArrayType) {
            if (resultObjects.length === 0) {
                return undefined;
            }
            return resultObjects[0];
        }
        return resultObjects;
    };
}
