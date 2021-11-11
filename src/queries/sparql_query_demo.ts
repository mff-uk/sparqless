import { Quad, Stream } from 'rdf-js';
import StreamClient from 'sparql-http-client';

/**
 * A collection of test SPARQL queries.
 */
export class Queries {
    /**
     * Run test query.
     *
     * @return {Promise<number>} Time elapsed in milliseconds.
     */
    async runTestQuery(): Promise<number> {
        const client = new StreamClient({
            endpointUrl: 'https://query.wikidata.org/sparql',
        });
        const startTime = performance.now();

        const stream = await client.query.construct(
            'DESCRIBE <http://www.wikidata.org/entity/Q54872>',
        );
        const endTime = await this.measureQueryEnd(stream);

        return endTime - startTime;
    }

    private measureQueryEnd(stream: Stream<Quad>): Promise<number> {
        return new Promise((resolve, reject) => {
            let quadCount = 0;
            stream.on('data', (_quad) => {
                quadCount += 1;
            });
            stream.on('end', () => {
                console.log(`Got ${quadCount} quads.`);
                resolve(performance.now());
            });
            stream.on('error', (error) => {
                reject(error);
            });
        });
    }
}
