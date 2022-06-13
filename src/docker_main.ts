import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { SPARQLess, SPARQLessConfigBuilder } from './api';

// This file is the entrypoint for the Docker image. For local development, use `main.ts`.

const sparqlEndpointEnvVariable = 'SPARQL_ENDPOINT';
const endpointUrl = process.env[sparqlEndpointEnvVariable];
if (endpointUrl === undefined) {
    throw Error(
        `The "${sparqlEndpointEnvVariable}" environment variable must be set` +
            ' to the URL of the SPARQL endpoint SPARQLess should run on.',
    );
}

// Observations, the model and the GraphQL schema will be written to this directory.
// You can create a bind mount at this path (/app/data) to have access to them.
const dataDirPath = path.join(__dirname, '../../data');
if (!existsSync(dataDirPath)) {
    mkdirSync(dataDirPath, { recursive: true });
}

const config = new SPARQLessConfigBuilder()
    .sparqlEndpoint(endpointUrl)
    .observation({
        observationsOutputPath: path.join(dataDirPath, 'observations.ttl'),
    })
    .schema({
        graphqlSchemaOutputPath: path.join(
            dataDirPath,
            'generated-schema.graphql',
        ),
    })
    .modelCheckpoint({
        loadModelFromCheckpoint: true,
        saveModelToFile: true,
        overwriteFile: true,
        checkpointFilePath: path.join(dataDirPath, 'model-checkpoint.json'),
    })
    .build();

const sparqless = new SPARQLess();
sparqless.buildSchemaAndRunEndpoint(config);
