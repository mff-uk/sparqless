import { ClassDescriptor } from './class';
import { PropertyDescriptor } from './property';

/**
 * Describes the existence of an association, which is a kind of
 * property whose range contains other classes.
 */
export interface AssociationDescriptor extends PropertyDescriptor {
    targetClasses: ClassDescriptor[];
}
