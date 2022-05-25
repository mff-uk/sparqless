import { cloneDeep } from 'lodash';
import winston from 'winston';
import { DataModel } from '../models/data_model';
import { SPARQLEndpointDefinition } from '../observation/endpoints';
import { buildNamesFromIris } from '../postprocessing/hooks/names';
import { PostprocessingHookDict } from '../postprocessing/hook_types';

/**
 * Configuration for SPARQL2GraphQL. Setting the `endpoint` property
 * is **mandatory**, the other configurations can be left `undefined`.
 * In that case, a default configuration will be used for those
 * configurations.
 */
export interface Config {
    /**
     * Select which SPARQL endpoint that SPARQL2GraphQL will run on - you can
     * define your own endpoint like so:
     *
     * ```
     * endpoint: {
     *    url: 'https://data.europa.eu/sparql',
     *    name: 'European Data',
     * }
     * ```
     *
     * The endpoint `name` is purely used for logging, feel free to set
     * it to anything you like.
     */
    endpoint: SPARQLEndpointDefinition;

    /**
     * A [winston](https://github.com/winstonjs/winston) `Logger` to be used
     * for logging everything SPARQL2GraphQL does. If `undefined`, nothing
     * will be logged.
     *
     * A sane pre-configured console logger is also available as `SIMPLE_LOGGER`,
     * which will log the most important information to the console.
     */
    logger?: winston.Logger;

    observation?: ObservationConfig;
    postprocessing?: PostprocessingConfig;
    schema?: SchemaConfig;
    server?: ServerConfig;

    /**
     * Configuration of hot reloading, which happen after the initial
     * observation have been made, the GraphQL schema has been generated
     * and the GraphQL endpoint is running.
     *
     * After the endpoint is live, a new `ObservationConfig` will be created
     * using `configIterator`, and it will be used to make new observations.
     * These observations will be used to create a new GraphQL schema,
     * and the server schema will be updated in the background.
     *
     * Afterwards, the `shouldIterate` function is used to determine whether
     * the hot reloading should continue in another iteration, or whether
     * it should stop.
     */
    hotReload?: HotReloadConfig;

    /**
     * Configuration of model checkpointing. Without checkpointing, every time
     * SPARQL2GraphQL is started, observations have to be performed again
     * in order to build the data model. This can take a considerable amount
     * of time.
     *
     * Model checkpointing allows you to save the model to a file after
     * observations are made, and the model is built.
     * Afterwards, this checkpoint can be used instead of making
     * new observations and building a new model. This will speed up the startup
     * time dramatically.
     */
    modelCheckpoint?: ModelCheckpointConfig;
}

export interface ObservationConfig {
    /**
     * If set, no more than `maxPropertyCount` instances of properties
     * will be searched when counting properties. If set to `undefined`,
     * counting property instances is unlimited.
     *
     * Setting this value can greatly speed up observation on very large datasets.
     * A good compromise is to set this value relatively low (~1000), and configure
     * schema hot reload to iteratively increase this value to search a larger portion
     * of the dataset while the GraphQL endpoint is already functional.
     */
    maxPropertyCount?: number;

    /**
     * When analyzing the range for each attribute and association,
     * a sample of up to `propertySampleSize` occurences is selected,
     * and their types are used to determine that property's type.
     *
     * Setting `propertySampleSize` is highly recommended, with
     * a reasonable default being `100` or `1000`. While this setting
     * may in some rare cases lead to the generated schema missing
     * some return types for some properties, leaving it unlimited
     * may result in errors during observation for large datasets,
     * where the process is unable to allocate enough memory
     * to hold all of the observations.
     */
    propertySampleSize?: number;

    /**
     * The IRI used as a prefix for the ontology created during observation.
     */
    ontologyPrefixIri: string;

    /**
     * If `true`, observations will be made about whether properties are arrays
     * or scalars. By default, all properties are treated as arrays, since
     * any property can be duplicated in RDF. Enabling scalar detection
     * will allow properties which only ever occur up to once to be shown
     * as scalars in the generated GraphQL schema.
     */
    shouldDetectNonArrayProperties?: boolean;

