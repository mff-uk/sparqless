import { DataFactory } from 'rdf-data-factory';
import { ObservationConfig } from '../../api/config';
import { SPARQLEndpointDefinition } from '../endpoints';
import { ObservationQuads } from '../ontology';
import { PropertyObserver } from './property';

test('property observer gathers property existence observations', async () => {
    const endpoint: SPARQLEndpointDefinition = {
        url: 'https://data.gov.cz/sparql',
        name: 'CZ Government Open Data',
    };
    const config: ObservationConfig = {
        ontologyPrefixIri: 'http://example.com/',
    };
    const factory = new DataFactory();
    const classObservations: ObservationQuads[] = [
        {
            describedClass: factory.quad(
                factory.blankNode('classObservation1'),
                factory.namedNode('http://example.com/describedClass'),
                factory.namedNode('http://www.w3.org/ns/dcat#Catalog'),
            ),
            numberOfInstances: factory.quad(
                factory.blankNode('classObservation1'),
                factory.namedNode('http://example.com/numberOfInstances'),
                factory.namedNode('38'),
            ),
        },
    ];
    const observer = new PropertyObserver();

    const observations = await observer.observeEndpoint(
        classObservations,
        endpoint,
        config,
    );

    expect(observations.PropertyExistenceObservation).not.toBe(undefined);
    expect(observations.PropertyExistenceObservation!.length).toBeGreaterThan(
        10,
    );
    expect(
        observations.PropertyExistenceObservation!.every(
            (x) => x.propertyIri != undefined && x.propertyOf != undefined,
        ),
    ).toBe(true);
});
