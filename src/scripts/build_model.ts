import { ENDPOINTS } from '../observation/endpoints';
import { EndpointObserver } from '../observation/observer';
import { ObservationParser } from '../parsing/parser';

// Debug script for testing observations and parsing

const obs = new EndpointObserver();
const parser = new ObservationParser();
obs.observeEndpoint(ENDPOINTS[6], 10).then((results) => {
    const model = parser.buildEndpointModel(results);

    console.log(`Done! Model has ${model.length} class descriptors.`);
});
// obs.observeAllEndpoints().then((results) => {
//     console.log('Really done!');
// });
