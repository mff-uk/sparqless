# Postprocessing

The postprocessing phase occurs after the model
(i.e. a set of descriptors) has been built based on
observations of the SPARQL endpoint, but before the GraphQL schema
is built.

It allows easy additions of various postprocessing activities on the model,
like modifying entities in ways which are not connected to model parsing.

An example of this is naming - simplified names are used for all named
entities to promote usability of the generated GraphQL endpoint.
Since the names are calculated from IRIs, this logic is decoupled from parsing,
and it can be easily modified or extended. You can even easily add your own
implementation as a new postprocessing hook, and switch it with the default
implementation as needed.

## Hooks

Postprocessing hooks are functions which are assignable to the `PostprocessingHook` interface:

```ts
export type PostprocessingHook<TDescriptor extends EntityDescriptor> = (
    descriptors: TDescriptor[],
) => void;
```

In other words, it's a function which takes a single parameter - the descriptors of a particular
type, and it returns nothing. For example, `PostprocessingHook<ClassDescriptor>` would
be run with the list of all `ClassDescriptor`s in the model. You can specify more generic
hook constraints, for example using `ResourceDescriptor` would run your hook
against all descriptors which have a display name property.

The contents of a hook will usually do one or more of the following things:

- Modify the given descriptors in some way
- Run some side effects which depend on the descriptor data
- Log something about the descriptors

You can run your own hooks by adding them in the `postprocessing` field of the root configuration
object. This field takes a `PostprocessingConfig`, and its `hooks` field contains a dictionary
containing the registered hooks for each descriptor type. These hooks are then automatically
executed as necessary.

> **_NOTE:_** it is recommended to use `DEFAULT_POSTPROCESSING_CONFIG`
as the basis for adding your new hooks, since it also contains a registered hook
for generating GraphQL identifiers for classes and properties. Only create a whole new
`PostprocessingHookDict` if you want to replace the functionality of the
`buildNamesFromIRIs` postprocessing hook included in this library.
