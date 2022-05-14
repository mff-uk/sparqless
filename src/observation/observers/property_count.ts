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
import { MAX_PROPERTY_COUNT, ONTOLOGY_PREFIX_IRI } from '../../api/config';

export class PropertyCountObserver implements EndpointObserver {
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
            `Observing property counts of ${triggerObservations.length} properties...`,
        );
        for (const observation of triggerObservations) {
            const classIri =
                observation[OntologyProperty.PropertyOf]!.object.value;
            const propertyIri =
                observation[OntologyProperty.PropertyIri]!.object.value;

            const client = new EndpointClient(config.endpoint);
            const query = this.buildQuery(
                classIri,
                propertyIri,
                MAX_PROPERTY_COUNT,
            );
            const result = await client.runConstructQuery(query);
            resultQuads.push(...result.quads);
        }

        return groupObservations(resultQuads);
    }

    private buildQuery = (
        classIri: string,
        propertyIri: string,
        maxCount = 0,
    ) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
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
                      ?instance
                        a <${classIri}> ;
                        <${propertyIri}> ?value .
                    }
                    ${maxCount > 0 ? `LIMIT ${maxCount}` : ''}
                  }
                }
              }
            }`;
}
