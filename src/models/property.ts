import { ResourceDescriptor } from './resource';

/**
 * Describes the existence of a property, i.e. a relation whose
 * domain is a class.
 */
export interface PropertyDescriptor extends ResourceDescriptor {
    count: number;
    isArray: boolean;
}
