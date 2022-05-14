import { SPARQLEndpointDefinition } from './endpoints';
import {
    ObservationQuads,
    Observations,
    OntologyObservation,
} from './ontology';

export interface InitEndpointObserver {
    observeEndpoint(config: {
        endpoint: SPARQLEndpointDefinition;
    }): Promise<Observations>;
}

export interface EndpointObserver {
    triggers: OntologyObservation[];
    observeEndpoint(
        triggerObservations: ObservationQuads[],
        config: {
            endpoint: SPARQLEndpointDefinition;
        },
    ): Promise<Observations>;
}
