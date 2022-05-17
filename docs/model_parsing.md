# Parsing

Observations made about a SPARQL endpoint are then parsed by
the `ObservationParser`. Its method `buildEndpointModel` receives
a list of observations as a parameter (in the form of `QueryResult[]`),
and it parses those observations into an object model describing
the data.

## Descriptors

The model is expressed in the form of **descriptors**, which are objects
storing metadata about various entities present in the dataset.
The descriptors are located in the `src/models/` folder.

These are the descriptors currently used:

- `EntityDescriptor`: Describes any entity with an IRI, which is basically
everything in the RDF world. Other descriptors inherit from this descriptor.
- `NamedEntityDescriptor`: Describes any entity which should also have
a human-readable and short name. It can be a bit cumbersome for humans
to constantly use IRIs to refer to things, so SPARQL2GraphQL makes this
easier by providing simplified names to display in the user interface.
- `ClassDescriptor`: Describes a single class present in the dataset.
- `InstanceDescriptor`: Describes a single instance of a class.
- `PropertyDescriptor`: Describes a property of a class (association
or attribute),
- `AssociationDescriptor`: Describes an association of a class, i.e.
a property whose range is another class.
- `AttributeDescriptor`: Describes an attribute of a class, i.e.
a property whose range is a primitive type.

## Parsing algorithm

For each type of observation, there is a method in the `ObservationParser`
which parses this observation into a descriptor object.

Therefore the parsing algorithm essentially consists of iterating
over the collected observations, choosing the correct parsing
function for each observation, and then executing the function.
