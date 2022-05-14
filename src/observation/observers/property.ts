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

export class PropertyObserver implements EndpointObserver {
    triggers: OntologyObservation[] = [OntologyObservation.ClassObservation];

    async observeEndpoint(
        triggerObservations: ObservationQuads[],
        config: {
            endpoint: SPARQLEndpointDefinition;
        },
    ): Promise<Observations> {
        const resultQuads: Quad[] = [];
        for (const observation of triggerObservations) {
            const classIri =
                observation[OntologyProperty.DescribedClass]!.object.value;

            const client = new EndpointClient(config.endpoint);
            const query = this.buildQuery(classIri);
            const result = await client.runConstructQuery(query);
            resultQuads.push(...result.quads);
        }

        return groupObservations(resultQuads);
    }

    private buildQuery = (classIri: string) =>
        `PREFIX se: <${ONTOLOGY_PREFIX_IRI}>
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
