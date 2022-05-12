import { EndpointClient, QueryResult } from './client';
import { ENDPOINTS, SPARQLEndpointDefinition } from './endpoints';
import { QueryBuilder } from './query_builder';
import { writeFileSync } from 'fs';

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
    async observeAllEndpoints(): Promise<QueryResult[][]> {
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
    ): Promise<QueryResult[]> {
        const endpointResults = [];
        const client = new EndpointClient(endpoint);

        const query = QueryBuilder.CLASSES_AND_INSTANCE_NUMBERS();
        const result = await client.runConstructQuery(query);
        endpointResults.push(result);

        let classIriList = result.quads
            .filter(
                (x) =>
                    x.predicate.value ===
                    'http://skodapetr.eu/ontology/sparql-endpoint/class',
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
            const propQuery =
                QueryBuilder.NUMBER_OF_INSTANCE_PROPERTIES(classIri);
            const propResult = await client.runConstructQuery(propQuery);
            endpointResults.push(propResult);

            const instanceQuery = QueryBuilder.CLASS_INSTANCES(classIri);
            const instanceResult = await client.runConstructQuery(
                instanceQuery,
            );
            endpointResults.push(instanceResult);

            const instanceIriList = instanceResult.quads
                .filter(
                    (x) =>
                        x.predicate.value ===
                        'http://skodapetr.eu/ontology/sparql-endpoint/resource',
                )
                .map((x) => x.object.value);
            for (const instanceIri of instanceIriList) {
                const attributeQuery = QueryBuilder.INSTANCE_ATTRIBUTES(
                    classIri,
                    instanceIri,
                );
                const attributeResult = await client.runConstructQuery(
                    attributeQuery,
                );
                endpointResults.push(attributeResult);

                const associationQuery = QueryBuilder.INSTANCE_ASSOCIATIONS(
                    classIri,
                    instanceIri,
                );
                const associationResult = await client.runConstructQuery(
                    associationQuery,
                );
                endpointResults.push(associationResult);
            }
        }

        return endpointResults;
    }
}
