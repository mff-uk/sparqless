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

TODO: fix code file links

There is one required configuration step before you run the project - configuring
the SPARQL endpoint you want to run. In [config.ts](/src/api/config.ts), set the value
`ENDPOINT_TO_RUN` to refer to your endpoint. There is a pre-defined list of endpoints
in [endpoints.ts](/src/observation/endpoints.ts) in case you just want to try the project
without having a specific SPARQL endpoint in mind, but you can easily define your own like so:

```ts
export const ENDPOINT_TO_RUN = {
    url: 'https://data.europa.eu/sparql',
    name: 'European Data',
};
```

The `name` can be whatever you want, it's just an easily readable identifier used in logs.

There are other configuration values which you are free to modify, but they have sensible defaults
in case you just want to get started.

## Run it

After everything is configured, run `npm start` to start SPARQL2GraphQL.

In the logs, you will see that it will first run some observations on the target
endpoint to collect information about its schema and the data contained within.
This may take a while, especially for large datasets, depending on the configuration parameters used.

After observation is finished, you will see that a fully functional GraphQL interface is
available for you to explore at the configured port (http://localhost:4000 by default).
