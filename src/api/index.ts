import { ApolloServer } from 'apollo-server';
import { EndpointObserver } from '../observation/observer';
import { ObservationParser } from '../parsing/parser';
import { ENDPOINT_TO_RUN, EXAMINE_N_CLASSES, PORT } from './config';
import { createSchema } from './schema';

// Carry out endpoint observations and start the GraphQL server
const observer = new EndpointObserver();
const parser = new ObservationParser();
console.log('Observing endpoint, this may take a while...');
observer.observeEndpoint(ENDPOINT_TO_RUN, EXAMINE_N_CLASSES).then((results) => {
    console.log('Building object model...');
    const classes = parser.buildEndpointModel(results);

    console.log('Creating GraphQL schema...');
    const schema = createSchema(classes);

    console.log('Starting GraphQL server...');
    const server = new ApolloServer({ schema });

    server.listen({ port: PORT }).then(({ url }) => {
        console.log(`🚀  Server ready at ${url}`);
    });
});
