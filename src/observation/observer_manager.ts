import {
    Config,
    DEFAULT_OBSERVATION_CONFIG,
    ObservationConfig,
} from '../api/config';
import { InitEndpointObserver, EndpointObserver } from './observer';
import { Observations, OntologyObservation } from './ontology';

/**
 * Class which manages the subscriptions and execution of endpoint
 * observers, which are classes carrying out observations about
 * the configured SPARQL endpoint.
 *
 * First register some observers:
 *
 * ```
 *  const observerManager = new ObserverManager(config);
 *  observerManager.subscribeInit(new ClassObserver());
 *  observerManager.subscribe(new PropertyObserver());
 *  observerManager.subscribe(new AttributeObserver());
 *  observerManager.subscribe(new AssociationObserver());
 *  observerManager.subscribe(new PropertyCountObserver());
 *  ```
 *
 *  And then run the observers:
 *
 *  ```
 *  const observations = await observerManager.runObservers();
 *  ```
 */
export class ObserverManager {
    private readonly observationConfig: ObservationConfig;

    constructor(private config: Config) {
        this.observationConfig =
            config.observation ?? DEFAULT_OBSERVATION_CONFIG;
    }

    private subscribedObservers: Partial<
        Record<OntologyObservation, EndpointObserver[]>
    > = Object.assign(
        {},
        ...Object.values(OntologyObservation).map((observation) => ({
            [observation]: [],
        })),
    );
    private initObservers: InitEndpointObserver[] = [];

    /**
     * Subscribe the given init observer, meaning it will run
     * as soon as `runObservers()` is called on this manager,
     * without any pre-requisites. Its results will then be used
     * to trigger observers with dependencies.
     *
     * @param observer The observer to subscribe.
     */
    subscribeInit(observer: InitEndpointObserver): void {
        this.initObservers.push(observer);
    }

    /**
     * Unsubscribe the given observer.
     *
     * @param observer The observer to unsubscribe.
     */
    unsubscribeInit(observer: InitEndpointObserver): void {
        this.initObservers = this.initObservers.filter((x) => x !== observer);
    }

    /**
     * Subscribe the given observer to the observations configured
     * in its `triggers` property. Whenever an observer produces an observation
     * which this observer is subscribed to, it will be run by this manager,
     * with the trigger observation being passed to the subscribed observer.
     *
     * @param observer The observer to subscribe.
     */
    subscribe(observer: EndpointObserver): void {
        for (const trigger of observer.triggers) {
            this.subscribedObservers[trigger]!.push(observer);
        }
    }

    /**
     * Unsubscribe the given observer from the observations configured
     * in its `triggers` property.
     *
     * @param observer The observer to unsubscribe.
     */
    unsubscribe(observer: EndpointObserver): void {
        for (const trigger of observer.triggers) {
            this.subscribedObservers[trigger] = this.subscribedObservers[
                trigger
            ]!.filter((x) => x !== observer);
        }
    }

    /**
     * Carry out observations using the registered observers on the configured SPARQL endpoint.
     *
     * @returns Observations about the endpoint
     */
    async runObservers(): Promise<Observations> {
        const observations: Observations = Object.assign(
            {},
            ...Object.values(OntologyObservation).map((observation) => ({
                [observation]: [],
            })),
        );
        const initObservations = await Promise.all(
            this.initObservers.map((observer) =>
                observer.observeEndpoint(
                    this.config.endpoint,
                    this.observationConfig,
                    this.config.logger,
                ),
            ),
        );

        for (const initObservation of initObservations) {
            await this.triggerObservers(observations, initObservation);
        }

        return observations;
    }

    /**
     * Recursive function which, depending on the output of the previous observer,
     * will trigger the next observers which are subscribed to the given
     * observations. Take care not to introduce infinite subscription loops when
     * writing and subscribing new observers.
     *
     * @param accumulatedObservations Accumulator parameter which gathers
     * the observations collected from individual observers. The passed
     * instance is modified in recursive calls to gather all the observations.
     *
     * @param newObservation Observation made by the last observer that was run.
     * This observation will be used to trigger the next observers.
     */
    private async triggerObservers(
        accumulatedObservations: Observations,
        newObservation: Observations,
    ): Promise<void> {
        for (const [event, quads] of Object.entries(newObservation)) {
            if (quads.length === 0) {
                continue; // Don't trigger dependent observers if there are no observations
            }

            accumulatedObservations[event as OntologyObservation]!.push(
                ...quads,
            );
            const observersToRun =
                this.subscribedObservers[event as OntologyObservation]!;
            for (const observer of observersToRun) {
                const observerResults = await observer.observeEndpoint(
                    quads,
                    this.config.endpoint,
                    this.observationConfig,
                    this.config.logger,
                );
                await this.triggerObservers(
                    accumulatedObservations,
                    observerResults,
                );
            }
        }
    }
}
