import { cloneDeep } from 'lodash';
import winston from 'winston';
import { ClassDescriptor } from '../models/class';
import { SPARQLEndpointDefinition } from '../observation/endpoints';
import { buildNamesFromIRIs } from '../postprocessing/hooks/names';
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
}

export interface ObservationConfig {
    /**
     * If set, this no more than `maxPropertyCount` instances of properties
     * will be searched when counting properties. If set to `undefined`,
     * counting property instances is unlimited.
     *
     * Setting this value can greatly speed up observation on very large datasets.
     * A good compromise is to set this value relatively low (~1000), and configure
     * schema hot reload to iteratively increase this value to search a larger portion
     * of the dataset while the GraphQL endpoint is already functional.
     */
    maxPropertyCount: number | undefined;

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
    shouldDetectNonArrayProperties: boolean | undefined;

    /**
     * If `true`, observations will be made which count the number of times
     * each property occurs in the dataset. If this is not enabled,
     * all property counts will be displayed as `0`.
     */
    shouldCountProperties: boolean | undefined;
}

export interface PostprocessingConfig {
    hooks: PostprocessingHookDict;
}

export interface SchemaConfig {
    /**
     * If set to a string containing a path to a file, the generated GraphQL schema
     * will be saved to the configured file when the GraphQL schema is created.
     *
     * If `undefined`, the generated schema will not be saved to a file on disk.
     */
    graphqlSchemaOutputPath: string | undefined;
}

export interface ServerConfig {
    /**
     * The port which the GraphQL server will run on.
     */
    port: number;

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
    hotReload?: {
        /**
         * Funciton creating a new `ObservationConfig` for the next
         * iteration of hot reloading. Note that it should return a new
         * instance of `ObservationConfig`, the original one should
         * not be modified.
         */
        configIterator: (
            config: ObservationConfig,
            oldModel: ClassDescriptor[],
        ) => ObservationConfig;

        /**
         * After each hot reload iteration, this function is polled
         * to decide whether hot reloading should continue.
         * This function can compare the old and new data model
         * to determine whether iterating again makes sense.
         */
        shouldIterate: (
            config: ObservationConfig,
            oldModel: ClassDescriptor[],
            newModel: ClassDescriptor[],
        ) => boolean;
    };
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
    ontologyPrefixIri: 'http://skodapetr.eu/ontology/sparql-endpoint/',
    shouldDetectNonArrayProperties: true,
    shouldCountProperties: true,
};

export const DEFAULT_POSTPROCESSING_CONFIG: PostprocessingConfig = {
    hooks: {
        entity: [],
        namedEntity: [buildNamesFromIRIs],
        class: [],
        instance: [],
        property: [],
        association: [],
        attribute: [],
    },
};

export const DEFAULT_SERVER_CONFIG: ServerConfig = {
    port: 4000,
    hotReload: {
        configIterator: (config, _oldModel) => {
            // Examine 10 times more properties than in the last iteration.

            const newConfig = cloneDeep(config);

            if (newConfig.maxPropertyCount) {
                newConfig.maxPropertyCount *= 10;
            }

            // Check for scalar properties during hot reloading
            newConfig.shouldDetectNonArrayProperties = true;

            // Count properties during hot reload
            newConfig.shouldCountProperties = true;
            return newConfig;
        },
        shouldIterate: (_config, oldModel, newModel) => {
            // Check if the maximum property count changed in the last iteration.
            // If not, then there is no point in continuing to count them, since
            // we already have everything counted.

            const getMaxPropertyCount = (model: ClassDescriptor[]) =>
                Math.max(
                    ...model
                        .flatMap((x) => [...x.attributes, ...x.associations])
                        .map((x) => x.count),
                );

            const maxPropertyCountOld = getMaxPropertyCount(oldModel);
            const maxPropertyCountNew = getMaxPropertyCount(newModel);

            if (maxPropertyCountOld === maxPropertyCountNew) {
                return false;
            }

            return true;
        },
    },
};
