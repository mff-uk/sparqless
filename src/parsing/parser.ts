import { groupBy } from 'lodash';
import { ClassDescriptor } from '../models/class';
import { QueryResult } from '../observation/client';
import { buildNamesFromIRIs } from './names';

const OBS_PREFIX = 'http://skodapetr.eu/ontology/sparql-endpoint/';
const OBS_CLASS = OBS_PREFIX + 'class';
const OBS_NUM_INSTANCES = OBS_PREFIX + 'numberOfInstances';
const OBS_RESOURCE = OBS_PREFIX + 'resource';
const OBS_PROPERTY = OBS_PREFIX + 'property';
const OBS_TARGET_LITERAL = OBS_PREFIX + 'targetLiteral';
const OBS_SOURCE_CLASS = OBS_PREFIX + 'sourceClass';
const OBS_TARGET_CLASS = OBS_PREFIX + 'targetClass';

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
    buildEndpointModel(observations: QueryResult[]): ClassDescriptor[] {
        // Creating class descriptors has to be done first
        const classDescriptors = this.createClassDescriptors(observations);

        this.createInstanceDescriptors(observations, classDescriptors);

        // The order here is also important - create attribute and association
        // descriptors before we update their counts.
        this.createAttributeDescriptors(observations, classDescriptors);
        this.createAssociationDescriptors(observations, classDescriptors);

        this.createPropertyCountDescriptors(observations, classDescriptors);

        // Convert IRIs into names and make them as short as possible
        buildNamesFromIRIs(classDescriptors);
        for (const classDescriptor of classDescriptors) {
            // It's not a problem if these identifiers clash across classes.
            // We do have to make sure that attributes and associations don't clash though.
            buildNamesFromIRIs([
                ...classDescriptor.attributes,
                ...classDescriptor.associations,
            ]);
        }

        return classDescriptors;
    }

    private createClassDescriptors(
        observations: QueryResult[],
    ): ClassDescriptor[] {
        const descriptors: ClassDescriptor[] = [];

        for (const queryResult of observations) {
            const groupedResults = groupBy(
                queryResult.quads,
                (quad) => quad.subject.value,
            );
            for (const [_key, value] of Object.entries(groupedResults)) {
                const classNameQuad = value.find(
                    (x) => x.predicate.value === OBS_CLASS,
                );

                if (classNameQuad) {
                    const numInstancesQuad = value.find(
                        (x) => x.predicate.value === OBS_NUM_INSTANCES,
                    );
                    if (numInstancesQuad) {
                        const newClass: ClassDescriptor = {
                            iri: classNameQuad.object.value,
                            name: '',
                            numberOfInstances: parseInt(
                                numInstancesQuad.object.value,
                            ),
                            instances: [],
                            attributes: [],
                            associations: [],
                        };
                        descriptors.push(newClass);
                    }
                }
            }
        }

        return descriptors;
    }

    private createInstanceDescriptors(
        observations: QueryResult[],
        classes: ClassDescriptor[],
    ) {
        for (const queryResult of observations) {
            const groupedResults = groupBy(
                queryResult.quads,
                (quad) => quad.subject.value,
            );
            for (const [_key, value] of Object.entries(groupedResults)) {
                const resourceQuad = value.find(
                    (x) => x.predicate.value === OBS_RESOURCE,
                );
                if (resourceQuad) {
                    const classNameQuad = value.find(
                        (x) => x.predicate.value === OBS_CLASS,
                    );
                    const classIri = classNameQuad!.object.value;
                    const classDescriptor = classes.find(
                        (x) => x.iri === classIri,
                    )!;
                    classDescriptor.instances.push({
                        iri: resourceQuad.object.value,
                    });
                }
            }
        }
    }

    private createAttributeDescriptors(
        observations: QueryResult[],
        classes: ClassDescriptor[],
    ) {
        for (const queryResult of observations) {
            const groupedResults = groupBy(
                queryResult.quads,
                (quad) => quad.subject.value,
            );
            for (const [_key, value] of Object.entries(groupedResults)) {
                const literalQuad = value.find(
                    (x) => x.predicate.value === OBS_TARGET_LITERAL,
                );
                if (literalQuad) {
                    const propertyQuad = value.find(
                        (x) => x.predicate.value === OBS_PROPERTY,
                    )!;
                    const classQuad = value.find(
                        (x) => x.predicate.value === OBS_SOURCE_CLASS,
                    )!;

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
                            (x) =>
                                x.iri === attributeIri &&
                                x.type === attributeType,
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
        }
    }

    private createAssociationDescriptors(
        observations: QueryResult[],
        classes: ClassDescriptor[],
    ) {
        for (const queryResult of observations) {
            const groupedResults = groupBy(
                queryResult.quads,
                (quad) => quad.subject.value,
            );
            for (const [_key, value] of Object.entries(groupedResults)) {
                const targetClassQuad = value.find(
                    (x) => x.predicate.value === OBS_TARGET_CLASS,
                );
                if (targetClassQuad) {
                    const propertyQuad = value.find(
                        (x) => x.predicate.value === OBS_PROPERTY,
                    )!;
                    const classQuad = value.find(
                        (x) => x.predicate.value === OBS_SOURCE_CLASS,
                    )!;

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
        }
    }

    private createPropertyCountDescriptors(
        observations: QueryResult[],
        classes: ClassDescriptor[],
    ) {
        for (const queryResult of observations) {
            const groupedResults = groupBy(
                queryResult.quads,
                (quad) => quad.subject.value,
            );
            for (const [_key, value] of Object.entries(groupedResults)) {
                const propertyQuad = value.find(
                    (x) => x.predicate.value === OBS_PROPERTY,
                );
                const numInstancesQuad = value.find(
                    (x) => x.predicate.value === OBS_NUM_INSTANCES,
                );
                const classQuad = value.find(
                    (x) => x.predicate.value === OBS_SOURCE_CLASS,
                );
                if (propertyQuad && numInstancesQuad && classQuad) {
                    const targetClassQuad = value.find(
                        (x) => x.predicate.value === OBS_TARGET_CLASS,
                    );

                    const classDescriptor = classes.find(
                        (x) => x.iri === classQuad.object.value,
                    )!;

                    // The descriptors already have to exist
                    if (targetClassQuad) {
                        const associationDescriptor =
                            classDescriptor.associations.find(
                                (x) =>
                                    x.iri === propertyQuad.object.value &&
                                    x.targetClass.iri ===
                                        targetClassQuad.object.value,
                            );
                        associationDescriptor!.count = parseInt(
                            numInstancesQuad.object.value,
                        );
                    } else {
                        // TODO: is this filtering enough? Can we have duplicate attributes, in which case
                        //       this would be inaccurate, because it would get assigned to the first one?
                        //       Also the duplicates could be causing unnecessary name clashes.
                        const attributeDescriptor =
                            classDescriptor.attributes.find(
                                (x) => x.iri === propertyQuad.object.value,
                            );

                        // Interestingly, sometimes attributeDescriptor is not found. How is that possible?
                        if (attributeDescriptor) {
                            attributeDescriptor.count = parseInt(
                                numInstancesQuad.object.value,
                            );
                        }
                    }
                }
            }
        }
    }
}
