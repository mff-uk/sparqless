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
 * Observer which makes observations about properties which are determined
 * to be partial functions, i.e. for each triple ?s ?p ?o1 in the dataset
 * where ?p is the described property, there exists no such triple
 * ?s ?p ?o2 such that ?o1 != ?o2.
 */
export class PartialFunctionPropertyObserver implements EndpointObserver {
    triggers: OntologyObservation[] = [
        OntologyObservation.PropertyCountObservation,
    ];

    async observeEndpoint(
        triggerObservations: ObservationQuads[],
        endpoint: SPARQLEndpointDefinition,
        config: ObservationConfig,
        logger?: Logger,
    ): Promise<Observations> {
        if (!config.shouldDetectNonArrayProperties) {
            logger?.debug(
                'Skipping scalar property detection since it is disabled in the config.',
            );
            return {};
        }

        const resultQuads: Quad[] = [];
        logger?.debug(
            `Checking for partial functions in ${triggerObservations.length} properties (limit ${config.maxPropertyCount})...`,
        );
        for (const observation of triggerObservations) {
            const classIri =
                observation[OntologyProperty.CountedPropertySourceClass]!.object
                    .value;
            const propertyIri =
                observation[OntologyProperty.CountedProperty]!.object.value;
            const propertyCount = parseInt(
                observation[OntologyProperty.NumberOfPropertyInstances]!.object
                    .value,
            );
            if (
                config.maxPropertyCount &&
                propertyCount >= config.maxPropertyCount
            ) {
                // Checking for the max count to avoid counting properties
                // which have potentially way too many instances to count quickly.
                continue;
            }

            const client = new EndpointClient(endpoint, logger);
            const query = this.buildQuery(
                config.ontologyPrefixIri,
                classIri,
                propertyIri,
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
    ) =>
        `PREFIX se: <${prefix}>
        CONSTRUCT {
            []
                a se:PropertyIsAPartialFunctionObservation ;
                se:partialFunctionProperty ?property .
        }
        WHERE
        {
            {
                SELECT DISTINCT (<${propertyIri}> AS ?property)
                WHERE
                {
                    FILTER NOT EXISTS
                    {
                        ?instance
                            a <${classIri}> ;
                            ?property ?value1 ;
                            ?property ?value2 .
                        FILTER(?value1 != ?value2)
                    }
                }
            }
        }`;
}
