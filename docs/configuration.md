# Configuration

This page reviews and explains all available configuration options in SPARQLess. Before you explore the individual
configuration options, it is recommended that you familiarize
yourself with the basic concepts in SPARQLess described
[here](overview.md).

## Using the builder

The easiest way of building the SPARQLess `Config` object is by using the builder:

```ts
const config = new SPARQLessConfigBuilder()
    .sparqlEndpoint('https://data.gov.cz/sparql')
    .observation({
        observationsOutputPath: path.join(__dirname, '../../observations.ttl'),
    })
    .server({
        port: 4242,
    })
    .build();
```
You may of course create the `Config` object manually, but using the builder
lets you make use of pre-defined sane defaults, allowing you to only
specify the configuration values you care about.

The defaults specify a console logger and configure the server to run on port `4000`.
They also set many other settings to values deemed valuable for general use, such
as enabling [hot reloading](hot_reloading.md).

The rest of this document describes the values as present in the `Config` type,
but all of the information is also applicable to the builder.

## General configuration

The root configuration type is `Config`, which exposes the following properties:

```ts
interface Config {
    endpoint: SPARQLEndpointDefinition;
    logger?: winston.Logger;
    observation: ObservationConfig;
    postprocessing: PostprocessingConfig;
    schema?: SchemaConfig;
    server: ServerConfig;
    hotReload: HotReloadConfig;
    modelCheckpoint?: ModelCheckpointConfig;
}
```

The `endpoint` property is mandatory, since it contains the SPARQL endpoint
which you want SPARQLess to run against. An endpoint looks like this:

```ts
{
    url: 'https://dev.nkod.opendata.cz/sparql',
    name: 'NKOD',
}
```

There are other mandatory options, and so the recommended usage
is with the `SPARQLessConfigBuilder`, which specifies sane defaults.
You can then use the builder to configure individual options
as required, allowing you to leave some mandatory options
as their defaults.

It is also very highly recommended to configure a `logger`, since it is
very helpful to know what exactly is happening, since the bootstrapping
process can take a very long time. The logging framework of choice
is [winston](https://github.com/winstonjs/winston), so you are free to
pass in any winston logger. However, if you want a sensible default,
you can use the `DEFAULT_LOGGER` exposed by SPARQLess.
Again, the `SPARQLessConfigBuilder` uses this default logger automatically.

## Specialized configuration

The remaining configuration values are more specialized,
and they affect individual components of SPARQLess.

All of these options have sane default values when used with
the `SPARQLessConfigBuilder`, so it is
recommended to first try not defining them (and thereby
using the defaults). If you find that you want to adjust
the behavior of SPARQLess afterwards, then you can
look into modifying these values.

### Observation

The `observation` property of `Config` modified the endpoint observation phase,
and it can contain the following values:

```ts
interface ObservationConfig {
    maxPropertyCount: number | undefined;
    propertySampleSize: number | undefined;
    ontologyPrefixIri: string;
    shouldDetectNonArrayProperties: boolean | undefined;
    shouldCountProperties: boolean | undefined;
    observationsOutputPath: string | undefined;
}
```

`maxPropertyCount` sets a maximum number of properties to be examined
when performing observations which count or enumerate many properties.
Unless you *need* to have the most accurate schema in the GraphQL endpoint
from the very start, it is recommended to set this value. It will **significantly**
speed up observations on large datasets. A good default value is `1000`,
and for best results, combine this value with [hot reloading](hot_reloading.md),
where each iteration of hot reloading increases it by an order of magnitude.

When analyzing the range for each attribute and association,
a sample of up to `propertySampleSize` occurences is selected,
and their types are used to determine that property's type.
Setting `propertySampleSize` is highly recommended, with
a reasonable default being `100` or `1000`. While this setting
may in some rare cases lead to the generated schema missing
some return types for some properties, leaving it unlimited
may result in errors during observation for large datasets,
where the process is unable to allocate enough memory
to hold all of the observations.

`ontologyPrefixIri` sets the IRI for the ontology created during observation.
You should not need to modify this value from the default
`http://skodapetr.eu/ontology/sparql-endpoint/`, unless you wish to save the
observations themselves and use them for other purposes.

By default, all properties in the created GraphQL schema are arrays, since in RDF, any property can be specified multiple times. `shouldDetectNonArrayProperties` allows observations which flag properties as scalars, making sure that
properties are not flagged as arrays unless they can really contain multiple values.

The created GraphQL schema contains comments which have additional information
about the data, namely for each property, it specifies how many times it occurs
in the dataset. This can be helpful when first exploring the schema, and deciding
whether a property is important or not. Setting `shouldCountProperties` to `true`
will enable the counting of properties, otherwise their counts will be set to `0`.

It is recommended to initially set both `shouldCountProperties` and
`shouldDetectNonArrayProperties` to `false` to ensure fast startup time,
but to set them to `true` in the [hot reloading](hot_reloading.md) config.
That way, the necessary observations will be carried out in the background while
you can already explore and query the dataset.

If set, `observationsOutputPath` dictates the path to which the collected observations
should be written. They are saved as a [Turtle](https://en.wikipedia.org/wiki/Turtle_(syntax)) RDF file,
so a `.ttl` suffix is recommended. If this option is `undefined`, the observations will not
be saved to disk.

### Postprocessing

Read more about postprocessing [here](postprocessing.md).

### Schema

The schema configuration only contains one option:

```ts
interface SchemaConfig {
    graphqlSchemaOutputPath: string | undefined;
}
```

If you set `graphqlSchemaOutputPath` to a valid file path,
the generated GraphQL schema will be saved to this path
when it is generated. This can be useful if you want to use
some visualization tools to better aid you in exploring
the created GraphQL endpoint.

### Server

The server configuration contains one option:

```ts
interface ServerConfig {
    port: number;
}
```

The `port` option will configure the port where the GraphQL
endpoint will be available. The default value is 4000.
If you visit this port in the browser, you will get access
to an instance of Apollo Studio Explorer, which will let you
visually build GraphQL queries and examine the GraphQL schema.

### Model Checkpointing

Read more about model checkpointing
[here](model_checkpointing.md).

### Hot reload

Read more about hot reloading [here](hot_reloading.md).
