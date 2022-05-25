import { DataFactory } from 'rdf-data-factory';
import { ObservationConfig } from '../../api/config';
import { SPARQLEndpointDefinition } from '../endpoints';
import { ObservationQuads } from '../ontology';
import { AttributeObserver } from './attribute';

test('attribute observer gathers attribute observations', async () => {
    const endpoint: SPARQLEndpointDefinition = {
        url: 'https://data.gov.cz/sparql',
        name: 'CZ Government Open Data',
    };
    const config: ObservationConfig = {
        ontologyPrefixIri: 'http://example.com/',
        propertySampleSize: 1000,
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
    const observer = new AttributeObserver();

    const observations = await observer.observeEndpoint(
        propertyObservations,
        endpoint,
        config,
    );

    expect(observations.AttributeObservation).not.toBe(undefined);
    expect(observations.AttributeObservation!.length).toBeGreaterThan(30);
    expect(
        observations.AttributeObservation!.every(
            (x) =>
                x.describedAttribute != undefined &&
                x.attributeSourceClass != undefined &&
                x.targetLiteral != undefined,
        ),
    ).toBe(true);
});
