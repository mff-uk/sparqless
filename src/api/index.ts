import { ApolloServer } from 'apollo-server';
import { AssociationObserver } from '../observation/observers/association';
import { AttributeObserver } from '../observation/observers/attribute';
import { ClassObserver } from '../observation/observers/class';
import { PropertyObserver } from '../observation/observers/property';
import { PropertyCountObserver } from '../observation/observers/property_count';
import { ObserverManager } from '../observation/observer_manager';
import { ObservationParser } from '../parsing/parser';
import { DescriptorPostprocessor } from '../postprocessing/postprocessor';
import { Config, PORT } from './config';
import { createSchema } from '../schema/schema';
import { PostprocessingHookDict } from '../postprocessing/hook_types';
import { buildNamesFromIRIs } from '../postprocessing/hooks/names';

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
    constructor(private config: Config) {}

    /**
     * Carry out observations on the configured SPARQL endpoint,
     * convert the observations into an object model, run postprocessing
     * hooks on that model, use that model to build a GraphQL schema,
     * and start a GraphQL endpoint which uses this schema.
     *
     * The started GraphQL endpoint can then be used to query
     * the configured SPARQL endpoint.
     */
    async buildSchemaAndRunEndpoint(): Promise<void> {
        const observerManager = new ObserverManager(this.config);
        observerManager.subscribeInit(new ClassObserver());
        observerManager.subscribe(new PropertyObserver());
        observerManager.subscribe(new AttributeObserver());
        observerManager.subscribe(new AssociationObserver());
        observerManager.subscribe(new PropertyCountObserver());

        this.config.logger?.info(
            'Observing endpoint, this may take a while...',
        );
        const observations = await observerManager.runObservers();
        this.config.logger?.info('Building object model...');
        const parser = new ObservationParser(this.config);
        const classes = parser.buildEndpointModel(observations);

        this.config.logger?.info('Running postprocessing hooks...');
        const postprocessor = new DescriptorPostprocessor();
        const hooks = this.getRegisteredPostprocessingHooks();
        postprocessor.postprocess(classes, hooks);

        this.config.logger?.info('Creating GraphQL schema...');
        const schema = createSchema(classes, this.config);

        this.config.logger?.info('Starting GraphQL server...');
        const server = new ApolloServer({ schema, logger: this.config.logger });

        const { url } = await server.listen({ port: PORT });
        this.config.logger?.info(`🚀 SPARQL2GraphQL server ready at ${url}`);
    }

    getRegisteredPostprocessingHooks(): PostprocessingHookDict {
        const hooks: PostprocessingHookDict = {
            entity: [],
            namedEntity: [],
            class: [],
            instance: [],
            property: [],
            association: [],
            attribute: [],
        };

        // Register hooks here.
        // Note that you can use type contravariance for the descriptors here,
        // meaning that you can for example use a PostprocessingHook<Property>
        // and use it as an association or attribute hook.
        hooks.namedEntity.push(buildNamesFromIRIs);

        return hooks;
    }
}
