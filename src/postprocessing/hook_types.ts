import { AssociationDescriptor } from '../models/association';
import { AttributeDescriptor } from '../models/attribute';
import { ClassDescriptor } from '../models/class';
import { ResourceDescriptor } from '../models/resource';
import { PropertyDescriptor } from '../models/property';

/**
 * A function which can be used as a postprocessing hook.
 *
 * Please refer to the postprocessing documentation
 * [here](https://yawnston.github.io/sparql2graphql/postprocessing/)
 * to learn more.
 */
export type PostprocessingHook<TDescriptor extends ResourceDescriptor> = (
    descriptors: TDescriptor[],
) => void;

/**
 * A dictionary containing postprocessing hooks separated
 * by their category.
 */
export interface PostprocessingHookDict {
    resource: PostprocessingHook<ResourceDescriptor>[];
    class: PostprocessingHook<ClassDescriptor>[];
    property: PostprocessingHook<PropertyDescriptor>[];
    association: PostprocessingHook<AssociationDescriptor>[];
    attribute: PostprocessingHook<AttributeDescriptor>[];
}
