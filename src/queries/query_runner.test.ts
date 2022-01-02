import { QueryRunner } from './query_runner';
import { QueryCollectionLoader } from './sparql/query_collection';

const collection = new QueryCollectionLoader();
const queries = collection.getQueries();

const testData = queries.flatMap((collection) =>
    collection.endpoints.flatMap((endpoint) =>
        Object.keys(collection.queries).map((queryName) => ({
            collectionName: collection.collectionName,
            endpointName: endpoint.endpointName,
            endpointUrl: endpoint.endpointUrl,
            queryName: queryName,
            queryString: collection.queries[queryName],
            executionConfig: collection.executionConfig,
        })),
    ),
);

test.each(testData)(
    // TODO: the variable interpolation from jest gets escaped by the VSCode jest extension,
    //       meaning that the test will get skipped when you debug from VSCode.
    //       If you need to debug, comment the test name and uncomment the one without variables.
    // `run test query and check its duration`,
    `run test query [$collectionName] $queryName against $endpointName and check its duration`,
    ({ endpointUrl, queryString, executionConfig }) => {
        expect.assertions(1);

        const runner = new QueryRunner(endpointUrl);
        const elapsedTimeMs = runner.runTestQuery(queryString);

        // TODO: The timeout is currently not acting as a proper timeout.
        //       The test will finish running regardless, it will just fail in case it took too long.
        //       Is it worth canceling the requests if they would cause a timeout?
        const maxElapsedTimeMs = executionConfig?.timeoutMs ?? 2000;
        return expect(elapsedTimeMs).resolves.toBeLessThan(maxElapsedTimeMs);
    },
);
