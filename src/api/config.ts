import path from 'path';
import winston from 'winston';
import { SPARQLEndpointDefinition } from '../observation/endpoints';

// If set, this no more than MAX_PROPERTY_COUNT instances of properties
// will be searched when counting properties. This can greatly speed up
// observation on very large datasets.
export const MAX_PROPERTY_COUNT: number | undefined = 1000;

// The port which the application will run on
export const PORT = 4000;

// Show extra detailed logs, it's recommended to leave this disabled
// unless you know you need it.
export const DETAILED_LOG = false;

// The IRI used as a prefix for the observation ontology
export const ONTOLOGY_PREFIX_IRI =
    'http://skodapetr.eu/ontology/sparql-endpoint/';

// If set, a generated GraphQL schema will be saved to the configured file.
export const GRAHPQL_SCHEMA_OUTPUT_PATH: string | undefined = path.join(
    __dirname,
    '../../../generated-schema.graphql',
);

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
     */
    maxPropertyCount: number | undefined;

    /**
     * The IRI used as a prefix for the ontology created during observation.
     */
    ontologyPrefixIri: string;
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
    maxPropertyCount: 1000,
    ontologyPrefixIri: 'http://skodapetr.eu/ontology/sparql-endpoint/',
};
