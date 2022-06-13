import { Literal } from '@rdfjs/types';
import { uniq } from 'lodash';
import { Logger } from 'winston';
import { ClassDescriptor } from '../models/class';
import { DataModel } from '../models/data_model';
import {
    Observations,
    OntologyObservation,
    OntologyProperty,
} from '../observation/ontology';

/**
 * Class handling the parsing of SPARQL endpoint observations into an object model.
 */
export class ObservationParser {
    constructor(private logger?: Logger) {}

    /**
     * Build the class model using the provided observations.
     *
     * @param observations RDF results of observation of a SPARQL endpoint.
     * @return Complete object model of the observed data.
     */
    buildEndpointModel(observations: Observations): DataModel {
        // Creating class descriptors has to be done first
        const classDescriptors = this.createClassDescriptors(observations);

        // The order here is also important - create attribute and association
        // descriptors before we update their counts.
        this.createAttributeDescriptors(observations, classDescriptors);
        this.createAssociationDescriptors(observations, classDescriptors);
        this.createOtherPropertyDescriptors(observations, classDescriptors);

        // These depend on all properties already existing
        this.createPropertyCountDescriptors(observations, classDescriptors);
        this.markScalarProperties(observations, classDescriptors);

        return new DataModel(classDescriptors);
    }

    private createClassDescriptors(
        observations: Observations,
    ): ClassDescriptor[] {
        const descriptors: ClassDescriptor[] = [];

        for (const observation of observations[
            OntologyObservation.ClassObservation
        ] || []) {
            const classNameQuad = observation[OntologyProperty.DescribedClass]!;
            const numInstancesQuad =
                observation[OntologyProperty.NumberOfInstances]!;
            const newClass: ClassDescriptor = {
                iri: classNameQuad.object.value,
                name: '',
                numberOfInstances: parseInt(numInstancesQuad.object.value),
                attributes: [],
                associations: [],
            };

            descriptors.push(newClass);
        }

        return descriptors;
    }

    private createAttributeDescriptors(
        observations: Observations,
        classes: ClassDescriptor[],
    ) {
        for (const observation of observations[
            OntologyObservation.AttributeObservation
        ] || []) {
            const literalQuad = observation[OntologyProperty.TargetLiteral]!;
            const propertyQuad =
                observation[OntologyProperty.DescribedAttribute]!;
            const classQuad =
                observation[OntologyProperty.AttributeSourceClass]!;

            const classDescriptor = classes.find(
                (x) => x.iri === classQuad.object.value,
            )!;

            const attributeIri = propertyQuad.object.value;
            const literal = literalQuad.object as Literal;
            const attributeType = literal.datatype.value;
            // Replacing characters which are illegal in GraphQL identifiers
            const attributeLanguage = literal.language.replace(
                /[^_a-zA-Z0-9]/gi,
                '_',
            );

            const attributeDescriptor = classDescriptor.attributes.find(
                (x) => x.iri === attributeIri,
            );

            if (attributeDescriptor) {
                attributeDescriptor.types = uniq([
                    ...attributeDescriptor.types,
                    attributeType,
                ]);
                if (attributeLanguage !== '') {
                    attributeDescriptor.languages = uniq([
                        ...attributeDescriptor.languages,
                        attributeLanguage,
                    ]);
                }
            } else {
                classDescriptor.attributes.push({
                    iri: attributeIri,
                    name: '',
                    types: [attributeType],
                    languages:
                        attributeLanguage === '' ? [] : [attributeLanguage],
                    isArray: true,
                    count: 0,
                });
            }
        }
    }

    private createAssociationDescriptors(
        observations: Observations,
        classes: ClassDescriptor[],
    ) {
        for (const observation of observations[
            OntologyObservation.AssociationObservation
        ] || []) {
            const targetClassQuad = observation[OntologyProperty.TargetClass]!;
            const propertyQuad =
                observation[OntologyProperty.DescribedAssociation]!;
            const classQuad =
                observation[OntologyProperty.AssociationSourceClass]!;

            const classDescriptor = classes.find(
                (x) => x.iri === classQuad.object.value,
            )!;

            const associationIri = propertyQuad.object.value;
            const targetClassIri = targetClassQuad.object.value;
            const targetClassDescriptor = classes.find(
                (x) => x.iri === targetClassIri,
            )!;

            const associationDescriptor = classDescriptor.associations.find(
                (x) => x.iri === associationIri,
            );

            // Only add the attribute if it is not already there
            if (associationDescriptor) {
                associationDescriptor.targetClasses = uniq([
                    ...associationDescriptor.targetClasses,
                    targetClassDescriptor,
                ]);
            } else {
                classDescriptor.associations.push({
                    iri: associationIri,
                    name: '',
                    targetClasses: [targetClassDescriptor],
                    isArray: true,
                    count: 0,
                });
            }
        }
    }

    private createOtherPropertyDescriptors(
        observations: Observations,
        classes: ClassDescriptor[],
    ) {
        for (const observation of observations[
            OntologyObservation.PropertyExistenceObservation
        ] || []) {
            const propertyIri =
                observation[OntologyProperty.PropertyIri]!.object.value;
            const propertyClassIri =
                observation[OntologyProperty.PropertyOf]!.object.value;
            const classDescriptor = classes.find(
                (x) => x.iri === propertyClassIri,
            )!;
            const isPropertyDefined = [
                ...classDescriptor.attributes,
                ...classDescriptor.associations,
            ].find((x) => x.iri === propertyIri);
            if (!isPropertyDefined) {
                classDescriptor.attributes.push({
                    iri: propertyIri,
                    name: '',
                    types: ['http://www.w3.org/2001/XMLSchema#string'],
                    languages: [],
                    isArray: true,
                    count: 0,
                });
            }
        }
    }

    private createPropertyCountDescriptors(
        observations: Observations,
        classes: ClassDescriptor[],
    ) {
        for (const observation of observations[
            OntologyObservation.PropertyCountObservation
        ] || []) {
            const propertyQuad = observation[OntologyProperty.CountedProperty]!;
            const numInstancesQuad =
                observation[OntologyProperty.NumberOfPropertyInstances]!;
            const classQuad =
                observation[OntologyProperty.CountedPropertySourceClass]!;
            const classDescriptor = classes.find(
                (x) => x.iri === classQuad.object.value,
            )!;

            const descriptor = [
                ...classDescriptor.attributes,
                ...classDescriptor.associations,
            ].find((x) => x.iri === propertyQuad.object.value);

            if (descriptor) {
                descriptor.count = parseInt(numInstancesQuad.object.value);
            } else {
                this.logger?.warn(
                    `Missing descriptor for ${classDescriptor.iri}: ${propertyQuad.object.value}.`,
                );
            }
        }
    }

    private markScalarProperties(
        observations: Observations,
        classes: ClassDescriptor[],
    ) {
        for (const observation of observations[
            OntologyObservation.PropertyIsAPartialFunctionObservation
        ] || []) {
            const propertyIri =
                observation[OntologyProperty.PartialFunctionProperty]!.object
                    .value;
            const propertyDescriptor = classes
                .flatMap((x) => [...x.attributes, ...x.associations])
                .find((x) => x.iri === propertyIri);

            if (propertyDescriptor) {
                propertyDescriptor.isArray = false;
            }
        }
    }
}
