import { makeSchema, queryType } from 'nexus';
import {
    intArg,
    NexusGraphQLSchema,
    NexusObjectTypeDef,
    NexusUnionTypeDef,
    ObjectDefinitionBlock,
    objectType,
    stringArg,
    unionType,
} from 'nexus/dist/core';
import { ClassDescriptor } from '../models/class';
import { createClassResolver } from './resolvers/class';
import { createAssociationResolver } from './resolvers/association';
import { createBooleanResolver } from './resolvers/boolean';
import { getClassDescription, getPropertyDescription } from './utils';
import { Config } from '../api/config';
import { createLangStringResolver } from './resolvers/lang_string';
import { createStringResolver } from './resolvers/string';
import { createIntResolver } from './resolvers/int';
import { DataModel } from '../models/data_model';

/**
 * Generate a complete GraphQL schema from class descriptors.
 * This schema may then be used by a GraphQL server.
 *
 * @param model Class descriptors describing the SPARQL endpoint.
 * @param config SPARQL2GraphQL configuration.
 * @return Generated GraphQL schema.
 */
export function createSchema(
    model: DataModel,
    config: Config,
): NexusGraphQLSchema {
    const endpointTypes = createEndpointTypes(model.descriptors, config);

    const query = queryType({
        definition(t) {
            for (const classDescriptor of model.descriptors) {
                t.nonNull.list.field(classDescriptor.name, {
                    type: classDescriptor.name,
                    args: {
                        limit: intArg(),
                        offset: intArg(),
                        sort: stringArg({
                            description: `Sort by instance IRI.\n
Allowed values are "ASC" and "DESC" for ascending and descending sort respectively.\n
If you want pagination to return values in a stable order, you should also sort them.`,
                        }),
                        filter: stringArg({
                            description: `Only return the instance with the given IRI.`,
                        }),
                    },
                    resolve: createClassResolver(
                        classDescriptor,
                        { isArrayType: true, areFieldsOptional: false },
                        config,
                    ),
                });
            }
        },
    });

    const schema = makeSchema({
        types: [query, ...endpointTypes],
        outputs: {
            schema: config.schema?.graphqlSchemaOutputPath,
        },
        features: {
            abstractTypeStrategies: {
                __typename: true,
            },
        },
    });

    return schema;
}

function createEndpointTypes(
    classes: ClassDescriptor[],
    config: Config,
): (NexusObjectTypeDef<any> | NexusUnionTypeDef<any>)[] {
    const classTypes = classes.map((classDescriptor) =>
        objectType({
            name: classDescriptor.name,
            definition(t) {
                createAttributes(classDescriptor, t, config);
                createAssociations(classDescriptor, t, config);
                createCommonClassFields(t);
            },
            description: getClassDescription(classDescriptor),
        }),
    );

    const additionalTypes = addAdditionalTypes(classes);
    return [...classTypes, ...additionalTypes];
}

function addAdditionalTypes(
    classes: ClassDescriptor[],
): (NexusObjectTypeDef<any> | NexusUnionTypeDef<any>)[] {
    const additionalTypes = [];

    for (const classDescriptor of classes) {
        // Create language string types
        for (const attribute of classDescriptor.attributes) {
            // If the attribute has language tags, treat it as a string attribute
            // which can have language tags, plus values which don't have one.
            if (attribute.languages.length > 0) {
                const langStringTypeName = `_${classDescriptor.name}_${attribute.name}_LangString`;
                additionalTypes.push(
                    objectType({
                        name: langStringTypeName,
                        definition(langStringDef) {
                            const fieldDef = attribute.isArray
                                ? langStringDef.list
                                : langStringDef;
                            for (const language of attribute.languages) {
                                fieldDef.string(language);
                            }
                            if (attribute.types.length >= 2) {
                                fieldDef.string('_no_language');
                            }
                        },
                    }),
                );
            }
        }

        // Create association union types
        for (const association of classDescriptor.associations) {
            // Create union types for associations with more than 1 class in its range
            if (association.targetClasses.length >= 2) {
                const unionTypeName = `_${classDescriptor.name}_${association.name}_Union`;
                const union = unionType({
                    name: unionTypeName,
                    definition(t) {
                        t.members(
                            ...association.targetClasses.map((x) => x.name),
                        );
                    },
                });
                additionalTypes.push(union);
            }
        }
    }

    return additionalTypes;
}

