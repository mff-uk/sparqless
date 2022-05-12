import { makeSchema, queryType } from 'nexus';
import {
    intArg,
    NexusGraphQLSchema,
    NexusObjectTypeDef,
    nonNull,
    objectType,
} from 'nexus/dist/core';
import { ClassDescriptor } from '../models/class';
import { createClassResolver } from '../resolvers/class';
import { createAssociationResolver } from '../resolvers/association';

/**
 * Generate a complete GraphQL schema from class descriptors.
 * This schema may then be used by a GraphQL server.
 *
 * @param classes Class descriptors describing the SPARQL endpoint.
 * @param schemaOutputPath The path where the GraphQL schema should be
 * generated. Set to `undefined` if you don't want to output
 * the generated GraphQL schema to disk.
 * @return Generated GraphQL schema.
 */
export function createSchema(
    classes: ClassDescriptor[],
    schemaOutputPath: string | undefined,
): NexusGraphQLSchema {
    const endpointTypes = createEndpointTypes(classes);

    const query = queryType({
        definition(t) {
            for (const classDescriptor of classes) {
                t.nonNull.list.field(classDescriptor.name, {
                    type: classDescriptor.name,
                    args: {
                        limit: intArg(),
                        offset: intArg(),
                    },
                    resolve: createClassResolver(classDescriptor, true),
                });
            }
        },
    });

    const schema = makeSchema({
        types: [query, ...endpointTypes],
        outputs: {
            schema: schemaOutputPath,
        },
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
                        // TODO: adding simple resolvers for booleans? and potentially integers too
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
                        resolve: createAssociationResolver(
                            classDescriptor,
                            association,
                            false,
                        ),
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
