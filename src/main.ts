import path from 'path';
import { SPARQL2GraphQL } from './api';
import { Config, SIMPLE_LOGGER } from './api/config';
import { ENDPOINTS } from './observation/endpoints';

const config: Config = {
    endpoint: ENDPOINTS[0],
    logger: SIMPLE_LOGGER,
    observation: {
        maxPropertyCount: 1000,
        ontologyPrefixIri: 'http://skodapetr.eu/ontology/sparql-endpoint/',
    },
    schema: {
        graphqlSchemaOutputPath: path.join(
            __dirname,
            '../../generated-schema.graphql',
        ),
    },
};

const sparql2graphql = new SPARQL2GraphQL();

// This method returns a Promise, so you should await it
// if you want to do something after the server has started.
sparql2graphql.buildSchemaAndRunEndpoint(config);
