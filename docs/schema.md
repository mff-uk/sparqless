# Schema Creation

Schema creation occurs after [postprocessing](postprocessing.md),
at which point the data model has been finalized in the form of
descriptors.

This creation is the purpose of the `createSchema` function in
`src/api/schema.ts`. It uses the descriptors to produce a complete
GraphQL schema in the form of a `NexusGraphQLSchema`.

Normally, a schema-first approach is used for modeling GraphQL APIs,
meaning developers would first write the GraphQL schema using a schema
declaration language, and they would then build their data model
to fit that schema. Unfortunately, generating a schema description
like this would be very tedious when the schema is machine-generated,
which is our case.

Therefore SPARQL2GraphQL uses [GraphQL Nexus](https://nexusjs.org/)
as a way to define the GraphQL schema. GraphQL Nexus is a library which
facilitates code-first, declarative schema declarations. This means that
defining the GraphQL schema is a matter of converting each `ClassDescriptor`
into a type definition in the GraphQL schema, and using
its related descriptors to definte the properties of that type.

Information like the number of instances is stored in the type
and property descriptions to aid developers in exploring the dataset.
