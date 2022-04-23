import { makeSchema, queryType } from 'nexus';
import {
    NexusGraphQLSchema,
    NexusObjectTypeDef,
    objectType,
} from 'nexus/dist/core';
import { ClassDescriptor } from '../models/class';

/**
 * Generate a complete GraphQL schema from class descriptors.
 * This schema may then be used by a GraphQL server.
 *
 * @param classes Class descriptors describing the SPARQL endpoint.
 * @return Generated GraphQL schema.
 */
export function createSchema(classes: ClassDescriptor[]): NexusGraphQLSchema {
    const endpointTypes = createEndpointTypes(classes);

    // TODO: add resolvers functionality (big feature)
    const query = queryType({
        definition(t) {
            for (const classDescriptor of classes) {
                t.field(classDescriptor.name, {
                    type: classDescriptor.name,
                });
            }
        },
    });

    const schema = makeSchema({
        types: [query, ...endpointTypes],
    });

    return schema;
}

function createEndpointTypes(
    classes: ClassDescriptor[],
): NexusObjectTypeDef<any>[] {
    return classes.map((classDescriptor) =>
        objectType({
            name: classDescriptor.name,
            definition(t) {
                for (const attribute of classDescriptor.attributes) {
                    const fieldConfig = {
                        description: `This attribute has ${attribute.count} occurences.\n
Original IRI is ${attribute.iri}.`,
                    };
                    if (attribute.type.endsWith('string')) {
                        t.string(attribute.name, fieldConfig);
                    } else if (attribute.type.endsWith('integer')) {
                        t.int(attribute.name, fieldConfig);
                    } else if (attribute.type.endsWith('boolean')) {
                        t.boolean(attribute.name, fieldConfig);
                    } else {
                        // TODO: what should we do about other attribute types? Like dates or custom ones
                        t.string(attribute.name, fieldConfig);
                    }
                }

                for (const association of classDescriptor.associations) {
                    t.field(association.name, {
                        type: association.targetClass.name,
                        description: `This association has ${association.count} occurences.\n
Original IRI is ${association.iri}.`,
                    });
                }

                t.string('_rdf_iri', {
                    description: 'IRI representing this particular object.',
                });
                t.string('_rdf_type', {
                    description:
                        'IRI representing the RDF type of this object.',
                });
            },
            description: `Generated SPARQL class with ${classDescriptor.numberOfInstances} instances.\n
Original IRI is ${classDescriptor.iri}.`,
        }),
    );
}
