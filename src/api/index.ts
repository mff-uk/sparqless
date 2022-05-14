import { ApolloServer } from 'apollo-server';
import { AssociationObserver } from '../observation/observers/association';
import { AttributeObserver } from '../observation/observers/attribute';
import { ClassObserver } from '../observation/observers/class';
import { InstanceObserver } from '../observation/observers/instance';
import { PropertyObserver } from '../observation/observers/property';
import { PropertyCountObserver } from '../observation/observers/property_count';
import { ObserverManager } from '../observation/observer_manager';
import { ObservationParser } from '../parsing/parser';
import { DescriptorPostprocessor } from '../postprocessing/postprocessor';
import { getRegisteredPostprocessingHooks } from '../postprocessing/registered_hooks';
import { ENDPOINT_TO_RUN, GRAHPQL_SCHEMA_OUTPUT_PATH, PORT } from './config';
import { createSchema } from './schema';

export function buildSchemaAndRunEndpoint() {
    // Carry out endpoint observations and start the GraphQL server
    const observerManager = new ObserverManager({ endpoint: ENDPOINT_TO_RUN });
    observerManager.subscribeInit(new ClassObserver());
    observerManager.subscribe(new InstanceObserver());
    observerManager.subscribe(new PropertyObserver());
    observerManager.subscribe(new AttributeObserver());
    observerManager.subscribe(new AssociationObserver());
    observerManager.subscribe(new PropertyCountObserver());

    console.log('Observing endpoint, this may take a while...');
    observerManager.runObservers().then((observations) => {
        console.log('Building object model...');
        const parser = new ObservationParser();
        const classes = parser.buildEndpointModel(observations);

        console.log('Running postprocessing hooks...');
        const postprocessor = new DescriptorPostprocessor();
        const hooks = getRegisteredPostprocessingHooks();
        postprocessor.postprocess(classes, hooks);

        console.log('Creating GraphQL schema...');
        const schema = createSchema(classes, GRAHPQL_SCHEMA_OUTPUT_PATH);

        console.log('Starting GraphQL server...');
        const server = new ApolloServer({ schema });

        server.listen({ port: PORT }).then(({ url }) => {
            console.log(`🚀  Server ready at ${url}`);
        });
    });
}

buildSchemaAndRunEndpoint();
