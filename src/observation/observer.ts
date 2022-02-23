import { EndpointClient, QueryResult } from './client';
import { ENDPOINTS } from './endpoints';
import { QueryBuilder } from './query_builder';
import { writeFileSync } from 'fs';

export class EndpointObserver {
    async observe(): Promise<QueryResult[][]> {
        const allResults = [];
        for (const endpoint of ENDPOINTS) {
            const endpointResults = [];
            const client = new EndpointClient(endpoint);

            const query = QueryBuilder.CLASSES_AND_INSTANCE_NUMBERS();
            const result = await client.runQuery(query);
            endpointResults.push(result);

            const classIriList = result.quads.filter(
                x => x.predicate.value === 'http://skodapetr.eu/ontology/sparql-endpoint/class'
            ).map(x => x.object.value);
            for (const classIri of classIriList) {
                const propQuery = QueryBuilder.NUMBER_OF_INSTANCE_PROPERTIES(classIri);
                const propResult = await client.runQuery(propQuery);
                endpointResults.push(propResult);

                const instanceQuery = QueryBuilder.CLASS_INSTANCES(classIri);
                const instanceResult = await client.runQuery(instanceQuery);
                endpointResults.push(instanceResult);

                const instanceIriList = instanceResult.quads.filter(
                    x => x.predicate.value === 'http://skodapetr.eu/ontology/sparql-endpoint/resource'
                ).map(x => x.object.value);
                for (const instanceIri of instanceIriList) {
                    const attributeQuery = QueryBuilder.INSTANCE_ATTRIBUTES(classIri, instanceIri);
                    const attributeResult = await client.runQuery(attributeQuery);
                    endpointResults.push(attributeResult);

                    const associationQuery = QueryBuilder.INSTANCE_ASSOCIATIONS(classIri, instanceIri);
                    const associationResult = await client.runQuery(associationQuery);
                    endpointResults.push(associationResult);
                }
            }

            allResults.push(endpointResults);
            writeFileSync(`${endpoint.name}.json`, JSON.stringify(endpointResults));
        }

        return allResults;
    }
}

const obs = new EndpointObserver();
obs.observe().then((results) => {
    console.log('Really done!');
});
