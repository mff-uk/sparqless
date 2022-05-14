import { SPARQLEndpointDefinition } from './endpoints';
import { InitEndpointObserver, EndpointObserver } from './observer';
import { Observations, OntologyObservation } from './ontology';

export class ObserverManager {
    constructor(
        private config: {
            endpoint: SPARQLEndpointDefinition;
        },
    ) {}

    private subscribedObservers: Partial<
        Record<OntologyObservation, EndpointObserver[]>
    > = Object.assign(
        {},
        ...Object.values(OntologyObservation).map((observation) => ({
            [observation]: [],
        })),
    );
    private initObservers: InitEndpointObserver[] = [];

    subscribeInit(observer: InitEndpointObserver): void {
        this.initObservers.push(observer);
    }

    unsubscribeInit(observer: InitEndpointObserver): void {
        this.initObservers = this.initObservers.filter((x) => x !== observer);
    }

    subscribe(observer: EndpointObserver): void {
        for (const trigger of observer.triggers) {
            this.subscribedObservers[trigger]!.push(observer);
        }
    }

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
                observer.observeEndpoint(this.config),
            ),
        );

        for (const initObservation of initObservations) {
            await this.triggerObservers(observations, initObservation);
        }

        return observations;
    }

    private async triggerObservers(
        accumulatedObservations: Observations,
        newObservation: Observations,
    ): Promise<void> {
        for (const [event, quads] of Object.entries(newObservation)) {
            accumulatedObservations[event as OntologyObservation]!.push(
                ...quads,
            );
            const observersToRun =
                this.subscribedObservers[event as OntologyObservation]!;
            for (const observer of observersToRun) {
                const observerResults = await observer.observeEndpoint(
                    quads,
                    this.config,
                );
                await this.triggerObservers(
                    accumulatedObservations,
                    observerResults,
                );
            }
        }
    }
}
