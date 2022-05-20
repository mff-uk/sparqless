import { AssociationDescriptor } from '../models/association';
import { AttributeDescriptor } from '../models/attribute';
import { ClassDescriptor } from '../models/class';
import { ResourceDescriptor } from '../models/resource';
import { PropertyDescriptor } from '../models/property';

export type PostprocessingHook<TDescriptor extends ResourceDescriptor> = (
    descriptors: TDescriptor[],
) => void;

export interface PostprocessingHookDict {
    resource: PostprocessingHook<ResourceDescriptor>[];
    class: PostprocessingHook<ClassDescriptor>[];
    property: PostprocessingHook<PropertyDescriptor>[];
    association: PostprocessingHook<AssociationDescriptor>[];
    attribute: PostprocessingHook<AttributeDescriptor>[];
}
