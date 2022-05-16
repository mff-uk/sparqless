import { Logger } from 'winston';
import { ObservationConfig } from '../../api/config';
import { EndpointClient } from '../client';
import { SPARQLEndpointDefinition } from '../endpoints';
import { InitEndpointObserver } from '../observer';
import { Observations } from '../ontology';
import { groupObservations } from '../utils';

/**
 * Observer which makes observations about existing classes
 * and their number of instances.
 */
export class ClassObserver implements InitEndpointObserver {
    async observeEndpoint(
        endpoint: SPARQLEndpointDefinition,
        config: ObservationConfig,
        logger?: Logger,
    ): Promise<Observations> {
        const client = new EndpointClient(endpoint, logger);

        logger?.info(`Observing classes and their number of instances...`);
        const query = this.buildQuery(config.ontologyPrefixIri);
        const result = await client.runConstructQuery(query);

        return groupObservations(result.quads, config);
    }

    private buildQuery = (prefix: string) =>
        `PREFIX se: <${prefix}>
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
