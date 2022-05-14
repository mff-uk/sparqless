import { ClassDescriptor } from '../models/class';
import {
    Observations,
    OntologyObservation,
    OntologyProperty,
} from '../observation/ontology';

/**
 * Class handling the parsing of SPARQL endpoint observations into an object model.
 */
export class ObservationParser {
    /**
     * Build our class model using the provided observations.
     *
     * @param observations Results of `EndpointObserver`'s observation of a SPARQL endpoint.
     * @return Complete class model of the observed data.
     */
    buildEndpointModel(observations: Observations): ClassDescriptor[] {
        // Creating class descriptors has to be done first
        const classDescriptors = this.createClassDescriptors(observations);

        this.createInstanceDescriptors(observations, classDescriptors);

        // The order here is also important - create attribute and association
        // descriptors before we update their counts.
        this.createAttributeDescriptors(observations, classDescriptors);
        this.createAssociationDescriptors(observations, classDescriptors);

        this.createPropertyCountDescriptors(observations, classDescriptors);

        return classDescriptors;
    }

    private createClassDescriptors(
        observations: Observations,
    ): ClassDescriptor[] {
        const descriptors: ClassDescriptor[] = [];

        for (const observation of observations[
            OntologyObservation.ClassObservation
        ]!) {
            const classNameQuad = observation[OntologyProperty.DescribedClass]!;
            const numInstancesQuad =
                observation[OntologyProperty.NumberOfInstances]!;
            const newClass: ClassDescriptor = {
                iri: classNameQuad.object.value,
                name: '',
                numberOfInstances: parseInt(numInstancesQuad.object.value),
                instances: [],
                attributes: [],
                associations: [],
            };

            descriptors.push(newClass);
        }

        return descriptors;
    }

    private createInstanceDescriptors(
        observations: Observations,
        classes: ClassDescriptor[],
    ) {
        for (const observation of observations[
            OntologyObservation.InstanceObservation
        ]!) {
            const resourceQuad = observation[OntologyProperty.ClassInstance]!;
            const classNameQuad = observation[OntologyProperty.ParentClass]!;
            const classIri = classNameQuad.object.value;
            const classDescriptor = classes.find((x) => x.iri === classIri)!;
            classDescriptor.instances.push({
                iri: resourceQuad.object.value,
            });
        }
    }

    private createAttributeDescriptors(
        observations: Observations,
        classes: ClassDescriptor[],
    ) {
        for (const observation of observations[
            OntologyObservation.AttributeObservation
        ]!) {
            const literalQuad = observation[OntologyProperty.TargetLiteral]!;
            const propertyQuad =
                observation[OntologyProperty.DescribedAttribute]!;
            const classQuad =
                observation[OntologyProperty.AttributeSourceClass]!;

            const classDescriptor = classes.find(
                (x) => x.iri === classQuad.object.value,
            )!;

            const attributeIri = propertyQuad.object.value;
            const attributeType: string =
                // @ts-ignore
                literalQuad.object.datatype.value;

            // Only add the attribute if it is not already there
            if (
                !classDescriptor.attributes.find(
                    (x) => x.iri === attributeIri && x.type === attributeType,
                )
            ) {
                classDescriptor.attributes.push({
                    iri: attributeIri,
                    name: '',
                    type: attributeType,
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
        ]!) {
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

            // Only add the attribute if it is not already there
            if (
                !classDescriptor.associations.find(
                    (x) =>
                        x.iri === associationIri &&
                        x.targetClass.iri === targetClassIri,
                )
            ) {
                const targetClassDescriptor = classes.find(
                    (x) => x.iri === targetClassIri,
                )!;
                classDescriptor.associations.push({
                    iri: associationIri,
                    name: '',
                    targetClass: targetClassDescriptor,
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
        ]!) {
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
                console.warn(
                    `Missing descriptor for ${classDescriptor.iri}: ${propertyQuad.object.value}.`,
                );
            }
        }
    }
}
