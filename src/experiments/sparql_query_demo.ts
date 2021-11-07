import { Quad, Stream } from "rdf-js";
import StreamClient from "sparql-http-client"

class TestClass {
    async runTest(): Promise<number> {
        const client = new StreamClient({ endpointUrl: 'https://query.wikidata.org/sparql' });
        const startTime = performance.now();

        const stream = await client.query.construct('DESCRIBE <http://www.wikidata.org/entity/Q54872>');
        const endTime = await this.measureQueryEnd(stream);

        return endTime - startTime;
    }

    measureQueryEnd(stream: Stream<Quad>): Promise<number> {
        return new Promise((resolve, reject) => {
            let quadCount = 0;
            stream.on('data', _quad => {
                quadCount += 1;
            });
            stream.on('end', () => {
                console.log(`Got ${quadCount} quads.`)
                resolve(performance.now());
            });
            stream.on('error', error => {
                reject(error);
            });
        });
    }
}

(new TestClass()).runTest().then(value => {
    console.log(`Test done! Test took ${value}ms.`);
});
