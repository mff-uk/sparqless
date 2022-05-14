import path from 'path';
import { ENDPOINTS } from '../observation/endpoints';

// This file hosts various application configuration values separated from code

// Select which endpoint it will run on - you can define your own
// like so:
// export const ENDPOINT_TO_RUN = {
//    url: 'https://data.europa.eu/sparql',
//    name: 'European Data',
// }
export const ENDPOINT_TO_RUN = ENDPOINTS[0];

// If set, this no more than MAX_PROPERTY_COUNT instances of properties
// will be searched when counting properties. This can greatly speed up
// observation on very large datasets.
export const MAX_PROPERTY_COUNT: number | undefined = 1000;

// The port which the application will run on
export const PORT = 4000;

// Show extra detailed logs, it's recommended to leave this disabled
// unless you know you need it.
export const DETAILED_LOG = false;

// The IRI used as a prefix for the observation ontology
export const ONTOLOGY_PREFIX_IRI =
    'http://skodapetr.eu/ontology/sparql-endpoint/';

// If set, a generated GraphQL schema will be saved to the configured file.
export const GRAHPQL_SCHEMA_OUTPUT_PATH: string | undefined = path.join(
    __dirname,
    '../../../generated-schema.graphql',
);
