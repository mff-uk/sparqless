import { DataFactory } from 'rdf-data-factory';
import { ObservationConfig } from '../../api/config';
import { SPARQLEndpointDefinition } from '../endpoints';
import { ObservationQuads } from '../ontology';
import { PartialFunctionPropertyObserver } from './partial_function';

test('property count observer gathers property count observations', async () => {
    const endpoint: SPARQLEndpointDefinition = {
        url: 'https://data.gov.cz/sparql',
        name: 'CZ Government Open Data',
    };
    const config: ObservationConfig = {
        ontologyPrefixIri: 'http://example.com/',
        maxPropertyCount: 1000,
        shouldDetectNonArrayProperties: true,
    };
    const factory = new DataFactory();
    const propertyCountObservations: ObservationQuads[] = [
        {
            countedPropertySourceClass: factory.quad(
                factory.blankNode('propertyCountObservation1'),
                factory.namedNode(
                    'http://example.com/countedPropertySourceClass',
                ),
                factory.namedNode('http://www.w3.org/ns/dcat#Catalog'),
            ),
            countedProperty: factory.quad(
                factory.blankNode('propertyCountObservation1'),
                factory.namedNode('http://example.com/countedProperty'),
                factory.namedNode('http://purl.org/dc/terms/title'),
            ),
            numberOfPropertyInstances: factory.quad(
                factory.blankNode('propertyCountObservation1'),
                factory.namedNode(
                    'http://example.com/numberOfPropertyInstances',
                ),
                factory.namedNode('50'),
            ),
        },
    ];
    const observer = new PartialFunctionPropertyObserver();

    const observations = await observer.observeEndpoint(
        propertyCountObservations,
        endpoint,
        config,
    );

    expect(observations.PropertyIsAPartialFunctionObservation).not.toBe(
        undefined,
    );
    expect(observations.PropertyIsAPartialFunctionObservation!.length).toBe(1);
    expect(
        observations.PropertyIsAPartialFunctionObservation!.every(
            (x) => x.partialFunctionProperty != undefined,
        ),
    ).toBe(true);
});
