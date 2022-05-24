import { EndpointClient } from './client';
import { SPARQLEndpointDefinition } from './endpoints';

test('SPARQL client returns results for correct SELECT query', async () => {
    const endpoint: SPARQLEndpointDefinition = {
        url: 'https://data.gov.cz/sparql',
        name: 'CZ Government Open Data',
    };
    const client = new EndpointClient(endpoint);

    const query = `
    SELECT ?homepage
    WHERE
    {
        <https://data.gov.cz/zdroj/lokální-katalogy/00551023/861588425> <http://xmlns.com/foaf/0.1/homepage> ?homepage .
    }
    LIMIT 1`;
    const result = await client.runSelectQuery(query);

    expect(result.length).toBe(1);
    expect(result[0].homepage.value).toBe('https://data.mpsv.cz');
});

test('SPARQL client returns results for correct CONSTRUCT query', async () => {
    const endpoint: SPARQLEndpointDefinition = {
        url: 'https://data.gov.cz/sparql',
        name: 'CZ Government Open Data',
    };
    const client = new EndpointClient(endpoint);

    const query = `
    CONSTRUCT
    {
        [] <http://example.com/homepage> ?homepage .
    }
    WHERE
    {
        <https://data.gov.cz/zdroj/lokální-katalogy/00551023/861588425> <http://xmlns.com/foaf/0.1/homepage> ?homepage .
    }
    LIMIT 1`;
    const result = await client.runSelectQuery(query);

    expect(result.length).toBe(1);
    expect(result[0].o.value).toBe('https://data.mpsv.cz');
});

test('SPARQL client returns error for bad CONSTRUCT query', async () => {
    const endpoint: SPARQLEndpointDefinition = {
        url: 'https://data.gov.cz/sparql',
        name: 'CZ Government Open Data',
    };
    const client = new EndpointClient(endpoint);

    const query = `
    CONSTRUCT
    {
        [] <http://example.com/homepage> UNKNOWN_VARIABLE .
    }
    WHERE
    {
        <https://data.gov.cz/zdroj/lokální-katalogy/00551023/861588425> <http://xmlns.com/foaf/0.1/homepage> ?homepage .
    }
    LIMIT 1`;
    const resultPromise = client.runConstructQuery(query);

    await expect(resultPromise).rejects.toBeDefined();
});
