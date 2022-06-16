# SPARQLess

Many government and non-government organizations today publish various datasets using Linked Data through SPARQL endpoints.
These datasets are often also available as JSON or RDF dumps, but having to write code to explore and query them can be cumbersome.
SPARQLess (/_spark less_/) aims to make it easier to use these datasets by providing a tool which will give developers a more
friendly interface which they likely already know how to use - [GraphQL](https://graphql.org/learn/).

SPARQLess is a library which is able to discover the schema of data within a SPARQL endpoint,
and subsequently construct an equivalent GraphQL schema.
This schema discovery works even in the absence of explicit metadata like RDFS or OWL,
and so it is relevant for most RDF datasets.
It then uses the generated GraphQL schema to host a GraphQL server, which processes incoming
queries by translating them into SPARQL queries and querying the underlying SPARQL endpoint.
SPARQLess does not currently support mutations, it provides a read-only view of the data.

Simply configure SPARQLess with the URL of a SPARQL endpoint which has some data which interests you, and
let it do its magic. Soon, you will have a GraphQL instance which you can use to painlessly explore and query the data.

## Running it in Docker

The easiest way to use SPARQLess is to use the provided Docker image.
This method lets you use SPARQLess as a black box which magically converts your SPARQL
endpoint into a GraphQL one.

```bash
# Pull the Docker image from GitHub Container Registry to run a Docker container named `sparqless`.
# The `-p` option binds port 4000 on the container to port 4000 on the local machine.
# This is the port which the created GraphQL server will run on.
# You can add the `-d` option to run the container detached from your terminal.
docker run \
    -it --init \
    --name sparqless \
    -p 4000:4000 \
    -e SPARQL_ENDPOINT="https://data.gov.cz/sparql" \
    ghcr.io/mff-uk/sparqless:latest
```

The created container could take up to tens of minutes to do its job on large datasets.
Eventually, you will see a log message that the GraphQL endpoint is ready.
When that happens, visit [http://localhost:4000/](http://localhost:4000/) and start using
your new GraphQL endpoint!

You can learn more about using SPARQLess in a Docker container [here](docker.md).

## Using the library in code

Alternatively, you may wish to use SPARQLess as a JavaScript/TypeScript library.
SPARQLess aims to be both simple to use and extensible. A minimal usage looks like this:

```ts
const config = new SPARQLessConfigBuilder()
    .sparqlEndpoint('https://data.gov.cz/sparql')
    .build();

const sparqless = new SPARQLess();
await sparqless.buildSchemaAndRunEndpoint(config);
```

## Documentation

If you want to find out more about using SPARQLess, please visit the documentation located
[here](https://mff-uk.github.io/sparqless/). It includes installation and usage instructions,
programmer and user guides, an in-depth explanation of how SPARQLess works and much more.
