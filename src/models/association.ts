import { ClassDescriptor } from './class';
import { PropertyDescriptor } from './property';

export interface AssociationDescriptor extends PropertyDescriptor {
    targetClass: ClassDescriptor;
}
