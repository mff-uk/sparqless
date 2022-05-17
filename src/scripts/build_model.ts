import path from 'path';
import { Config, SIMPLE_LOGGER } from '../api/config';
import { ENDPOINTS } from '../observation/endpoints';
import { AssociationObserver } from '../observation/observers/association';
import { AttributeObserver } from '../observation/observers/attribute';
import { ClassObserver } from '../observation/observers/class';
import { InstanceObserver } from '../observation/observers/instance';
import { PropertyObserver } from '../observation/observers/property';
import { PropertyCountObserver } from '../observation/observers/property_count';
import { ObserverManager } from '../observation/observer_manager';
import { ObservationParser } from '../parsing/parser';

// Debug script for testing observations and parsing

const config: Config = {
    endpoint: ENDPOINTS[0],
    logger: SIMPLE_LOGGER,
    observation: {
        maxPropertyCount: 1000,
        ontologyPrefixIri: 'http://skodapetr.eu/ontology/sparql-endpoint/',
        shouldCountProperties: true,
        shouldDetectNonArrayProperties: true,
    },
    schema: {
        graphqlSchemaOutputPath: path.join(
            __dirname,
            '../../../generated-schema.graphql',
        ),
    },
    server: {
        port: 4000,
    },
};

const observerManager = new ObserverManager(config);
observerManager.subscribeInit(new ClassObserver());
observerManager.subscribe(new InstanceObserver());
observerManager.subscribe(new PropertyObserver());
observerManager.subscribe(new AttributeObserver());
observerManager.subscribe(new AssociationObserver());
observerManager.subscribe(new PropertyCountObserver());

observerManager.runObservers().then((observations) => {
    const parser = new ObservationParser(config);
    const model = parser.buildEndpointModel(observations);
    config.logger?.info(
        `Done! Model has ${model.descriptors.length} class descriptors.`,
    );
});
