import { AssociationDescriptor } from '../models/association';
import { AttributeDescriptor } from '../models/attribute';
import { ClassDescriptor } from '../models/class';
import { EntityDescriptor } from '../models/entity';
import { InstanceDescriptor } from '../models/instance';
import { NamedEntityDescriptor } from '../models/named_entity';
import { PropertyDescriptor } from '../models/property';

export type PostprocessingHook<TDescriptor extends EntityDescriptor> = (
    descriptors: TDescriptor[],
) => void;

export interface PostprocessingHookDict {
    entity: PostprocessingHook<EntityDescriptor>[];
    namedEntity: PostprocessingHook<NamedEntityDescriptor>[];
    class: PostprocessingHook<ClassDescriptor>[];
    instance: PostprocessingHook<InstanceDescriptor>[];
    property: PostprocessingHook<PropertyDescriptor>[];
    association: PostprocessingHook<AssociationDescriptor>[];
    attribute: PostprocessingHook<AttributeDescriptor>[];
}
