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
import { Logger } from 'winston';
import { SPARQLEndpointDefinition } from '../endpoints';

/**
 * Observer which makes observations about the existence of properties
 * on the classes in the SPARQL endpoint.
 */
export class PropertyObserver implements EndpointObserver {
    triggers: OntologyObservation[] = [OntologyObservation.ClassObservation];

    async observeEndpoint(
        triggerObservations: ObservationQuads[],
        endpoint: SPARQLEndpointDefinition,
        config: ObservationConfig,
        logger?: Logger,
    ): Promise<Observations> {
        const resultQuads: Quad[] = [];
        logger?.info(
            `Observing property IRIs for ${triggerObservations.length} classes...`,
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
            a se:PropertyExistenceObservation ;
            se:propertyOf <${classIri}> ;
            se:propertyIri ?property .
        }
        WHERE
        {
          {
            SELECT DISTINCT ?property
            WHERE {
              ?instance
                a <${classIri}> ;
                ?property ?value .
            }
          }
        }`;
}
