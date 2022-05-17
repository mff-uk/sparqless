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

You can add your hooks in the `src/postprocessing/hooks` directory, preferably
putting one hook per each code file.

Including your hook in the code is then as easy as editing `src/postprocessing/registered_hooks.ts`,
and registering your hook in the `getRegisteredPostprocessingHooks()` function. And that's it!
Your hook will now automatically be run the next time you run the app.
