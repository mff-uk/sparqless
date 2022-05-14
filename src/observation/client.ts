import arrayifyStream from 'arrayify-stream';
import { SparqlEndpointFetcher } from 'fetch-sparql-endpoint';
import { Quad } from 'rdf-js';
import StreamClient from 'sparql-http-client';
import { DETAILED_LOG, ENDPOINT_TO_RUN } from '../api/config';
import { SPARQLEndpointDefinition } from './endpoints';

/**
 * Class which executes SPARQL queries against the configured
 * SPARQL endpoint, using the `method` function.
 */
export class EndpointClient {
    constructor(private endpoint: SPARQLEndpointDefinition) {}

    /**
     * Execute the given query against the configured SPARQL endpoint.
     *
     * Note that the function is asynchronous, because the request could
     * take a long time to execute on some endpoints.
     *
     * @param query SPARQL query to execute
     * @return `Promise` with results of the query
     */
    async runConstructQuery(query: string): Promise<QueryResult> {
        const client = new StreamClient({
            endpointUrl: this.endpoint.url,
        });
        const startTime = performance.now();
        const stream = await client.query.construct(query);

        return new Promise((resolve, _reject) => {
            const quads: Quad[] = [];
            stream.on('data', (_quad: Quad) => {
                quads.push(_quad);
            });
            stream.on('end', () => {
                resolve({
                    quads: quads,
                    elapsedTimeMs: this.getElapsedTime(startTime),
                    error: undefined,
                });
            });
            stream.on('error', (error: any) => {
                resolve({
                    quads: quads,
                    elapsedTimeMs: this.getElapsedTime(startTime),
                    error: error,
                });
            });
        }).then((value) => {
            const queryResult = value as QueryResult;

            if (DETAILED_LOG) {
                console.debug(
                    `Got ${queryResult.quads.length} quads from ${
                        this.endpoint.name
                    } in ${(queryResult.elapsedTimeMs / 1000).toFixed(2)}s.`,
                );
            }

            return queryResult;
        });
    }

    async runSelectQuery(query: string): Promise<any[]> {
        // Using the fetch-sparql-endpoint library for this
        // seems to give much more reliable results than sparql-http-client,
        // which would throw errors on many endpoints.
        const fetcher = new SparqlEndpointFetcher();
        const stream = await fetcher.fetchBindings(ENDPOINT_TO_RUN.url, query);
        const results = await arrayifyStream(stream);

        return results;
    }

    private getElapsedTime(startTimeMs: number): number {
        return performance.now() - startTimeMs;
    }
}

export interface QueryResult {
    quads: Quad[];
    elapsedTimeMs: number;
    error: any | undefined;
}
