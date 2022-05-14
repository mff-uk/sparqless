import { ENDPOINTS } from '../observation/endpoints';
import { AssociationObserver } from '../observation/observers/association';
import { AttributeObserver } from '../observation/observers/attribute';
import { ClassObserver } from '../observation/observers/class';
import { InstanceObserver } from '../observation/observers/instance';
import { PropertyObserver } from '../observation/observers/property';
import { PropertyCountObserver } from '../observation/observers/property_count';
import { ObserverManager } from '../observation/observer_manager';
import { ObservationParser } from '../parsing/parser';

// Debug script for testing observations and parsing

const observerManager = new ObserverManager({ endpoint: ENDPOINTS[6] });
observerManager.subscribeInit(new ClassObserver());
observerManager.subscribe(new InstanceObserver());
observerManager.subscribe(new PropertyObserver());
observerManager.subscribe(new AttributeObserver());
observerManager.subscribe(new AssociationObserver());
observerManager.subscribe(new PropertyCountObserver());

observerManager.runObservers().then((observations) => {
    const parser = new ObservationParser();
    const model = parser.buildEndpointModel(observations);
    console.log(`Done! Model has ${model.length} class descriptors.`);
});
