import { ClassDescriptor } from './class';

export interface AssociationDescriptor {
    iri: string;
    name: string; // GraphQL friendly name - only contains [_a-zA-Z0-9]
    targetClass: ClassDescriptor;
    count: number;
}
