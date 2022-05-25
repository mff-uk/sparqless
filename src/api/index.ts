import { ApolloServer } from 'apollo-server';
import { AssociationObserver } from '../observation/observers/association';
import { AttributeObserver } from '../observation/observers/attribute';
import { ClassObserver } from '../observation/observers/class';
import { PropertyObserver } from '../observation/observers/property';
import { PropertyCountObserver } from '../observation/observers/property_count';
import { ObserverManager } from '../observation/observer_manager';
import { ObservationParser } from '../parsing/parser';
import { DescriptorPostprocessor } from '../postprocessing/postprocessor';
import {
    Config,
    DEFAULT_HOT_RELOAD_CONFIG,
    DEFAULT_OBSERVATION_CONFIG,
    DEFAULT_SERVER_CONFIG,
    ModelCheckpointConfig,
} from './config';
import { createSchema } from '../schema/schema';
import { set } from 'lodash';
import { Observations } from '../observation/ontology';
import { NexusGraphQLSchema } from 'nexus/dist/core';
import { PartialFunctionPropertyObserver } from '../observation/observers/partial_function';
import { DataModel } from '../models/data_model';

/**
 * Encapsulating class for the core SPARQL2GraphQL functionality,
 * meant to be a simple way of getting a GraphQL endpoint started
 * with very little configuration required.
 *
 * If you wish to have more fine-grained control over the individual
 * steps of the algorithm, you may wish to directly use the components
 * used by this class instead.
 */
export class SPARQL2GraphQL {
    /**
     * This function executes the SPARQL->GraphQL flow from start to finish,
     * ideal if you want the least configuration possible.
     *
     * Carry out observations on the configured SPARQL endpoint,
     * convert the observations into an object model, run postprocessing
     * hooks on that model, use that model to build a GraphQL schema,
     * and start a GraphQL endpoint which uses this schema.
     *
     * The started GraphQL endpoint can then be used to query
     * the configured SPARQL endpoint.
     *
     * If configured, the server will continue to hot-reload the GraphQL
     * schema with more detailed observation while the endpoint
     * is already running.
     *
     * @param config The configuration used to run SPARQL2GraphQL.
     *
     * @returns The running `ApolloServer` instance with a fully loaded
     * GraphQL schema, after hot reloading has finished (if enabled).
     */
    async buildSchemaAndRunEndpoint(config: Config): Promise<ApolloServer> {
        const [schema, model] = await this.observeAndBuildSchema(config);
        const server = await this.runServerWithSchema(schema, config);
        await this.hotReloadServerSchema(config, model, server);

        return server;
    }

    /**
     * Carry out observations against the configured endpoint,
     * build the object model from the observations, run postprocessing
     * hooks on the model and generate the GraphQL schema.
     *
     * @returns A tuple `[schema, model]` containing the generated
     * GraphQL schema and the object model which the schema was generated from.
     */
    async observeAndBuildSchema(
        config: Config,
    ): Promise<[NexusGraphQLSchema, DataModel]> {
        // Load checkpoint if enabled, otherwise undefined is returned
        let model = DataModel.loadCheckpoint(
            config.modelCheckpoint,
            config.logger,
        );
        if (!model) {
            const observations = await this.observe(config);

            config.logger?.info('Building object model...');
            const parser = new ObservationParser(config);
            model = parser.buildEndpointModel(observations);

            // Create checkpoint if enabled
            model.createCheckpoint(config.modelCheckpoint, config.logger);
        }

        config.logger?.info('Running postprocessing hooks...');
        const postprocessor = new DescriptorPostprocessor();
        postprocessor.postprocess(model, config.postprocessing);

        config.logger?.info('Creating GraphQL schema...');
        const schema = createSchema(model, config);
        return [schema, model];
    }

    /**
     * Carry out observations against the configured SPARQL endpoint
     * and return them.
     *
     * @returns Observations from the SPARQL endpoint.
     */
    async observe(config: Config): Promise<Observations> {
        const observerManager = new ObserverManager(config);
        observerManager.subscribeInit(new ClassObserver());
        observerManager.subscribe(new PropertyObserver());
        observerManager.subscribe(new AttributeObserver());
        observerManager.subscribe(new AssociationObserver());
        observerManager.subscribe(new PropertyCountObserver());
        observerManager.subscribe(new PartialFunctionPropertyObserver());

        config.logger?.info(
            `Observing endpoint "${config.endpoint.name}", this may take a while...`,
        );
        const observations: Observations = await observerManager.runObservers();
        return observations;
    }

    /**
     * Using the provided GraphQL `schema` start a GraphQL server instance on
     * the configured port.
     *
     * @param schema GraphQL schema used to start the GraphQL server.
     * @returns The running `ApolloServer` instance.
     */
    async runServerWithSchema(
        schema: NexusGraphQLSchema,
        config: Config,
    ): Promise<ApolloServer> {
        this.updateSchemaDescription(
            schema,
            0,
            config.hotReload?.isEnabled ?? false,
        );
        config.logger?.info('Starting GraphQL server...');
        const server = new ApolloServer({
            schema,
            logger: config.logger,
        });

        const serverConfig = config.server ?? DEFAULT_SERVER_CONFIG;
        const { url } = await server.listen({ port: serverConfig.port });
        config.logger?.info(`🚀 SPARQL2GraphQL server ready at ${url}`);

        return server;
    }

