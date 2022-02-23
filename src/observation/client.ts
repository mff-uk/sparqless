import { Quad } from 'rdf-js';
import StreamClient from 'sparql-http-client';
import { SPARQLEndpointDefinition } from './endpoints';

export class EndpointClient {
    constructor(private endpoint: SPARQLEndpointDefinition) { }

    async runQuery(query: string): Promise<QueryResult> {
        const client = new StreamClient({
            endpointUrl: this.endpoint.url,
        });
        const startTime = performance.now();
        const stream = await client.query.construct(query);

        return new Promise((resolve, reject) => {
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

            console.debug(
                `Got ${queryResult.quads.length} quads from ${this.endpoint.name} in ${(
                    queryResult.elapsedTimeMs / 1000
                ).toFixed(2)}s.`,
            );

            return queryResult;
        });
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
