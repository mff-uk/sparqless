# Schema Creation

Schema creation occurs after [postprocessing](postprocessing.md),
at which point the data model has been finalized in the form of
descriptors.

This creation is the purpose of the `createSchema` function in
`src/api/schema.ts`. It uses the descriptors to produce a complete
GraphQL schema in the form of a `NexusGraphQLSchema` (from the
[GraphQL Nexus](https://nexusjs.org/) library).

Normally, a schema-first approach is used for modeling GraphQL APIs,
meaning developers would first write the GraphQL schema using a schema
declaration language, and they would then build their data model
to fit that schema. However, automatically generating a schema
in the GraphQL schema language is quite cumbersome and involves
a lot of string manipulation.

Therefore SPARQL2GraphQL uses [GraphQL Nexus](https://nexusjs.org/)
as a way to define the GraphQL schema. GraphQL Nexus is a library which
facilitates code-first, declarative schema declarations. This means that
defining the GraphQL schema is a matter of converting each `ClassDescriptor`
into a type definition in the GraphQL schema, and using
its related descriptors to definte the properties of that type.

Information like the number of instances is stored in the type
and property descriptions to aid developers in exploring the dataset.

## Schema specifics

### Classes

All classes observed in the dataset have a corresponding type created
in the GraphQL schema, and this type is always queryable from the root
query.

Types in the root query support the following arguments:

- sort: takes either `ASC` or `DESC`, will ensure the ordering of results.
Class instances are sorted by their IRI.
- limit: do not return more than `limit` results
- offset: skip the first `offset` instances
- filter: given an IRI, only return the instance with this IRI

### Attributes

Attributes are represented as fields on the source type.
Strings are mapped to string fields, ints are mapped to int fields,
booleans are mapped to boolean fields and lang strings (strings which
are tagged with a language in the RDF dataset) are mapped to objects
containing the respective languages as fields.

Other types are mapped to string fields by default.

Attribute fields except for language strings and booleans support `sort`,
`limit` and `offset` arguments. For booleans these arguments do not make sense.
They may be implemented for language strings in the future.

### Associations

Associations are represented as fields on the source type,
with the target type being one of the following:

- The target type if the associaton only has a single target type
- A newly created union type joining all target types of the associaiton
in case the association has multiple target types.

Association fields support `sort`, `limit`, `offset` and `filter`
arguments.
