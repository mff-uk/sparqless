import path from 'path';
import { SPARQLess } from './api';
import { Config, SIMPLE_LOGGER } from './api/config';

// This file is the entrypoint for the Docker image

const sparqlEndpointEnvVariable = 'SPARQL_ENDPOINT';
const endpointUrl = process.env[sparqlEndpointEnvVariable];
if (endpointUrl === undefined) {
    throw Error(
        `The "${sparqlEndpointEnvVariable}" environment variable must be set` +
            ' to the URL of the SPARQL endpoint SPARQLess should run on.',
    );
}

const config: Config = {
    endpoint: {
        url: endpointUrl,
        name: endpointUrl,
    },
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

const sparqless = new SPARQLess();
sparqless.buildSchemaAndRunEndpoint(config);
