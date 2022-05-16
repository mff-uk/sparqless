import { Logger } from 'winston';
import { ObservationConfig } from '../api/config';
import { SPARQLEndpointDefinition } from './endpoints';
import {
    ObservationQuads,
    Observations,
    OntologyObservation,
} from './ontology';

/**
 * Observer which will run once during observations,
 * right at the beginning. Init observers can provide
 * the initial observations, which other observers can
 * then subscribe to, and conduct additional observations
 * based on them.
 */
export interface InitEndpointObserver {
    /**
     * Function called by the `ObserverManager` in order
     * to get observations about an endpoint.
     *
     * @param endpoint SPARQL endpoint to observe.
     * @param config Observation configuration.
     * @param logger Logger which may be used by the observer.
     *
     * @returns Observations made by this observer.
     */
    observeEndpoint(
        endpoint: SPARQLEndpointDefinition,
        config: ObservationConfig,
        logger?: Logger,
    ): Promise<Observations>;
}

/**
 * Observer which requires previous observations in order
 * to conduct its own observations. It can subscribe to
 * other observers' observations using the `triggers` property,
 * and when any observation of that kind is made, this observer
 * will be called with that observation as a parameter.
 */
export interface EndpointObserver {
    /**
     * Property containing the observations which this
     * observer should be subscribed to.
     */
    triggers: OntologyObservation[];

    /**
     * Function called by the `ObserverManager` in order
     * to get observations about an endpoint.
     *
     * @param triggerObservations Observations which triggered
     * this observer's execution.
     * @param endpoint SPARQL endpoint to observe.
     * @param config Observation configuration.
     * @param logger Logger which may be used by the observer.
     *
     * @returns Observations made by this observer.
     */
    observeEndpoint(
        triggerObservations: ObservationQuads[],
        endpoint: SPARQLEndpointDefinition,
        config: ObservationConfig,
        logger?: Logger,
    ): Promise<Observations>;
}
