import { ResourceDescriptor } from './resource';

export interface PropertyDescriptor extends ResourceDescriptor {
    count: number;
    isArray: boolean;
}
