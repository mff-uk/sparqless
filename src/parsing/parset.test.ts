import { DataFactory } from 'rdf-data-factory';
import { Observations } from '../observation/ontology';
import { ObservationParser } from './parser';

test('parser creates single class descriptor', () => {
    const factory = new DataFactory();
    const observations: Observations = {
        ClassObservation: [
            {
                describedClass: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/describedClass'),
                    factory.namedNode('http://example.com/Cat'),
                ),
                numberOfInstances: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/numberOfInstances'),
                    factory.literal('42'),
                ),
            },
        ],
        PropertyExistenceObservation: [],
        AttributeObservation: [],
        AssociationObservation: [],
        PropertyCountObservation: [],
        PropertyIsAPartialFunctionObservation: [],
    };

    const parser = new ObservationParser({
        endpoint: { url: 'PLACEHOLDER', name: 'PLACEHOLDER' },
    });
    const model = parser.buildEndpointModel(observations);

    expect(model.descriptors.length).toBe(1);
    expect(model.descriptors[0].numberOfInstances).toBe(42);
});

test('parser creates attribute descriptors', () => {
    const factory = new DataFactory();
    const observations: Observations = {
        ClassObservation: [
            {
                describedClass: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/describedClass'),
                    factory.namedNode('http://example.com/Cat'),
                ),
                numberOfInstances: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/numberOfInstances'),
                    factory.namedNode('42'),
                ),
            },
        ],
        PropertyExistenceObservation: [],
        AttributeObservation: [
            {
                describedAttribute: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode('http://example.com/describedAttribute'),
                    factory.namedNode('http://example.com/numberOfLegs'),
                ),
                attributeSourceClass: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode(
                        'http://example.com/attributeSourceClass',
                    ),
                    factory.namedNode('http://example.com/Cat'),
                ),
                targetLiteral: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode('http://example.com/targetLiteral'),
                    factory.literal(
                        '4',
                        factory.namedNode(
                            'http://www.w3.org/2001/XMLSchema#int',
                        ),
                    ),
                ),
            },
        ],
        AssociationObservation: [],
        PropertyCountObservation: [],
        PropertyIsAPartialFunctionObservation: [],
    };

    const parser = new ObservationParser({
        endpoint: { url: 'PLACEHOLDER', name: 'PLACEHOLDER' },
    });
    const model = parser.buildEndpointModel(observations);

    expect(model.descriptors.length).toBe(1);
    expect(model.descriptors[0].attributes.length).toBe(1);
    expect(model.descriptors[0].associations.length).toBe(0);
    expect(model.descriptors[0].attributes[0].iri).toBe(
        'http://example.com/numberOfLegs',
    );
    expect(model.descriptors[0].attributes[0].types).toEqual([
        'http://www.w3.org/2001/XMLSchema#int',
    ]);
    expect(model.descriptors[0].attributes[0].isArray).toBe(true);
});

test('parser creates association descriptors', () => {
    const factory = new DataFactory();
    const observations: Observations = {
        ClassObservation: [
            {
                describedClass: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/describedClass'),
                    factory.namedNode('http://example.com/Cat'),
                ),
                numberOfInstances: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/numberOfInstances'),
                    factory.namedNode('42'),
                ),
            },
            {
                describedClass: factory.quad(
                    factory.blankNode('classObservation2'),
                    factory.namedNode('http://example.com/describedClass'),
                    factory.namedNode('http://example.com/Dog'),
                ),
                numberOfInstances: factory.quad(
                    factory.blankNode('classObservation2'),
                    factory.namedNode('http://example.com/numberOfInstances'),
                    factory.namedNode('http://example.com/5'),
                ),
            },
        ],
        PropertyExistenceObservation: [],
        AttributeObservation: [],
        AssociationObservation: [
            {
                describedAssociation: factory.quad(
                    factory.blankNode('associationObservation1'),
                    factory.namedNode('http://example.com/describedAttribute'),
                    factory.namedNode('http://example.com/friend'),
                ),
                associationSourceClass: factory.quad(
                    factory.blankNode('associationObservation1'),
                    factory.namedNode(
                        'http://example.com/associationSourceClass',
                    ),
                    factory.namedNode('http://example.com/Cat'),
                ),
                targetClass: factory.quad(
                    factory.blankNode('associationObservation1'),
                    factory.namedNode('http://example.com/targetClass'),
                    factory.namedNode('http://example.com/Dog'),
                ),
            },
        ],
        PropertyCountObservation: [],
        PropertyIsAPartialFunctionObservation: [],
    };

    const parser = new ObservationParser({
        endpoint: { url: 'PLACEHOLDER', name: 'PLACEHOLDER' },
    });
    const model = parser.buildEndpointModel(observations);

    expect(model.descriptors.length).toBe(2);
    expect(model.descriptors[0].attributes.length).toBe(0);
    expect(model.descriptors[0].associations.length).toBe(1);
    expect(model.descriptors[0].associations[0].iri).toBe(
        'http://example.com/friend',
    );
    expect(model.descriptors[0].associations[0].targetClasses.length).toBe(1);
    expect(model.descriptors[0].associations[0].targetClasses[0].iri).toBe(
        'http://example.com/Dog',
    );
    expect(model.descriptors[0].associations[0].isArray).toBe(true);
});

