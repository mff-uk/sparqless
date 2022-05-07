import { ClassDescriptor } from '../models/class';
import { EntityDescriptor } from '../models/entity';
import { PostprocessingHook, PostprocessingHookDict } from './hook_types';

export class DescriptorPostprocessor {
    /**
     * Apply the postprocessing hooks to the given descriptors.
     *
     * @param descriptors Class descriptors containing the whole schema.
     * @param hooks Postprocessing hooks to run.
     */
    postprocess(
        descriptors: ClassDescriptor[],
        hooks: PostprocessingHookDict,
    ): void {
        this.runHooks(descriptors, hooks.entity);
        this.runHooks(descriptors, hooks.namedEntity);
        this.runHooks(descriptors, hooks.class);

        for (const classDescriptor of descriptors) {
            this.runHooks(classDescriptor.instances, hooks.entity);
            this.runHooks(classDescriptor.instances, hooks.instance);

            this.runHooks(
                [
                    ...classDescriptor.associations,
                    ...classDescriptor.attributes,
                ],
                hooks.entity,
            );
            this.runHooks(
                [
                    ...classDescriptor.associations,
                    ...classDescriptor.attributes,
                ],
                hooks.namedEntity,
            );
            this.runHooks(
                [
                    ...classDescriptor.associations,
                    ...classDescriptor.attributes,
                ],
                hooks.property,
            );

            this.runHooks(classDescriptor.associations, hooks.association);
            this.runHooks(classDescriptor.attributes, hooks.attribute);
        }
    }

    private runHooks<TDescriptor extends EntityDescriptor>(
        descriptors: TDescriptor[],
        hooks: PostprocessingHook<TDescriptor>[],
    ): void {
        for (const hook of hooks) {
            hook(descriptors);
        }
    }
}
