# SPARQLess

Many government and non-government organizations today publish various datasets using Linked Data through SPARQL endpoints.
These datasets are often also available as JSON or RDF dumps, but having to write code to explore them can be cumbersome.
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

## Documentation

The documentation located [here](https://mff-uk.github.io/sparqless/)
includes installation and usage instructions, programmer and user guides, and much more.