test('parser adds property counts to property descriptors', () => {
    const factory = new DataFactory();
    const observations: Observations = {
        ClassObservation: [
            {
                describedClass: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/describedClass'),
                    factory.namedNode('http://example.com/Cat'),
                ),
                numberOfInstances: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/numberOfInstances'),
                    factory.namedNode('42'),
                ),
            },
        ],
        PropertyExistenceObservation: [],
        AttributeObservation: [
            {
                describedAttribute: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode('http://example.com/describedAttribute'),
                    factory.namedNode('http://example.com/numberOfLegs'),
                ),
                attributeSourceClass: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode(
                        'http://example.com/attributeSourceClass',
                    ),
                    factory.namedNode('http://example.com/Cat'),
                ),
                targetLiteral: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode('http://example.com/targetLiteral'),
                    factory.literal(
                        '4',
                        factory.namedNode(
                            'http://www.w3.org/2001/XMLSchema#int',
                        ),
                    ),
                ),
            },
        ],
        AssociationObservation: [],
        PropertyCountObservation: [
            {
                countedProperty: factory.quad(
                    factory.blankNode('propertyCountObservation1'),
                    factory.namedNode('http://example.com/countedProperty'),
                    factory.namedNode('http://example.com/numberOfLegs'),
                ),
                countedPropertySourceClass: factory.quad(
                    factory.blankNode('propertyCountObservation1'),
                    factory.namedNode(
                        'http://example.com/countedPropertySourceClass',
                    ),
                    factory.namedNode('http://example.com/Cat'),
                ),
                numberOfPropertyInstances: factory.quad(
                    factory.blankNode('propertyCountObservation1'),
                    factory.namedNode(
                        'http://example.com/numberOfPropertyInstances',
                    ),
                    factory.literal('13'),
                ),
            },
        ],
        PropertyIsAPartialFunctionObservation: [],
    };

    const parser = new ObservationParser({
        endpoint: { url: 'PLACEHOLDER', name: 'PLACEHOLDER' },
    });
    const model = parser.buildEndpointModel(observations);

    expect(model.descriptors.length).toBe(1);
    expect(model.descriptors[0].attributes.length).toBe(1);
    expect(model.descriptors[0].attributes[0].iri).toBe(
        'http://example.com/numberOfLegs',
    );
    expect(model.descriptors[0].attributes[0].count).toBe(13);
});

test('parser flags property descriptors as partial functions', () => {
    const factory = new DataFactory();
    const observations: Observations = {
        ClassObservation: [
            {
                describedClass: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/describedClass'),
                    factory.namedNode('http://example.com/Cat'),
                ),
                numberOfInstances: factory.quad(
                    factory.blankNode('classObservation1'),
                    factory.namedNode('http://example.com/numberOfInstances'),
                    factory.namedNode('42'),
                ),
            },
        ],
        PropertyExistenceObservation: [],
        AttributeObservation: [
            {
                describedAttribute: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode('http://example.com/describedAttribute'),
                    factory.namedNode('http://example.com/numberOfLegs'),
                ),
                attributeSourceClass: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode(
                        'http://example.com/attributeSourceClass',
                    ),
                    factory.namedNode('http://example.com/Cat'),
                ),
                targetLiteral: factory.quad(
                    factory.blankNode('attributeObservation1'),
                    factory.namedNode('http://example.com/targetLiteral'),
                    factory.literal(
                        '4',
                        factory.namedNode(
                            'http://www.w3.org/2001/XMLSchema#int',
                        ),
                    ),
                ),
            },
        ],
        AssociationObservation: [],
        PropertyCountObservation: [
            {
                countedProperty: factory.quad(
                    factory.blankNode('propertyCountObservation1'),
                    factory.namedNode('http://example.com/countedProperty'),
                    factory.namedNode('http://example.com/numberOfLegs'),
                ),
                countedPropertySourceClass: factory.quad(
                    factory.blankNode('propertyCountObservation1'),
                    factory.namedNode(
                        'http://example.com/countedPropertySourceClass',
                    ),
                    factory.namedNode('http://example.com/Cat'),
                ),
                numberOfPropertyInstances: factory.quad(
                    factory.blankNode('propertyCountObservation1'),
                    factory.namedNode(
                        'http://example.com/numberOfPropertyInstances',
                    ),
                    factory.literal('13'),
                ),
            },
        ],
        PropertyIsAPartialFunctionObservation: [
            {
                partialFunctionProperty: factory.quad(
                    factory.blankNode('propertyIsAPartialFunctionObservation1'),
                    factory.namedNode(
                        'http://example.com/partialFunctionProperty',
                    ),
                    factory.namedNode('http://example.com/numberOfLegs'),
                ),
            },
        ],
    };

    const parser = new ObservationParser({
        endpoint: { url: 'PLACEHOLDER', name: 'PLACEHOLDER' },
    });
    const model = parser.buildEndpointModel(observations);

    expect(model.descriptors.length).toBe(1);
    expect(model.descriptors[0].attributes.length).toBe(1);
    expect(model.descriptors[0].attributes[0].iri).toBe(
        'http://example.com/numberOfLegs',
    );
    expect(model.descriptors[0].attributes[0].isArray).toBe(false);
});
