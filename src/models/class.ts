import { AssociationDescriptor } from './association';
import { AttributeDescriptor } from './attribute';
import { InstanceDescriptor } from './instance';

export interface ClassDescriptor {
    iri: string;
    name: string; // GraphQL friendly name - only contains [_a-zA-Z0-9]
    numberOfInstances: number;
    instances: InstanceDescriptor[];
    attributes: AttributeDescriptor[];
    associations: AssociationDescriptor[];
}
