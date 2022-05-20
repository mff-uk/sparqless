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
 * Observer which makes observation about associations,
 * i.e. properties whose range is another class.
 */
export class AssociationObserver implements EndpointObserver {
    triggers: OntologyObservation[] = [
        OntologyObservation.PropertyExistenceObservation,
    ];

    async observeEndpoint(
        triggerObservations: ObservationQuads[],
        endpoint: SPARQLEndpointDefinition,
        config: ObservationConfig,
        logger?: Logger,
    ): Promise<Observations> {
        const resultQuads: Quad[] = [];
        logger?.debug(
            `Observing ${triggerObservations.length} properties as associations...`,
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
            a se:AssociationObservation ;
            se:describedAssociation <${propertyIri}> ;
            se:associationSourceClass <${classIri}> ;
            se:targetClass ?targetClass .
        } WHERE {
            {
                SELECT ?targetClass
                WHERE {
                    ?instance
                        a <${classIri}> ;
                        <${propertyIri}> ?targetResource .
                    
                    ?targetResource a ?targetClass .
                }
                LIMIT 1000
            } 
        }`;
}
