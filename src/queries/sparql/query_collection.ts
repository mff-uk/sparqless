export type SparqlEndpointUrl = string;

import * as fs from 'fs';
import * as path from 'path';
import { sync } from 'glob';

/**
 * A collection of various queries tested during research.
 *
 * Queries are grouped by SPARQL endpoint.
 */
export class QueryCollection {
    private endpointMapping: Record<string, SparqlEndpointUrl> = {
        'data.gov.cz': 'https://data.gov.cz/sparql',
        'eea.europa.eu': 'https://semantic.eea.europa.eu/sparql',
    };

    getQueries(endpointName?: string): EndpointQueryCollection[] {
        const returnedQueries = [];
        for (const currentEndpointName in this.endpointMapping) {
            if (endpointName && endpointName !== currentEndpointName) {
                continue;
            }

            returnedQueries.push(
                this.getQueriesForEndpoint(currentEndpointName),
            );
        }

        return returnedQueries;
    }

    private getQueriesForEndpoint(
        endpointName: string,
    ): EndpointQueryCollection {
        const endpointPath = path.join(__dirname, endpointName);
        if (!fs.existsSync(endpointPath)) {
            return new EndpointQueryCollection(
                endpointName,
                this.endpointMapping[endpointName],
                {},
            );
        }
        const fileNames = sync(path.join(endpointPath, '*.sparql'));
        const queries: Record<string, SparqlEndpointUrl> = {};
        fileNames.forEach(
            (fileName) =>
                (queries[path.basename(fileName)] = fs
                    .readFileSync(fileName)
                    .toString()),
        );

        return new EndpointQueryCollection(
            endpointName,
            this.endpointMapping[endpointName],
            queries,
        );
    }
}

/**
 * Data class containing the list of queries for a particular SPARQL endpoint.
 */
export class EndpointQueryCollection {
    constructor(
        readonly endpointName: string,
        readonly endpointUrl: SparqlEndpointUrl,
        /** Map of query names to actual SPARQL query strings. */
        readonly queries: Record<string, string>,
    ) {}
}