function createAttributes(
    classDescriptor: ClassDescriptor,
    t: ObjectDefinitionBlock<any>,
    config: Config,
) {
    for (const attribute of classDescriptor.attributes) {
        const fieldConfig = {
            description: getPropertyDescription(
                attribute,
                'attribute',
                config.observation?.maxPropertyCount,
            ),
        };
        const fieldDef = attribute.isArray ? t.list : t;

        if (attribute.languages.length > 0) {
            const langStringTypeName = `_${classDescriptor.name}_${attribute.name}_LangString`;
            // Not a list on purpose, lang strings can have arrays inside them
            t.field(attribute.name, {
                ...fieldConfig,
                type: langStringTypeName,
                resolve: createLangStringResolver({
                    isArrayType: attribute.isArray,
                }),
            });
            // TODO: implement unions for attributes?
        } else if (attribute.types[0].endsWith('string')) {
            fieldDef.string(attribute.name, {
                ...fieldConfig,
                resolve: createStringResolver({
                    isArrayType: attribute.isArray,
                }),
                args: {
                    limit: intArg(),
                    offset: intArg(),
                    sort: stringArg({
                        description: `Sort by value.\n
Allowed values are "ASC" and "DESC" for ascending and descending sort respectively.\n
If you want pagination to return values in a stable order, you should also sort them.`,
                    }),
                },
            });
        } else if (attribute.types[0].endsWith('integer')) {
            fieldDef.int(attribute.name, {
                ...fieldConfig,
                resolve: createIntResolver({ isArrayType: attribute.isArray }),
                args: {
                    limit: intArg(),
                    offset: intArg(),
                    sort: stringArg({
                        description: `Sort by value.\n
Allowed values are "ASC" and "DESC" for ascending and descending sort respectively.\n
If you want pagination to return values in a stable order, you should also sort them.`,
                    }),
                },
            });
        } else if (attribute.types[0].endsWith('boolean')) {
            fieldDef.boolean(attribute.name, {
                ...fieldConfig,
                resolve: createBooleanResolver({
                    isArrayType: attribute.isArray,
                }),
                // Doesn't make sense to sort, filter or limit booleans
            });
        } else {
            // TODO: implement other custom types like floats or dates
            fieldDef.string(attribute.name, {
                ...fieldConfig,
                resolve: createStringResolver({
                    isArrayType: attribute.isArray,
                }),
                args: {
                    limit: intArg(),
                    offset: intArg(),
                    sort: stringArg({
                        description: `Sort by value.\n
Allowed values are "ASC" and "DESC" for ascending and descending sort respectively.\n
If you want pagination to return values in a stable order, you should also sort them.`,
                    }),
                },
            });
        }
    }
}

function createAssociations(
    classDescriptor: ClassDescriptor,
    t: ObjectDefinitionBlock<any>,
    config: Config,
) {
    for (const association of classDescriptor.associations) {
        const fieldDef = association.isArray ? t.list : t;
        const associationType =
            association.targetClasses.length >= 2
                ? `_${classDescriptor.name}_${association.name}_Union`
                : association.targetClasses[0].name;

        fieldDef.field(association.name, {
            type: associationType,
            description: getPropertyDescription(
                association,
                'association',
                config.observation?.maxPropertyCount,
            ),
            resolve: createAssociationResolver(
                {
                    associationDescriptor: association,
                    isArrayType: association.isArray,
                },
                config,
            ),
            args: {
                limit: intArg(),
                offset: intArg(),
                sort: stringArg({
                    description: `Sort by instance IRI.\n
Allowed values are "ASC" and "DESC" for ascending and descending sort respectively.\n
If you want pagination to return values in a stable order, you should also sort them.`,
                }),
                filter: stringArg({
                    description: `Only return the instance with the given IRI.`,
                }),
            },
        });
    }
}

function createCommonClassFields(t: ObjectDefinitionBlock<any>) {
    t.string('_rdf_iri', {
        description: 'IRI representing this particular object.',
    });
    t.string('_rdf_type', {
        description: 'IRI representing the RDF type of this object.',
    });
}
