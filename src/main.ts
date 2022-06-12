import { cloneDeep } from 'lodash';
import path from 'path';
import { SPARQLess } from './api';
import { Config, SIMPLE_LOGGER } from './api/config';
import { DataModel } from './models/data_model';
import { ENDPOINTS } from './observation/endpoints';

// Run this file if you want to run SPARQLess locally and tinker with the code.
// Feel free to modify any of the config.

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
        loadModelFromCheckpoint: false,
        saveModelToFile: false,
        overwriteFile: true,
        checkpointFilePath: path.join(__dirname, '../../model-checkpoint.json'),
    },
    hotReload: {
        isEnabled: false,
        configIterator: (config, _oldModel) => {
            // Examine 10 times more properties than in the last iteration.

            const newConfig = cloneDeep(config);

            if (newConfig.maxPropertyCount) {
                newConfig.maxPropertyCount *= 100;
            }

            // Count properties during hot reload
            newConfig.shouldCountProperties = true;

            // Check for scalar properties during hot reloading
            newConfig.shouldDetectNonArrayProperties = true;

            return newConfig;
        },
        shouldIterate: (config, _oldModel, newModel) => {
            // Check if the maximum property count changed in the last iteration.
            // If not, then there is no point in continuing to count them, since
            // we already have everything counted.

            const getMaxPropertyCount = (model: DataModel) =>
                Math.max(
                    ...model.descriptors
                        .flatMap((x) => [...x.attributes, ...x.associations])
                        .map((x) => x.count),
                );

            const maxPropertyCountNew = getMaxPropertyCount(newModel);

            if (
                !config.maxPropertyCount ||
                maxPropertyCountNew < config.maxPropertyCount
            ) {
                return false;
            }

            return true;
        },
    },
};

const sparqless = new SPARQLess();

// This method returns a Promise, so you should await it
// if you want to do something after the server has started.
sparqless.buildSchemaAndRunEndpoint(config);
