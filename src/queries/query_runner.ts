import { Quad, Stream } from 'rdf-js';
import StreamClient from 'sparql-http-client';

/**
 * A class which can execute SPARQL queries against endpoints and measure their execution.
 */
export class QueryRunner {
    constructor(private endpointUrl: string) {}

    /**
     * Execute given SELECT query and return the elapsed time.
     *
     * @param {string} query The SELECT query to execute.
     *
     * @return {Promise<number>} Time elapsed in milliseconds.
     */
    async runTestQuery(query: string): Promise<number> {
        const client = new StreamClient({
            endpointUrl: this.endpointUrl,
        });
        const startTime = performance.now();

        const stream = await client.query.select(query);
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
