import { ONTOLOGY_PREFIX_IRI } from '../api/config';
import { Quad } from 'rdf-js';
import { groupBy } from 'lodash';

export enum OntologyClass {
    Observation = 'Observation',
    ClassObservation = 'ClassObservation',
    InstanceObservation = 'InstanceObservation',
    AttributeObservation = 'AttributeObservation',
    AssociationObservation = 'AssociationObservation',
    PropertyCountObservation = 'PropertyCountObservation',
    PropertyExistenceObservation = 'PropertyExistenceObservation',
}

export enum OntologyProperty {
    DescribedClass = 'describedClass',
    NumberOfInstances = 'numberOfInstances',
    ClassInstance = 'classInstance',
    ParentClass = 'parentClass',
    CountedProperty = 'countedProperty',
    CountedPropertySourceClass = 'countedPropertySourceClass',
    NumberOfPropertyInstances = 'numberOfPropertyInstances',
    DescribedAttribute = 'describedAttribute',
    AttributeSourceClass = 'attributeSourceClass',
    TargetLiteral = 'targetLiteral',
    DescribedAssociation = 'describedAssociation',
    AssociationSourceClass = 'associationSourceClass',
    TargetClass = 'targetClass',
    PropertyOf = 'propertyOf',
    PropertyIri = 'propertyIri',
}

export function ontologyIri(
    resource: OntologyClass | OntologyProperty,
): string {
    return `${ONTOLOGY_PREFIX_IRI}${resource}`;
}

export type ObservationQuads = Partial<Record<OntologyProperty, Quad>>;
export type Observations = Partial<Record<OntologyClass, ObservationQuads[]>>;

export function groupObservations(quads: Quad[]): Observations {
    const observations: Observations = Object.assign(
        {},
        ...Object.values(OntologyClass).map((clazz) => ({ [clazz]: [] })),
    );
    const groupedResults = groupBy(quads, (quad) => quad.subject.value);

    for (const [_subject, subjectQuads] of Object.entries(groupedResults)) {
        const quadMap: ObservationQuads = {};
        const propertyQuads = subjectQuads.filter(
            (quad) =>
                !['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'].includes(
                    quad.predicate.value,
                ),
        );

        for (const quad of propertyQuads) {
            const ontologyProperty = getOntologyPropertyForQuad(quad);
            quadMap[ontologyProperty] = quad;
        }

        const ontologyClass = getOntologyClassForQuads(subjectQuads);
        observations[ontologyClass]!.push(quadMap);
    }

    return observations;
}

function getOntologyClassForQuads(quads: Quad[]): OntologyClass {
    const observationClassQuad = quads.find(
        (quad) =>
            quad.predicate.value ===
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    );
    if (observationClassQuad === undefined) {
        throw new Error(
            'Observation does not have a ontology type defined with rdf:type.',
        );
    }
    const observationClass = Object.entries(classIris()).find(
        ([_clazz, iri]) => observationClassQuad.object.value === iri,
    );
    if (observationClass === undefined) {
        throw new Error(
            `Unknown observation property was found when parsing observations: ${observationClassQuad.object.value}`,
        );
    }

    return observationClass[0] as OntologyClass;
}

function getOntologyPropertyForQuad(quad: Quad): OntologyProperty {
    const match = Object.entries(propertyIris()).find(
        ([_property, iri]) => quad.predicate.value === iri,
    );
    if (match === undefined) {
        throw new Error(
            `Unknown observation property was found when parsing observations: ${quad.predicate.value}`,
        );
    }

    return match[0] as OntologyProperty;
}

function classIris(): Record<OntologyClass, string> {
    return Object.assign(
        {},
        ...Object.values(OntologyClass).map((clazz) => ({
            [clazz]: ontologyIri(clazz),
        })),
    );
}

function propertyIris(): Record<OntologyProperty, string> {
    return Object.assign(
        {},
        ...Object.values(OntologyProperty).map((property) => ({
            [property]: ontologyIri(property),
        })),
    );
}
