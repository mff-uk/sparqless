import { ObservationConfig } from '../../api/config';
import { SPARQLEndpointDefinition } from '../endpoints';
import { ClassObserver } from './class';

test('class observer gathers class observations', async () => {
    const endpoint: SPARQLEndpointDefinition = {
        url: 'https://data.gov.cz/sparql',
        name: 'CZ Government Open Data',
    };
    const config: ObservationConfig = {
        ontologyPrefixIri: 'http://example.com/',
    };
    const observer = new ClassObserver();

    const observations = await observer.observeEndpoint(endpoint, config);

    expect(observations.ClassObservation).not.toBe(undefined);
    expect(observations.ClassObservation!.length).toBeGreaterThan(60);
    expect(
        observations.ClassObservation!.every(
            (x) =>
                x.describedClass != undefined &&
                x.numberOfInstances != undefined,
        ),
    ).toBe(true);
});
