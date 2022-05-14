import { EndpointClient } from './client';
import { ENDPOINTS, SPARQLEndpointDefinition } from './endpoints';
import { QueryBuilder } from './query_builder';
import { writeFileSync } from 'fs';
import {
    groupObservations,
    Observations,
    ontologyIri,
    OntologyProperty,
} from './utils';
import { MAX_PROPERTY_COUNT } from '../api/config';

/**
 * Class which carries out observations of SPARQL endpoint contents.
 *
 * These observations can then be parsed into an object model,
 * and subsequently converted to a GraphQL schema.
 */
export class EndpointObserver {
    /**
     * Carry out observations about all endpoints configured in `ENDPOINTS`
     * in `./endpoints.ts`.
     *
     * This can take a **VERY** long time.
     *
     * @returns Observations about all endpoints
     */
    async observeAllEndpoints(): Promise<Observations[]> {
        const allResults = [];
        for (const endpoint of ENDPOINTS) {
            const endpointResults = await this.observeEndpoint(endpoint);

            allResults.push(endpointResults);
            writeFileSync(
                `${endpoint.name}.json`,
                JSON.stringify(endpointResults),
            );
        }

        return allResults;
    }

    /**
     * Carry out observations on the specified SPARQL endpoint.
     *
     * @param endpoint Endpoint to observe
     * @param classSearchLimit If set to a value greater than zero,
     *      only that many classes will be thoroughly searched, i.e.
     *      their instances, properties and associations.
     *      Limiting this number will speed up observation greatly.
     * @returns Observations about the endpoint
     */
    async observeEndpoint(
        endpoint: SPARQLEndpointDefinition,
        classSearchLimit = 0,
    ): Promise<Observations> {
        const endpointResults = [];
        const client = new EndpointClient(endpoint);

        const query = QueryBuilder.CLASSES_AND_INSTANCE_NUMBERS();
        const result = await client.runConstructQuery(query);
        endpointResults.push(result);

        let classIriList = result.quads
            .filter(
                (x) =>
                    x.predicate.value ===
                    ontologyIri(OntologyProperty.DescribedClass),
            )
            .map((x) => x.object.value);

        if (classSearchLimit > 0) {
            classIriList = classIriList.slice(0, classSearchLimit);
        }

        let classCount = 0;
        for (const classIri of classIriList) {
            console.debug(
                `Observing class ${++classCount} of ${
                    classIriList.length
                } [${classIri}]`,
            );

            const propQuery = QueryBuilder.CLASS_PROPERTY_IRIS(classIri);
            const propResult = await client.runConstructQuery(propQuery);
            endpointResults.push(propResult);

            const instanceQuery = QueryBuilder.CLASS_INSTANCES(classIri);
            const instanceResult = await client.runConstructQuery(
                instanceQuery,
            );
            endpointResults.push(instanceResult);

            const propertyIriList = propResult.quads
                .filter(
                    (x) =>
                        x.predicate.value ===
                        ontologyIri(OntologyProperty.PropertyIri),
                )
                .map((x) => x.object.value);

            for (const propertyIri of propertyIriList) {
                const attributeQuery = QueryBuilder.SINGLE_ATTRIBUTE(
                    classIri,
                    propertyIri,
                );
                const attributeResult = await client.runConstructQuery(
                    attributeQuery,
                );
                endpointResults.push(attributeResult);

                const associationQuery = QueryBuilder.SINGLE_ASSOCIATION(
                    classIri,
                    propertyIri,
                );
                const associationResult = await client.runConstructQuery(
                    associationQuery,
                );
                endpointResults.push(associationResult);

                const countQuery = QueryBuilder.SINGLE_PROPERTY_COUNT(
                    classIri,
                    propertyIri,
                    MAX_PROPERTY_COUNT,
                );
                const countResult = await client.runConstructQuery(countQuery);
                endpointResults.push(countResult);
            }
        }

        return groupObservations(endpointResults.flatMap((x) => x.quads));
    }
}
