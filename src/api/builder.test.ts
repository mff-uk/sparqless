import { SPARQLessConfigBuilder } from './builder';
import {
    DEFAULT_HOT_RELOAD_CONFIG,
    DEFAULT_OBSERVATION_CONFIG,
    DEFAULT_POSTPROCESSING_CONFIG,
    DEFAULT_SERVER_CONFIG,
} from './config';

test('builder without any configuration returns defaults', () => {
    const config = new SPARQLessConfigBuilder()
        .sparqlEndpoint('https://data.gov.cz/sparql')
        .build();

    expect(config.endpoint).toEqual({
        url: 'https://data.gov.cz/sparql',
        name: 'https://data.gov.cz/sparql',
    });
    expect(config.observation).toBe(DEFAULT_OBSERVATION_CONFIG);
    expect(config.postprocessing).toBe(DEFAULT_POSTPROCESSING_CONFIG);
    expect(config.server).toBe(DEFAULT_SERVER_CONFIG);
    expect(config.hotReload).toBe(DEFAULT_HOT_RELOAD_CONFIG);
});

test('builder with extra configuration replaces defaults', () => {
    const config = new SPARQLessConfigBuilder()
        .sparqlEndpoint('https://data.gov.cz/sparql')
        .observation({
            maxPropertyCount: 9999,
        })
        .build();

    expect(config.observation).toEqual({
        ...DEFAULT_OBSERVATION_CONFIG,
        maxPropertyCount: 9999,
    });
});
