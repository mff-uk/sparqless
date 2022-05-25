import { DataFactory } from 'rdf-data-factory';
import { ObservationConfig } from '../../api/config';
import { SPARQLEndpointDefinition } from '../endpoints';
import { ObservationQuads } from '../ontology';
import { PropertyCountObserver } from './property_count';

test('property count observer gathers property count observations', async () => {
    const endpoint: SPARQLEndpointDefinition = {
        url: 'https://data.gov.cz/sparql',
        name: 'CZ Government Open Data',
    };
    const config: ObservationConfig = {
        ontologyPrefixIri: 'http://example.com/',
        maxPropertyCount: 1000,
        shouldCountProperties: true,
    };
    const factory = new DataFactory();
    const propertyObservations: ObservationQuads[] = [
        {
            propertyOf: factory.quad(
                factory.blankNode('propertyObservation1'),
                factory.namedNode('http://example.com/propertyOf'),
                factory.namedNode('http://www.w3.org/ns/dcat#Catalog'),
            ),
            propertyIri: factory.quad(
                factory.blankNode('propertyObservation1'),
                factory.namedNode('http://example.com/propertyIri'),
                factory.namedNode('http://purl.org/dc/terms/title'),
            ),
        },
    ];
    const observer = new PropertyCountObserver();

    const observations = await observer.observeEndpoint(
        propertyObservations,
        endpoint,
        config,
    );

    expect(observations.PropertyCountObservation).not.toBe(undefined);
    expect(observations.PropertyCountObservation!.length).toBe(1);
    expect(
        observations.PropertyCountObservation!.every(
            (x) =>
                x.countedProperty != undefined &&
                x.countedPropertySourceClass != undefined &&
                x.numberOfPropertyInstances != undefined,
        ),
    ).toBe(true);
});
