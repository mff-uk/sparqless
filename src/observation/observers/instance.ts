import { EndpointClient } from '../client';
import { EndpointObserver } from '../observer';
import {
    ObservationQuads,
    Observations,
    OntologyObservation,
    OntologyProperty,
} from '../ontology';
import { groupObservations } from '../utils';
import { Quad } from 'rdf-js';
import { ObservationConfig } from '../../api/config';
import { SPARQLEndpointDefinition } from '../endpoints';
import { Logger } from 'winston';

/**
 * Obsever which makes observations about instances of classes.
 */
export class InstanceObserver implements EndpointObserver {
    triggers: OntologyObservation[] = [OntologyObservation.ClassObservation];

    async observeEndpoint(
        triggerObservations: ObservationQuads[],
        endpoint: SPARQLEndpointDefinition,
        config: ObservationConfig,
        logger?: Logger,
    ): Promise<Observations> {
        const resultQuads: Quad[] = [];
        logger?.info(
            `Observing instances of ${triggerObservations.length} classes...`,
        );
        for (const observation of triggerObservations) {
            const classIri =
                observation[OntologyProperty.DescribedClass]!.object.value;

            const client = new EndpointClient(endpoint, logger);
            const query = this.buildQuery(config.ontologyPrefixIri, classIri);
            const result = await client.runConstructQuery(query);
            resultQuads.push(...result.quads);
        }

        return groupObservations(resultQuads, config);
    }

    private buildQuery = (prefix: string, classIri: string) =>
        `PREFIX se: <${prefix}>
        CONSTRUCT {
            []
              a se:InstanceObservation ;
              se:classInstance ?resource ;
              se:parentClass <${classIri}> .
        } WHERE {
            {
              SELECT ?resource WHERE {
                  ?resource a <${classIri}> .
              }
              LIMIT 5 
            }
        }`;
}
