# SPARQLess

Many government and non-government organizations today publish various datasets using Linked Data through SPARQL endpoints.
These datasets are often also available as JSON or RDF dumps, but having to write code to explore and query them can be cumbersome.
SPARQLess (/_spark less_/) aims to make it easier to use these datasets by providing a tool which will give developers a more
friendly interface which they likely already know how to use - [GraphQL](https://graphql.org/learn/).

Simply configure SPARQLess with the URL of a SPARQL endpoint which has some data which interests you, and
let it do its magic. Soon, you will have a GraphQL instance which you can use to painlessly explore and query the data.

## Running it in Docker

The easiest way to use SPARQLess is to use the provided Dockerfile to run it as a Docker container.
This method lets you use SPARQLess as a black box which magically converts your SPARQL
endpoint into a GraphQL one.

```bash
# Build the Docker image and name it `sparqless:local`.
docker build -t sparqless:local .

# Use the `sparqless:local` image to run a Docker container named `sparqless`.
# The `-p` option binds port 4000 on the container to port 4000 on the local machine.
# This is the port which the created GraphQL server will run on.
# You can add the `-d` option to run the container detached from your terminal.
docker run \
    -it --init \
    --name sparqless \
    -p 4000:4000 \
    -e SPARQL_ENDPOINT="https://data.gov.cz/sparql" \
    sparqless:local
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

If you want to get started right away, check out the [usage guide](usage.md).

If you want to find out how it works, find that out [here](overview.md).

If you wish to tinker with the project's code, or even contribute to it, [here](development.md) is a development
handbook.
