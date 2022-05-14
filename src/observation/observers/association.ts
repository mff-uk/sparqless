import { EndpointClient } from '../client';
import { SPARQLEndpointDefinition } from '../endpoints';
import { EndpointObserver } from '../observer';
import {
    ObservationQuads,
    Observations,
    OntologyObservation,
    OntologyProperty,
} from '../ontology';
import { groupObservations } from '../utils';
import { Quad } from 'rdf-js';
import { ONTOLOGY_PREFIX_IRI } from '../../api/config';

export class AssociationObserver implements EndpointObserver {
    triggers: OntologyObservation[] = [
        OntologyObservation.PropertyExistenceObservation,
    ];

    async observeEndpoint(
        triggerObservations: ObservationQuads[],
        config: {
            endpoint: SPARQLEndpointDefinition;
        },
    ): Promise<Observations> {
        const resultQuads: Quad[] = [];
        console.info(
            `Observing ${triggerObservations.length} properties as associations...`,
        );
        for (const observation of triggerObservations) {
            const classIri =
                observation[OntologyProperty.PropertyOf]!.object.value;
            const propertyIri =
                observation[OntologyProperty.PropertyIri]!.object.value;

            const client = new EndpointClient(config.endpoint);
            const query = this.buildQuery(classIri, propertyIri);
            const result = await client.runConstructQuery(query);
            resultQuads.push(...result.quads);
        }

        return groupObservations(resultQuads);
    }

    private buildQuery = (classIri: string, propertyIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
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
                LIMIT 1
            } 
        }`;
}
