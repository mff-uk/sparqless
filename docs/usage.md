# Usage guide

This page will explain how to set up SPARQL2GraphQL for a given SPARQL endpoint, step-by-step.

## Installing dependencies

The project is written in TypeScript and uses Node.js as its runtime.

You will need to have the following installed before you proceed with usage:

- Node 16.13.0 (Gallium LTS) - easily managed with [nvm](https://github.com/nvm-sh/nvm)
- npm

Once you have installed them, run `npm install` in the project root directory to install
all required dependencies with npm.

## Edit configuration

There is one required configuration step before you run the project - configuring
the SPARQL endpoint you want to run. In `src/api/config.ts`, set the value
`ENDPOINT_TO_RUN` to refer to your endpoint. There is a pre-defined list of endpoints
in `src/observation/endpoints.ts` in case you just want to try the project
without having a specific SPARQL endpoint in mind, but you can easily define your own like so:

```ts
export const ENDPOINT_TO_RUN = {
    url: 'https://data.europa.eu/sparql',
    name: 'European Data',
};
```

The `name` can be whatever you want, it's just an easily readable identifier used in logs.

There are other configuration values which you are free to modify, but they have
sensible defaults in case you just want to get started. If you want to find out
more about additional configuration options, variables are documented in the
configuration files itself. More advanced configuration options like postprocessing
hooks are also available, you can read more about them [here](postprocessing.md).

## Run it

After everything is configured, run `npm start` to start SPARQL2GraphQL.

In the logs, you will see that it will first run some observations on the target
endpoint to collect information about its schema and the data contained within.
This may take a while, especially for large datasets, depending on the configuration
parameters used.

After observation is finished, you will see that a fully functional GraphQL interface is
available for you to explore at the configured port ([localhost:4000](http://localhost:4000)
by default).

## Explore the schema

When you open the GraphQL interface in your browser, you will see an interface
provided by Apollo Server. It allows you to explore the schema including all of the available
classes, as well as their properties, relations, how many times they occur in the dataset
and other metadata.

![GraphQL interface](img/interface.png)

The interface also allows you to interactively build and execute queries against the endpoint.

## Query the endpoint

**TODO:** WRITE THIS SECTION AFTER IMPLEMENTING QUERYING
