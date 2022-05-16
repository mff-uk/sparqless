import { Quad } from 'rdf-js';

/**
 * Enum containing the possible observation classes described
 * by the observation ontology. If you wish to add a new observation
 * to the ontology, it must be added here.
 */
export enum OntologyObservation {
    ClassObservation = 'ClassObservation',
    InstanceObservation = 'InstanceObservation',
    AttributeObservation = 'AttributeObservation',
    AssociationObservation = 'AssociationObservation',
    PropertyCountObservation = 'PropertyCountObservation',
    PropertyExistenceObservation = 'PropertyExistenceObservation',
    PropertyIsAPartialFunctionObservation = 'PropertyIsAPartialFunctionObservation',
}

/**
 * Enum containing the possible propertis of observation classes
 * described by the observation ontology. If you wish to add a new
 * property to one of the observation classes, it must be added here.
 */
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
    PartialFunctionProperty = 'partialFunctionProperty',
}

/**
 * Utility function for creating a full ontology IRI.
 *
 * @param prefix Prefix IRI for the created ontology.
 * @param resource Resource to prefix.
 * @returns
 */
export function ontologyIri(
    prefix: string,
    resource: OntologyObservation | OntologyProperty,
): string {
    return `${prefix}${resource}`;
}

/**
 * Describes a single observation class from the ontology, i.e.
 * a single observation.
 */
export type ObservationQuads = Partial<Record<OntologyProperty, Quad>>;

/**
 * Multiple observation grouped together by observation class.
 */
export type Observations = Partial<
    Record<OntologyObservation, ObservationQuads[]>
>;
