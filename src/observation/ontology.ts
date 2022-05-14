import { ONTOLOGY_PREFIX_IRI } from '../api/config';
import { Quad } from 'rdf-js';

export enum OntologyObservation {
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
    resource: OntologyObservation | OntologyProperty,
): string {
    return `${ONTOLOGY_PREFIX_IRI}${resource}`;
}

export type ObservationQuads = Partial<Record<OntologyProperty, Quad>>;
export type Observations = Partial<
    Record<OntologyObservation, ObservationQuads[]>
>;