    /**
     * If `true`, observations will be made which count the number of times
     * each property occurs in the dataset. If this is not enabled,
     * all property counts will be displayed as `0`.
     */
    shouldCountProperties?: boolean;
}

export interface PostprocessingConfig {
    /**
     * Register your postprocessing hooks in this dictionary
     * to have them automatically run by the `DescriptorPostprocessor`.
     */
    hooks: PostprocessingHookDict;
}

export interface SchemaConfig {
    /**
     * If set to a string containing a path to a file, the generated GraphQL schema
     * will be saved to the configured file when the GraphQL schema is created.
     *
     * If `undefined`, the generated schema will not be saved to a file on disk.
     */
    graphqlSchemaOutputPath?: string;

    /**
     * If set to `true`, fields on root objects in the GraphQL query
     * will be treated as optional, meaning objects will be returned which may
     * be missing some of the specified fields. This will match the behavior
     * of all nested objects, for whom this setting cannot be changed
     * due to the unstructured nature of RDF data, where some fields
     * may be missing.
     *
     * If set to `false` or `undefined`, GraphQL queries will only return
     * root objects which contain all of the fields specified in the query.
     * Nested objects in the result may still be missing some fields.
     */
    areRootPropertiesOptional?: boolean;
}

export interface ServerConfig {
    /**
     * The port which the GraphQL server will run on.
     */
    port: number;
}

export interface ModelCheckpointConfig {
    /**
     * Set to `true` if you want SPARQL2GraphQL to load the model
     * from the file configured in `checkpointFilePath`.
     * If this is set to `true` and the file does not exist,
     * observations will be made as normal.
     */
    loadModelFromCheckpoint: boolean;

    /**
     * Set to `true` if you want the model to be saved to the
     * file configured in `checkpointFilePath` after observatiosn
     * are made, and the model is built.
     */
    saveModelToFile: boolean;

    /**
     * Set to `true` if you want to allow the model saving to
     * overwrite the previous model file if it exists.
     * If set to `false`, and the model file already exists,
     * the model will not be saved.
     */
    overwriteFile: boolean;

    /**
     * The path to the checkpoint file. This path will be used to
     * load the model checkpoint and to save it.
     */
    checkpointFilePath: string;
}

export interface HotReloadConfig {
    isEnabled: boolean;

    /**
     * Funciton creating a new `ObservationConfig` for the next
     * iteration of hot reloading. Note that it should return a new
     * instance of `ObservationConfig`, the original one should
     * not be modified.
     */
    configIterator?: (
        config: ObservationConfig,
        oldModel: DataModel,
    ) => ObservationConfig;

    /**
     * After each hot reload iteration, this function is polled
     * to decide whether hot reloading should continue.
     * This function can compare the old and new data model
     * to determine whether iterating again makes sense.
     */
    shouldIterate?: (
        config: ObservationConfig,
        oldModel: DataModel,
        newModel: DataModel,
    ) => boolean;
}

export const SIMPLE_LOGGER = winston.createLogger({
    levels: winston.config.npm.levels,
    level: 'debug',
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.label({ label: 'SPARQL2GraphQL' }),
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ level, message, label, timestamp }) => {
            return `${timestamp} [${label}] ${level}: ${message}`;
        }),
    ),
});

export const DEFAULT_OBSERVATION_CONFIG: ObservationConfig = {
    maxPropertyCount: 100,
    propertySampleSize: 1000,
    ontologyPrefixIri: 'http://skodapetr.eu/ontology/sparql-endpoint/',
    shouldDetectNonArrayProperties: false,
    shouldCountProperties: false,
};

export const DEFAULT_POSTPROCESSING_CONFIG: PostprocessingConfig = {
    hooks: {
        resource: [buildNamesFromIris],
        class: [],
        property: [],
        association: [],
        attribute: [],
    },
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
    port: 4000,
};

export const DEFAULT_HOT_RELOAD_CONFIG: HotReloadConfig = {
    isEnabled: true,
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
};
