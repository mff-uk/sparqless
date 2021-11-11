import { Queries } from './sparql_query_demo';

test('run test query and check its duration', () => {
    expect.assertions(1);

    const elapsedTimeMs = new Queries().runTestQuery();

    return expect(elapsedTimeMs).resolves.toBeLessThan(2000);
});
