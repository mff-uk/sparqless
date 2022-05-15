# SPARQL2GrahpQL

Many government and non-government organizations today publish various datasets using Linked Data through SPARQL endpoints.
These datasets are often also available as JSON or RDF dumps, but having to write code to explore them can be cumbersome.
SPARQL2GraphQL aims to make it easier to use these datasets by providing a tool which will give developers a more
friendly interface which they likely already know how to use - [GraphQL](https://graphql.org/learn/).

Simply configure SPARQL2GraphQL with the URL of a SPARQL endpoint which has some data which interests you, and
let it do its magic. Soon, you will have a GraphQL instance which you can use to painlessly explore and query the data.

If you want to get started right away, check out the [usage guide](usage.md).

If you want to find out how it works, find that out [here](overview.md).

If you wish to tinker with the project's code, or even contribute to it, [here](development.md) is a development
handbook.
