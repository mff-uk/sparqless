import path from 'path';
import { SPARQL2GraphQL } from './api';
import { Config, SIMPLE_LOGGER } from './api/config';
import { ENDPOINTS } from './observation/endpoints';

const config: Config = {
    endpoint: ENDPOINTS[0],
    logger: SIMPLE_LOGGER,
    schema: {
        graphqlSchemaOutputPath: path.join(
            __dirname,
            '../../generated-schema.graphql',
        ),
    },
    modelCheckpoint: {
        loadModelFromCheckpoint: true,
        saveModelToFile: true,
        overwriteFile: true,
        checkpointFilePath: path.join(__dirname, '../../model-checkpoint.json'),
    },
};

const sparql2graphql = new SPARQL2GraphQL();

// This method returns a Promise, so you should await it
// if you want to do something after the server has started.
sparql2graphql.buildSchemaAndRunEndpoint(config);
