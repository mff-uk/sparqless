import { QueryConfig } from './query_config';

export class QueryCollectionConfig {
    static readonly config: QueryCollectionDefinitionMap = {
        small_queries: {
            endpointNames: ['eea.europa.eu'],
            config: {
                templateConfig: {
                    limit: 100,
                    offset: 0,
                },
                executionConfig: {
                    timeoutMs: 2000,
                },
            },
        },
        large_queries: {
            endpointNames: ['eea.europa.eu'],
            config: {
                templateConfig: {
                    limit: 1000,
                    offset: 0,
                },
                executionConfig: {
                    timeoutMs: 3000,
                },
            },
        },
    };
}

export type QueryCollectionDefinitionMap = Record<
    string,
    QueryCollectionDefinition
>;

export class QueryCollectionDefinition {
    constructor(
        readonly endpointNames: string[],
        readonly config: QueryConfig,
    ) {}
}
