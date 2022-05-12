# Observation

When the application is configured, the user runs the app. Then the application
starts observing the SPARQL endpoint, and collecting observations in the form
of RDF quads (stored in the `QueryResult` type). These quads are generally
constructed to have a blank node subject representing a single observation,
and its properties then describe that observation. The following is an
example of quads describing the existence of a class in the dataset
(`_:observation` denotes a blank node):

```rdf
_:observation
   se:class foaf:Agent;
   se:numberOfInstances 42.
```

**TODO: make this more ontology-oriented**

This particular observation says that the dataset contains a class called
`foaf:Agent` which has 42 instances.

## Collected observations

The queries used to collect observations are stored in the `QueryBuilder` class.
Currently, there are 5 of them:

- `CLASSES_AND_INSTANCE_NUMBERS`: Find classes and how many of them there are.
- `CLASS_INSTANCES`: Find instances of a class for further examination.
- `INSTANCE_ATTRIBUTES`: Get attributes of an instance (attributes are properties
which have simple types as their domain, like `boolean` or `number`).
- `INSTANCE_ASSOCIATIONS`: Get associations of an instance (associations are
properties which relate to another class).
- `NUMBER_OF_INSTANCE_PROPERTIES`: Collect information about how many instances
there are of various class properties.

This list is bound to change in the future, but the goal is to not modify
the existing queries if possible, but rather add new ones.
