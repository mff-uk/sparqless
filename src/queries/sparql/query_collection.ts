import * as fs from 'fs';
import * as path from 'path';
import { sync } from 'glob';
import { QueryLoader } from './query_loader';
import { EndpointDetails, Endpoints, SparqlEndpointUrl } from './endpoints';
import { QueryExecutionConfig } from './query_config';
import { QueryCollectionConfig } from './collection_config';

/**
 * A collection of various queries tested during research.
 *
 * Queries are grouped by SPARQL endpoint.
 */
export class QueryCollectionLoader {
    /**
     * Return the set of all configured query collections, optionally filtering by name.
     * Query collections must be present in {QueryCollectionConfig} in order to be processed.
     * Simply creating the folder without specifying a configuration will cause the collection
     * to be ignored.
     *
     * @param {string} collectionName If defined, only the specified collection will be present in the results.
     * @return {QueryCollection[]} The loaded query collections.
     */
    getQueries(collectionName?: string): QueryCollection[] {
        const returnedCollections = [];
        for (const currentCollectionName in QueryCollectionConfig.config) {
            if (collectionName && collectionName !== currentCollectionName) {
                continue;
            }

            returnedCollections.push(
                this.getQueriesForCollection(currentCollectionName),
            );
        }

        return returnedCollections;
    }

    private getQueriesForCollection(collectionName: string): QueryCollection {
        const collectionpath = path.join(
            __dirname,
            'collections',
            collectionName,
        );
        if (!fs.existsSync(collectionpath)) {
            return new QueryCollection(
                collectionName,
                this.getEndpointDetailsForCollection(collectionName),
                {},
                QueryCollectionConfig.config[
                    collectionName
                ].config.executionConfig,
            );
        }
        const fileNames = sync(path.join(collectionpath, '*.sparql'));
        const loader = new QueryLoader(
            QueryCollectionConfig.config[collectionName].config,
        );
        const queries: Record<string, SparqlEndpointUrl> = {};
        fileNames.forEach(
            (fileName) =>
                (queries[path.basename(fileName)] =
                    loader.load_query(fileName)),
        );

        return new QueryCollection(
            collectionName,
            this.getEndpointDetailsForCollection(collectionName),
            queries,
            QueryCollectionConfig.config[collectionName].config.executionConfig,
        );
    }

    private getEndpointDetailsForCollection(
        collectionName: string,
    ): EndpointDetails[] {
        const collection = QueryCollectionConfig.config[collectionName];
        return collection.endpointNames.map(
            (name) =>
                new EndpointDetails(name, Endpoints.endpointMapping[name]),
        );
    }
}

/**
 * Data class containing the list of queries for a particular set of SPARQL endpoints.
 */
export class QueryCollection {
    constructor(
        readonly collectionName: string,
        readonly endpoints: EndpointDetails[],
        /** Map of query names to actual SPARQL query strings. */
        readonly queries: Record<string, string>,
        readonly executionConfig?: QueryExecutionConfig,
    ) {}
}
