import { ENDPOINTS } from '../observation/endpoints';

// This file hosts various application configuration values separated from code

// Select which endpoint it will run on - you can define your own
// like so:
// export const ENDPOINT_TO_RUN = {
//    url: 'https://data.europa.eu/sparql',
//    name: 'European Data',
// }
export const ENDPOINT_TO_RUN = ENDPOINTS[0];

// If set to a value greater than zero,
// only that many classes will be thoroughly searched, i.e.
// their instances, properties and associations.
// Limiting this number will speed up observation greatly.
// However, skipped classes will be missing properties and relations.
export const EXAMINE_N_CLASSES = 0;

// The port which the application will run on
export const PORT = 4000;

// Show extra detailed logs, it's recommended to leave this disabled
// unless you know you need it.
export const DETAILED_LOG = false;
