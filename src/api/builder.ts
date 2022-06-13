import { Logger } from 'winston';
import { SPARQLEndpointDefinition } from '../observation/endpoints';
import {
    Config,
    DEFAULT_HOT_RELOAD_CONFIG,
    DEFAULT_OBSERVATION_CONFIG,
    DEFAULT_POSTPROCESSING_CONFIG,
    DEFAULT_SERVER_CONFIG,
    HotReloadConfig,
    ModelCheckpointConfig,
    ObservationConfig,
    PostprocessingConfig,
    SchemaConfig,
    ServerConfig,
    SIMPLE_LOGGER,
} from './config';

/**
 * Builder class meant to assist in building the SPARQLess config.
 * This builder specifies reasonable defaults for all parts of the
 * configuration, but you may override any of them using the builder's
 * methods.
 *
 * You must first specify the SPARQL endpoint, and then you can optionally
 * configure other options before building the config.
 *
 * ```
 * const config = new SPARQLessConfigBuilder()
 *     .sparqlEndpoint('https://data.gov.cz/sparql')
 *     // Possibly more configuration here...
 *     .build();
 * ```
 *
 * Afterwards, you can use the created config to run SPARQLess:
 *
 * ```
 * const sparqless = new SPARQLess();
 * await sparqless.buildSchemaAndRunEndpoint(config);
 * ```
 *
 * Find out more about the possible configuration options
 * [here](https://mff-uk.github.io/sparqless/configuration/).
 */
export class SPARQLessConfigBuilder {
    /**
     * Configure the target SPARQL endpoint.
     *
     * @param endpointUrl URL to the SPARQL endpoint, for example `https://data.gov.cz/sparql`.
     * @param endpointName Optional short human-readable name for use in logs. Defaults to
     * `endpointUrl` if not specified.
     */
    sparqlEndpoint(
        endpointUrl: string,
        endpointName?: string,
    ): SPARQLessConfigBuilderWithEndpoint;

    /**
     * Configure the target SPARQL endpoint.
     *
     * @param endpointDefinition Definition of the SPARQL endpoint.
     */
    sparqlEndpoint(
        endpointDefinition: SPARQLEndpointDefinition,
    ): SPARQLessConfigBuilderWithEndpoint;

    sparqlEndpoint(
        endpoint: string | SPARQLEndpointDefinition,
        endpointName?: string,
    ): SPARQLessConfigBuilderWithEndpoint {
        if (typeof endpoint === 'string') {
            endpoint = {
                url: endpoint,
                name: endpointName ?? endpoint,
            };
        }
        return new SPARQLessConfigBuilderWithEndpoint(endpoint);
    }
}

/**
 * Builder class used when the SPARQL endpoint has been configured by
 * `SPARQLessConfigBuilder`. The builder is separated like this
 * to make omission of the SPARQL endpoint a compile-time error.
 */
class SPARQLessConfigBuilderWithEndpoint {
    private readonly config: Config;

    constructor(endpoint: SPARQLEndpointDefinition) {
        this.config = {
            endpoint: endpoint,
            logger: SIMPLE_LOGGER,
            observation: DEFAULT_OBSERVATION_CONFIG,
            postprocessing: DEFAULT_POSTPROCESSING_CONFIG,
            server: DEFAULT_SERVER_CONFIG,
            hotReload: DEFAULT_HOT_RELOAD_CONFIG,
        };
    }

    /**
     * Finish the configuration building process and return
     * the complete configuration object.
     */
    build(): Config {
        return this.config;
    }

    /**
     * Configure the logger used by SPARQLess to print its
     * log messages. It is highly recommended to leave warnings
     * and errors enabled. Debug and info levels still print useful
     * information which helps you understand what SPARQLess is doing.
     *
     * The `logger` should be a [winston](https://github.com/winstonjs/winston)
     * logger. Note that a sane console logger is already specified by default,
     * you only need to use this method if you want to configure your own.
     */
    logger(logger: Logger): SPARQLessConfigBuilderWithEndpoint {
        this.config.logger = logger;
        return this;
    }

    /**
     * Find out more about the configuration options
     * [here](https://mff-uk.github.io/sparqless/configuration/).
     */
    observation(
        observationConfig: Partial<ObservationConfig>,
    ): SPARQLessConfigBuilderWithEndpoint {
        this.config.observation = {
            ...this.config.observation,
            ...observationConfig,
        };

        return this;
    }

    /**
     * Find out more about the configuration options
     * [here](https://mff-uk.github.io/sparqless/configuration/).
     */
    postprocessing(
        postprocessingConfig: Partial<PostprocessingConfig>,
    ): SPARQLessConfigBuilderWithEndpoint {
        this.config.postprocessing = {
            ...this.config.postprocessing,
            ...postprocessingConfig,
        };

        return this;
    }

    /**
     * Find out more about the configuration options
     * [here](https://mff-uk.github.io/sparqless/configuration/).
     */
    schema(schemaConfig: SchemaConfig): SPARQLessConfigBuilderWithEndpoint {
        this.config.schema = schemaConfig;

        return this;
    }

    /**
     * Find out more about the configuration options
     * [here](https://mff-uk.github.io/sparqless/configuration/).
     */
    server(
        serverConfig: Partial<ServerConfig>,
    ): SPARQLessConfigBuilderWithEndpoint {
        this.config.server = {
            ...this.config.server,
            ...serverConfig,
        };

        return this;
    }

    /**
     * Find out more about the configuration options
     * [here](https://mff-uk.github.io/sparqless/configuration/).
     */
    hotReload(
        hotReloadConfig: Partial<HotReloadConfig>,
    ): SPARQLessConfigBuilderWithEndpoint {
        this.config.hotReload = {
            ...this.config.hotReload,
            ...hotReloadConfig,
        };

        return this;
    }

    /**
     * Find out more about the configuration options
     * [here](https://mff-uk.github.io/sparqless/configuration/).
     */
    modelCheckpoint(
        modelCheckpointConfig: ModelCheckpointConfig,
    ): SPARQLessConfigBuilderWithEndpoint {
        this.config.modelCheckpoint = modelCheckpointConfig;

        return this;
    }
}
