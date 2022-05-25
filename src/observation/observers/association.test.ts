import { DataFactory } from 'rdf-data-factory';
import { ObservationConfig } from '../../api/config';
import { SPARQLEndpointDefinition } from '../endpoints';
import { ObservationQuads } from '../ontology';
import { AssociationObserver } from './association';

test('association observer gathers association observations', async () => {
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
                factory.namedNode('http://www.w3.org/ns/dcat#contactPoint'),
            ),
        },
    ];
    const observer = new AssociationObserver();

    const observations = await observer.observeEndpoint(
        propertyObservations,
        endpoint,
        config,
    );

    expect(observations.AssociationObservation).not.toBe(undefined);
    expect(observations.AssociationObservation!.length).toBeGreaterThan(30);
    expect(
        observations.AssociationObservation!.every(
            (x) =>
                x.describedAssociation != undefined &&
                x.associationSourceClass != undefined &&
                x.targetClass != undefined,
        ),
    ).toBe(true);
});
