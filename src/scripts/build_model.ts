import { ENDPOINTS } from '../observation/endpoints';
import { EndpointObserver } from '../observation/observer';
import { ObservationParser } from '../parsing/parser';

// Debug script for testing observations and parsing

const obs = new EndpointObserver();
const parser = new ObservationParser();
obs.observeEndpoint(ENDPOINTS[6], 10).then((observations) => {
    const model = parser.buildEndpointModel(observations);

    console.log(`Done! Model has ${model.length} class descriptors.`);
});
