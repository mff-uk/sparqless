import { AssociationDescriptor } from './association';
import { AttributeDescriptor } from './attribute';
import { ResourceDescriptor } from './resource';

/**
 * Describes the existence of a class.
 */
export interface ClassDescriptor extends ResourceDescriptor {
    numberOfInstances: number;
    attributes: AttributeDescriptor[];
    associations: AssociationDescriptor[];
}
