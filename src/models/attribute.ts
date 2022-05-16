import { PropertyDescriptor } from './property';

export interface AttributeDescriptor extends PropertyDescriptor {
    types: string[];
    languages: string[];
}
