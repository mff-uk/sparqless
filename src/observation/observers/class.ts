import { ONTOLOGY_PREFIX_IRI } from '../../api/config';
import { EndpointClient } from '../client';
import { SPARQLEndpointDefinition } from '../endpoints';
import { InitEndpointObserver } from '../observer';
import { Observations } from '../ontology';
import { groupObservations } from '../utils';

export class ClassObserver implements InitEndpointObserver {
    async observeEndpoint(config: {
        endpoint: SPARQLEndpointDefinition;
    }): Promise<Observations> {
        const client = new EndpointClient(config.endpoint);

        console.info(`Observing classes and their number of instances...`);
        const query = this.buildQuery();
        const result = await client.runConstructQuery(query);

        return groupObservations(result.quads);
    }

    private buildQuery = () =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
        CONSTRUCT {
            []
              a se:ClassObservation ;
              se:describedClass ?class ;
              se:numberOfInstances ?numberOfInstances .
        } WHERE {
            {
                SELECT ?class (COUNT(?resource) AS ?numberOfInstances)
                WHERE {
                    ?resource a ?class.
                }
                GROUP BY ?class
            }
        }`;
}
