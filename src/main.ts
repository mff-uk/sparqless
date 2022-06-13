import path from 'path';
import { SPARQLess, SPARQLessConfigBuilder } from './api';
import { ENDPOINTS } from './observation/endpoints';

// Run this file if you want to run SPARQLess locally and tinker with the code.
// Feel free to modify any of the config.

const config = new SPARQLessConfigBuilder()
    .sparqlEndpoint(ENDPOINTS[0])
    .observation({
        observationsOutputPath: path.join(__dirname, '../../observations.ttl'),
    })
    .schema({
        graphqlSchemaOutputPath: path.join(
            __dirname,
            '../../generated-schema.graphql',
        ),
    })
    .modelCheckpoint({
        loadModelFromCheckpoint: false,
        saveModelToFile: false,
        overwriteFile: true,
        checkpointFilePath: path.join(__dirname, '../../model-checkpoint.json'),
    })
    .hotReload({
        isEnabled: false,
    })
    .build();

const sparqless = new SPARQLess();

// This method returns a Promise, so you should await it
// if you want to do something after the server has started.
sparqless.buildSchemaAndRunEndpoint(config);
