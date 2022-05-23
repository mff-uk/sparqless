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
 * Observer which makes observations about the counts of property
 * instances, i.e. how many times each property occurs
 * in the SPARQL endpoint.
 */
export class PropertyCountObserver implements EndpointObserver {
    triggers: OntologyObservation[] = [
        OntologyObservation.PropertyExistenceObservation,
    ];

    async observeEndpoint(
        triggerObservations: ObservationQuads[],
        endpoint: SPARQLEndpointDefinition,
        config: ObservationConfig,
        logger?: Logger,
    ): Promise<Observations> {
        if (!config.shouldCountProperties) {
            logger?.debug(
                'Skipping counting properties since it is disabled in the config.',
            );
            return {};
        }

        const resultQuads: Quad[] = [];
        logger?.debug(
            `Observing property counts of ${triggerObservations.length} properties (limit ${config.maxPropertyCount})...`,
        );
        for (const observation of triggerObservations) {
            const classIri =
                observation[OntologyProperty.PropertyOf]!.object.value;
            const propertyIri =
                observation[OntologyProperty.PropertyIri]!.object.value;

            const client = new EndpointClient(endpoint, logger);
            const query = this.buildQuery(
                config.ontologyPrefixIri,
                classIri,
                propertyIri,
                config.maxPropertyCount ?? 0,
            );
            const result = await client.runConstructQuery(query);
            resultQuads.push(...result.quads);
        }

        return groupObservations(resultQuads, config);
    }

    private buildQuery = (
        prefix: string,
        classIri: string,
        propertyIri: string,
        maxCount = 0,
    ) =>
        `PREFIX se: <${prefix}>
            CONSTRUCT {
                []
                    a se:PropertyCountObservation ;
                    se:countedProperty <${propertyIri}> ;
                    se:countedPropertySourceClass <${classIri}> ;
                    se:numberOfPropertyInstances ?numberOfInstances .
            }
            WHERE
            {
                {
                    SELECT (COUNT(*) AS ?numberOfInstances)
                    WHERE {
                        {
                            SELECT ?value
                            WHERE
                            {
                                GRAPH ?g {
                                    ?instance
                                        a <${classIri}> ;
                                        <${propertyIri}> ?value .
                                }
                            }
                            ${maxCount > 0 ? `LIMIT ${maxCount}` : ''}
                        }
                    }
                }
            }`;
}