    /**
     * Run schema hot reload if configured. The `server` should be already configured
     * with a schema and running, and `model` should contain the model used to
     * create the current server schema.
     *
     * During every iteration of hot reloading, a new `ObservationConfig` is fetched
     * using the `configIterator` function from `ServerConfiguration.hotReload`.
     * With this config, new observations are made and a new GraphQL schema
     * is generated. The server's GraphQL schema is then seamlessly updated
     * at runtime.
     *
     * The hot reloading iterates until the `ServerConfiguration.hotReload.shouldIterate`
     * return `false`, at which points this function will return.
     */
    async hotReloadServerSchema(
        config: Config,
        model: DataModel,
        server: ApolloServer,
    ): Promise<void> {
        const hotReloadConfig = config.hotReload ?? DEFAULT_HOT_RELOAD_CONFIG;
        if (hotReloadConfig.isEnabled) {
            config.logger?.info('Schema hot reload is enabled.');
            if (!hotReloadConfig.configIterator) {
                config.logger?.error(
                    'The configIterator function must be specified in order for hot reloading to work.',
                );
                return;
            }
            if (!hotReloadConfig.shouldIterate) {
                config.logger?.error(
                    'The shouldIterate function must be specified in order for hot reloading to work.',
                );
                return;
            }

            let previousModel = model;
            let currentObservationConfig =
                config.observation ?? DEFAULT_OBSERVATION_CONFIG;
            let iteration = 0;

            while (true) {
                iteration++;
                config.logger?.info(
                    `Generating new GraphQL schema - iteration ${iteration}...`,
                );
                currentObservationConfig = hotReloadConfig.configIterator(
                    currentObservationConfig,
                    previousModel,
                );
                // Do not load data model from checkpoint during hot reload, it doesn't make sense.
                // Checpoints exist to speed up the initial load time, and hot reloading
                // wouldn't do anything if we just loaded from checkpoint every time.
                const checkpointConfig: ModelCheckpointConfig | undefined =
                    config.modelCheckpoint && {
                        ...config.modelCheckpoint,
                        loadModelFromCheckpoint: false,
                    };

                try {
                    const [newSchema, newModel] =
                        await this.observeAndBuildSchema({
                            ...config,
                            observation: currentObservationConfig,
                            modelCheckpoint: checkpointConfig,
                        });

                    const shouldContinue = hotReloadConfig.shouldIterate(
                        currentObservationConfig,
                        previousModel,
                        newModel,
                    );

                    this.updateSchemaDescription(
                        newSchema,
                        iteration,
                        shouldContinue,
                    );
                    await this.updateServerSchema(server, newSchema);
                    config.logger?.info('GraphQL schema has been updated!');

                    if (!shouldContinue) {
                        config.logger?.info('Schema reloading is finished.');
                        break;
                    }
                    previousModel = newModel;
                } catch (error) {
                    // It is not currently possible to update the server schema from here,
                    // which would be nice to do in case the reloading fails,
                    // to update the schema description to reflect that.
                    // In case of a refactor in the future, we should consider also
                    // implementing that.
                    config.logger?.error(
                        `Schema reload failed: ${error}. Stopping hot reload.`,
                    );
                    break;
                }
            }
        }
    }

    /**
     * Update the GraphQL schema for a running instance of Apollo Server.
     *
     * @param server A running server instance whose GraphQL schema should be updated.
     * @param schema The new schema.
     */
    async updateServerSchema(
        server: ApolloServer,
        schema: NexusGraphQLSchema,
    ): Promise<void> {
        // Updating the schema for Apollo Server at runtime:
        // https://github.com/apollographql/apollo-server/issues/1275#issuecomment-897486720
        const schemaDerivedData = await (
            server as any
        ).generateSchemaDerivedData(schema);
        set(server, 'schema', schema);
        set(server, 'state.schemaManager.schemaDerivedData', schemaDerivedData);
    }

    /**
     * Update the root Query type's description in the GraphQL schema to reflect
     * information about the current schema, i.e. which version it is and whether
     * a new version will be created.
     *
     * @param schema GraphQL schema to update
     * @param iteration Iteration of hot reloading
     * @param willIterate `true` if hot reloading will continue, otherwise `false`
     */
    private updateSchemaDescription(
        schema: NexusGraphQLSchema,
        iteration: number,
        willIterate: boolean,
    ) {
        const description = `Schema version ${iteration} generated at ${new Date()}.\n
${
    willIterate
        ? 'Hot reloading is still running, so the schema may be updated in the future.'
        : 'This is the final version of the schema.'
}`;

        const queryType = schema.getQueryType();
        if (queryType) {
            queryType.description = description;
        }
    }
}
