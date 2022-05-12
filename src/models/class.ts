import { AssociationDescriptor } from './association';
import { AttributeDescriptor } from './attribute';
import { InstanceDescriptor } from './instance';
import { NamedEntityDescriptor } from './named_entity';

export interface ClassDescriptor extends NamedEntityDescriptor {
    numberOfInstances: number;
    instances: InstanceDescriptor[];
    attributes: AttributeDescriptor[];
    associations: AssociationDescriptor[];
}
