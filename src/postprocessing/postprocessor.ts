import {
    DEFAULT_POSTPROCESSING_CONFIG,
    PostprocessingConfig,
} from '../api/config';
import { DataModel } from '../models/data_model';
import { EntityDescriptor } from '../models/entity';
import { PostprocessingHook } from './hook_types';

/**
 * The postprocessing phase occurs after the object model has been
 * built using the observations. The model has the form of descriptors,
 * which describe various parts of the data model - classes, attributes,
 * associations etc.
 *
 * The `DescriptorPostprocessor` is responsible for running postprocessing
 * hooks - modular functions which modify parts of the object model.
 */
export class DescriptorPostprocessor {
    /**
     * Apply the postprocessing hooks to the given descriptors.
     *
     * @param model Data model describing the whole schema.
     * @param config Postprocessing configuration, including hooks to run.
     */
    postprocess(model: DataModel, config?: PostprocessingConfig): void {
        const hooks = config?.hooks ?? DEFAULT_POSTPROCESSING_CONFIG.hooks;
        const descriptors = model.descriptors;
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
