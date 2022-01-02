import { QueryRunner } from './query_runner';
import { QueryCollection } from './sparql/query_collection';

const collection = new QueryCollection();
const queries = collection.getQueries();

// TODO: consider making a way to run queries against multiple endpoints
const testData = queries.flatMap((query) =>
    Object.keys(query.queries).map((queryName) => ({
        endpointName: query.endpointName,
        endpointUrl: query.endpointUrl,
        queryName: queryName,
        queryString: query.queries[queryName],
    })),
);

test.each(testData)(
    // TODO: the variable interpolation from jest gets escaped by the VSCode jest extension,
    //       meaning that the test will get skipped when you debug from VSCode.
    //       If you need to debug, commend the test name and uncomment the one without variables.
    // `run test query and check its duration`,
    `run test query $queryName against $endpointName and check its duration`,
    ({ endpointUrl, queryString }) => {
        expect.assertions(1);

        const runner = new QueryRunner(endpointUrl);
        const elapsedTimeMs = runner.runTestQuery(queryString);

        // TODO: support different expected run times per query
        return expect(elapsedTimeMs).resolves.toBeLessThan(2000);
    },
);
